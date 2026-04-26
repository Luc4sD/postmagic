/**
 * src/routes/webhook.js
 *
 * POST /api/pagamento/webhook
 *
 * O Mercado Pago chama esta rota silenciosamente toda vez que
 * o status de um pagamento ou assinatura muda.
 *
 * FLUXO COMPLETO:
 *   MP aprova pagamento
 *     → chama este webhook com { type: "payment", data: { id: "123" } }
 *     → buscamos o pagamento via API do MP para confirmar o status
 *     → se "approved": adicionamos créditos no Supabase
 *     → retornamos 200 → MP para de retentar
 *
 * RETENTATIVAS:
 *   MP retenta o webhook se não receber 200 em até 22 segundos.
 *   Retenta por até 3 dias com backoff exponencial.
 *   Por isso precisamos de idempotência (não creditar 2x o mesmo pagamento).
 */

import express from "express";
import { Payment, PreApproval } from "mercadopago";
import { mp } from "../config/mercadopago.js";
import { grantCredits, updatePaymentStatus, supabase } from "../config/supabase.js";
import { PRODUCTS } from "../config/products.js";

const router = express.Router();

// Créditos concedidos por renovação de assinatura mensal
const SUBSCRIPTION_CREDITS = PRODUCTS.mensal.credits; // 100

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/pagamento/webhook — O MP valida a URL com um GET antes de ativar
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", (_req, res) => {
  res.json({ status: "PostMagic Webhook OK" });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/pagamento/webhook — Recebe notificações do MP
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  // Responde 200 IMEDIATAMENTE para o MP não retentar por timeout
  // O processamento acontece depois, mas o MP já está satisfeito
  res.status(200).json({ received: true });

  // Processa de forma assíncrona (sem bloquear a resposta)
  processWebhook(req.body).catch((err) => {
    console.error("[WEBHOOK] Erro no processamento assíncrono:", err.message);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Processamento principal do webhook
// ─────────────────────────────────────────────────────────────────────────────
async function processWebhook(body) {
  const { type, data } = body;

  console.log(`[WEBHOOK] Recebido — tipo: "${type}" | id: "${data?.id}"`);

  // O MP envia vários tipos de notificação — tratamos apenas os relevantes
  switch (type) {
    case "payment":
      // Pagamento avulso (Checkout Pro)
      await handlePaymentNotification(data?.id);
      break;

    case "subscription_preapproval":
      // Assinatura recorrente criada/renovada/cancelada
      await handleSubscriptionNotification(data?.id);
      break;

    default:
      // merchant_order, point_integration_wh, etc — ignoramos
      console.log(`[WEBHOOK] Tipo ignorado: "${type}"`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Pagamento avulso
// ─────────────────────────────────────────────────────────────────────────────
async function handlePaymentNotification(paymentId) {
  if (!paymentId) {
    console.warn("[WEBHOOK] Notificação de pagamento sem ID.");
    return;
  }

  // ── Passo 1: Busca o pagamento na API do MP para confirmar o status ────────
  // NUNCA confie apenas no body do webhook — sempre consulte a API
  const paymentClient = new Payment(mp);
  let payment;

  try {
    payment = await paymentClient.get({ id: String(paymentId) });
  } catch (err) {
    console.error(`[WEBHOOK] Erro ao buscar pagamento ${paymentId}:`, err.message);
    return;
  }

  console.log(
    `[WEBHOOK] Pagamento ${paymentId} — status: "${payment.status}" | ` +
    `valor: R$ ${payment.transaction_amount}`
  );

  // ── Passo 2: Idempotência — verifica se já processamos este pagamento ──────
  const { data: existing } = await supabase
    .from("payments")
    .select("id, status")
    .eq("mp_payment_id", String(paymentId))
    .maybeSingle(); // maybeSingle retorna null se não encontrar (sem erro)

  if (existing?.status === "approved") {
    console.log(`[WEBHOOK] Pagamento ${paymentId} já processado. Ignorando.`);
    return;
  }

  // ── Passo 3: Atualiza o status no banco independente do resultado ──────────
  // (mesmo que recusado, queremos rastrear)
  const preferenceId = payment.order?.id
    ? String(payment.order.id)
    : payment.preference_id; // fallback

  await updatePaymentStatus({
    mpPaymentId:    String(paymentId),
    mpPreferenceId: preferenceId ?? "",
    status:         payment.status ?? "unknown",
    creditsGranted: payment.status === "approved" ? (payment.metadata?.credits ?? 0) : 0,
  }).catch((err) => {
    // Não é fatal — o pagamento pode ainda não ter preferência registrada
    console.warn("[WEBHOOK] updatePaymentStatus:", err.message);
  });

  // ── Passo 4: Concede créditos SOMENTE para pagamentos aprovados ────────────
  if (payment.status !== "approved") {
    console.log(`[WEBHOOK] Status não é "approved" (${payment.status}). Nada a fazer.`);
    return;
  }

  // Extrai os metadados que definimos na criação da preferência
  const meta         = payment.metadata ?? {};
  const clerkUserId  = meta.clerk_user_id;
  const credits      = Number(meta.credits ?? 0);
  const plan         = meta.product ?? "avulso";

  // Validação de segurança dos metadados
  if (!clerkUserId) {
    console.error(`[WEBHOOK] CRÍTICO: clerk_user_id ausente no pagamento ${paymentId}.`);
    console.error("[WEBHOOK] Metadados recebidos:", JSON.stringify(meta));
    // TODO: enviar alerta (Slack/email) — crédito precisa ser adicionado manualmente
    return;
  }

  if (credits <= 0) {
    console.error(`[WEBHOOK] Créditos inválidos (${credits}) no pagamento ${paymentId}.`);
    return;
  }

  // ── Passo 5: Adiciona créditos via função SQL atômica ─────────────────────
  await grantCredits({
    clerkUserId,
    credits,
    plan,
    mpPaymentId:  String(paymentId),
    paymentType:  "one_time",
  });

  console.log(
    `[WEBHOOK] ✅ SUCESSO — +${credits} créditos (plano "${plan}") → usuário ${clerkUserId}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Assinatura recorrente (PreApproval)
// ─────────────────────────────────────────────────────────────────────────────
async function handleSubscriptionNotification(subscriptionId) {
  if (!subscriptionId) {
    console.warn("[WEBHOOK] Notificação de assinatura sem ID.");
    return;
  }

  const preApprovalClient = new PreApproval(mp);
  let subscription;

  try {
    subscription = await preApprovalClient.get({ id: String(subscriptionId) });
  } catch (err) {
    console.error(`[WEBHOOK] Erro ao buscar assinatura ${subscriptionId}:`, err.message);
    return;
  }

  // external_reference é o clerkUserId que definimos na criação
  const clerkUserId = subscription.external_reference;
  const status      = subscription.status; // authorized | paused | cancelled

  console.log(
    `[WEBHOOK] Assinatura ${subscriptionId} — status: "${status}" | user: ${clerkUserId}`
  );

  if (!clerkUserId) {
    console.error(`[WEBHOOK] CRÍTICO: external_reference ausente na assinatura ${subscriptionId}`);
    return;
  }

  if (status === "authorized") {
    // ── Assinatura nova ou renovação mensal ───────────────────────────────────
    // Idempotência: verifica se esta assinatura já foi processada com este status
    const { data: user } = await supabase
      .from("users")
      .select("mp_subscription_id, subscription_status")
      .eq("clerk_user_id", clerkUserId)
      .single();

    const isNewSubscription = user?.mp_subscription_id !== subscriptionId;
    const isRenewal =
      user?.mp_subscription_id === subscriptionId &&
      user?.subscription_status === "authorized";

    if (!isNewSubscription && !isRenewal) {
      console.log(`[WEBHOOK] Assinatura ${subscriptionId} já registrada e não é renovação.`);
      return;
    }

    // Calcula próxima data de cobrança
    const nextBillingDate = subscription.next_payment_date
      ? new Date(subscription.next_payment_date)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 dias como fallback

    // Ativa/renova a assinatura via função SQL atômica
    const { error } = await supabase.rpc("activate_subscription", {
      p_clerk_user_id:       clerkUserId,
      p_mp_subscription_id:  subscriptionId,
      p_credits:             SUBSCRIPTION_CREDITS,
      p_next_billing_date:   nextBillingDate.toISOString(),
      p_mp_payment_id:       `sub_${subscriptionId}_${Date.now()}`,
    });

    if (error) {
      console.error("[WEBHOOK] Erro ao ativar assinatura:", error.message);
      return;
    }

    console.log(
      `[WEBHOOK] ✅ Assinatura ${isNewSubscription ? "NOVA" : "RENOVADA"} — ` +
      `+${SUBSCRIPTION_CREDITS} créditos → ${clerkUserId}`
    );

  } else if (status === "cancelled" || status === "paused") {
    // ── Assinatura cancelada ou pausada ───────────────────────────────────────
    // NÃO remove os créditos já concedidos — só atualiza o status
    await supabase
      .from("users")
      .update({
        is_subscribed:       status === "paused" ? true : false,
        subscription_status: status,
        updated_at:          new Date().toISOString(),
      })
      .eq("clerk_user_id", clerkUserId);

    console.log(`[WEBHOOK] Assinatura ${status.toUpperCase()} para ${clerkUserId}`);
  }
}

export { router as webhookRouter };
