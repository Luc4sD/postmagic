/**
 * src/config/supabase.js
 *
 * Cliente Supabase com SERVICE ROLE KEY.
 * Esta chave bypassa o RLS — use SOMENTE no backend.
 */

import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "[Supabase] SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env"
  );
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Busca um usuário pelo clerk_user_id.
 * Retorna null se não encontrado (sem lançar erro).
 */
export async function findUser(clerkUserId) {
  const { data, error } = await supabase
    .from("users")
    .select("id, clerk_user_id, email, credits_balance, is_subscribed, plan")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error?.code === "PGRST116") return null; // Not found — não é um erro fatal
  if (error) throw new Error(`findUser: ${error.message}`);
  return data;
}

/**
 * Garante que o usuário existe no banco (cria se for a primeira vez).
 */
export async function upsertUser({ clerkUserId, email, name }) {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        clerk_user_id: clerkUserId,
        email,
        name,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id" }
    )
    .select()
    .single();

  if (error) throw new Error(`upsertUser: ${error.message}`);
  return data;
}

/**
 * Adiciona créditos ao usuário de forma atômica via função SQL.
 * Usa a função grant_credits_and_plan() definida no schema.
 */
export async function grantCredits({ clerkUserId, credits, plan, mpPaymentId, paymentType }) {
  const { error } = await supabase.rpc("grant_credits_and_plan", {
    p_clerk_user_id:  clerkUserId,
    p_credits:        credits,
    p_plan:           plan,
    p_mp_payment_id:  mpPaymentId,
    p_payment_type:   paymentType,
  });

  if (error) throw new Error(`grantCredits: ${error.message}`);
}

/**
 * Registra um pagamento pendente antes do usuário ir ao checkout.
 * Atualizado pelo webhook quando o status mudar.
 */
export async function createPaymentRecord({
  clerkUserId,
  mpPreferenceId,
  plan,
  amountCents,
  paymentType,
}) {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      clerk_user_id:    clerkUserId,
      mp_preference_id: mpPreferenceId,
      plan,
      amount_cents:     amountCents,
      payment_type:     paymentType,
      status:           "pending",
    })
    .select()
    .single();

  if (error) throw new Error(`createPaymentRecord: ${error.message}`);
  return data;
}

/**
 * Atualiza o status de um pagamento pelo mp_payment_id.
 */
export async function updatePaymentStatus({ mpPaymentId, mpPreferenceId, status, creditsGranted }) {
  const { error } = await supabase
    .from("payments")
    .update({
      mp_payment_id:   mpPaymentId,
      status,
      credits_granted: creditsGranted ?? 0,
      updated_at:      new Date().toISOString(),
    })
    .eq("mp_preference_id", mpPreferenceId);

  if (error) throw new Error(`updatePaymentStatus: ${error.message}`);
}
