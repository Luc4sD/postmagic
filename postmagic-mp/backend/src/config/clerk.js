/**
 * src/config/clerk.js
 *
 * Configuração do Clerk para webhooks e validação de tokens.
 * Usa Svix para validar assinaturas dos webhooks.
 */

import { Webhook } from "svix";

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error(
    "[Clerk] CLERK_SECRET_KEY não encontrado no .env. " +
    "Este é o webhook secret do Clerk (não confundir com CLERK_API_KEY)."
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// Validar webhook do Clerk usando Svix
// ───────────────────────────────────────────────────────────────────────────────
export async function validateClerkWebhook(req) {
  const payload = await req.text();
  const headers = req.headers;

  const wh = new Webhook(process.env.CLERK_SECRET_KEY);

  try {
    const msg = wh.verify(payload, headers);
    return msg;
  } catch (err) {
    console.error("[Clerk Webhook] ❌ Validação falhou:", err.message);
    throw new Error("Webhook signature invalid");
  }
}

console.log("[Clerk] SDK inicializado — webhooks protegidos com Svix");
