/**
 * src/routes/checkout.js
 *
 * POST /api/pagamento/checkout
 *
 * Recebe o produto desejado, cria a preferência no Mercado Pago
 * e devolve o link de pagamento (init_point) para o frontend.
 *
 * Body JSON esperado:
 * {
 *   "product":      "avulso" | "mensal",
 *   "clerkUserId":  "user_xxxxx",          ← vem do Clerk no frontend
 *   "userEmail":    "cliente@email.com",
 *   "userName":     "João Silva"
 * }
 */

import express from "express";
import { Preference, PreApprovalPlan, PreApproval } from "mercadopago";
import { mp } from "../config/mercadopago.js";
import { getProduct } from "../config/products.js";
import { upsertUser, createPaymentRecord } from "../config/supabase.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/pagamento/checkout
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { product: productKey, clerkUserId, userEmail, userName } = req.body;

    // ── Validação de entrada ─────────────────────────────────────────────────
    if (!productKey || !clerkUserId || !userEmail) {
      return res.status(400).json({
        error: "Campos obrigatórios: product, clerkUserId, userEmail",
      });
    }

    // ── Busca/valida o produto ───────────────────────────────────────────────
    let product;
    try {
      product = getProduct(productKey);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    // ── Garante o usuário no Supabase ────────────────────────────────────────
    await upsertUser({
      clerkUserId,
      email: userEmail,
      name:  userName || "",
    });

    // ── Roteia para o tipo correto de checkout ───────────────────────────────
    if (product.type === "one_time") {
      return await handleOneTimeCheckout({ res, product, clerkUserId, userEmail, userName });
    }

    if (product.type === "subscription") {
      return await handleSubscriptionCheckout({ res, product, clerkUserId, userEmail });
    }

    return res.status(400).json({ error: "Tipo de produto desconhecido." });

  } catch (err) {
    console.error("[CHECKOUT] Erro inesperado:", err.message);
    res.status(500).json({ error: "Erro interno ao criar checkout." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PAGAMENTO ÚNICO — Checkout Pro (PIX + Cartão)
// ─────────────────────────────────────────────────────────────────────────────
async function handleOneTimeCheckout({ res, product, clerkUserId, userEmail, userName }) {
  const prefClient = new Preference(mp);

  const preferenceBody = {
    items: [
      {
        id:          product.id,
        title:       product.title,
        description: product.description,
        quantity:    1,
        unit_price:  product.price,
        currency_id: product.currency,
      },
    ],

    payer: {
      name:  userName || "",
      email: userEmail,
    },

    // ── URLs de retorno (usuário vê estas páginas após pagar) ────────────────
    back_urls: {
      success: `${process.env.FRONTEND_URL}/sucesso?product=${product.plan}&type=avulso`,
      failure: `${process.env.FRONTEND_URL}/precos?erro=pagamento_recusado`,
      pending: `${process.env.FRONTEND_URL}/sucesso?product=${product.plan}&status=pendente`,
    },
    auto_return: "approved", // redireciona automaticamente em caso de sucesso

    // ── Webhook — MP chama esta URL quando o status mudar ────────────────────
    // Em dev: use ngrok. Em produção: URL real com HTTPS.
    notification_url: `${process.env.BACKEND_URL || "http://localhost:3001"}/api/pagamento/webhook`,

    // ── Metadados — recuperados no webhook para identificar o usuário ────────
    metadata: {
      clerk_user_id: clerkUserId,
      product:       product.plan,
      credits:       product.credits,
      type:          "one_time",
    },

    // ── Meios de pagamento ───────────────────────────────────────────────────
    payment_methods: {
      excluded_payment_types: [
        { id: "ticket" },  // exclui boleto bancário
        { id: "atm" },     // exclui caixas eletrônicos
      ],
      installments: 1,     // sem parcelamento — simplifique para começar
    },

    // ── Expiração da preferência (24 horas) ──────────────────────────────────
    expires:              true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to:   new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),

    // statement_descriptor: "POSTMAGIC", // texto na fatura do cartão (opcional)
  };

  // Cria a preferência no MP
  const preference = await prefClient.create({ body: preferenceBody });

  // Salva o pagamento como "pendente" no Supabase para auditoria
  await createPaymentRecord({
    clerkUserId,
    mpPreferenceId: preference.id,
    plan:           product.plan,
    amountCents:    Math.round(product.price * 100),
    paymentType:    "one_time",
  });

  console.log(`[CHECKOUT] Preferência criada: ${preference.id} → ${clerkUserId}`);

  // Retorna os dois links: produção e sandbox (teste)
  return res.json({
    type:         "one_time",
    preferenceId: preference.id,
    // Use init_point em produção; sandbox_init_point para testes
    checkoutUrl:  preference.init_point,
    sandboxUrl:   preference.sandbox_init_point,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSINATURA RECORRENTE — PreApproval (cobrança mensal automática)
// ─────────────────────────────────────────────────────────────────────────────
async function handleSubscriptionCheckout({ res, product, clerkUserId, userEmail }) {
  const preApprovalClient = new PreApproval(mp);

  const subscriptionBody = {
    reason:      product.title,
    payer_email: userEmail,

    auto_recurring: {
      frequency:          product.frequency,       // 1
      frequency_type:     product.frequencyType,   // "months"
      transaction_amount: product.price,           // 19.90
      currency_id:        product.currency,        // "BRL"
    },

    back_url: `${process.env.FRONTEND_URL}/sucesso?product=${product.plan}&type=subscription`,

    // external_reference: identifica o usuário nas notificações de assinatura
    external_reference: clerkUserId,

    // Webhook de assinaturas
    notification_url: `${process.env.BACKEND_URL || "http://localhost:3001"}/api/pagamento/webhook`,

    status: "pending", // o usuário precisa confirmar o pagamento
  };

  const subscription = await preApprovalClient.create({ body: subscriptionBody });

  await createPaymentRecord({
    clerkUserId,
    mpPreferenceId: subscription.id,
    plan:           product.plan,
    amountCents:    Math.round(product.price * 100),
    paymentType:    "subscription_new",
  });

  console.log(`[CHECKOUT] Assinatura criada: ${subscription.id} → ${clerkUserId}`);

  return res.json({
    type:           "subscription",
    subscriptionId: subscription.id,
    checkoutUrl:    subscription.init_point, // link para o usuário assinar
  });
}

export { router as checkoutRouter };
