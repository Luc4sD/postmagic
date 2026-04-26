/**
 * src/routes/clerk-webhook.js
 *
 * Webhook do Clerk → sincroniza usuários com Supabase.
 *
 * Eventos capturados:
 * - user.created: usuário se registrou no Clerk
 * - user.updated: usuário atualizou perfil (não sincroniza com Supabase)
 * - user.deleted: usuário foi deletado (não sincroniza)
 *
 * Fluxo:
 * 1. Clerk envia evento via webhook (assinado com Svix)
 * 2. Validamos a assinatura com validateClerkWebhook()
 * 3. Se for user.created, inserimos em supabase.users
 * 4. Usuário recebe 3 créditos iniciais
 */

import express from "express";
import { validateClerkWebhook } from "../config/clerk.js";
import { supabase } from "../config/supabase.js";

export const clerkWebhookRouter = express.Router();

// ───────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/clerk
// ───────────────────────────────────────────────────────────────────────────────

clerkWebhookRouter.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  console.log("[Webhook Clerk] 📩 Evento recebido");

  try {
    // 1️⃣ Validar assinatura do webhook com Svix
    const evt = await validateClerkWebhook(req);
    console.log(`[Webhook Clerk] ✅ Assinatura válida — Tipo: ${evt.type}`);

    // 2️⃣ Processar evento user.created
    if (evt.type === "user.created") {
      const { id: clerkUserId, email_addresses, first_name, last_name } = evt.data;

      // Pegar o email principal
      const primaryEmail =
        email_addresses.find((e) => e.primary)?.email_address ||
        email_addresses[0]?.email_address ||
        null;

      if (!clerkUserId || !primaryEmail) {
        console.error("[Webhook Clerk] ❌ Dados incompletos:", {
          clerkUserId,
          primaryEmail,
        });
        return res.status(400).json({
          error: "Dados incompletos do Clerk",
        });
      }

      // 3️⃣ Sincronizar com Supabase
      console.log(
        `[Webhook Clerk] 👤 Criando usuário no Supabase: ${primaryEmail}`
      );

      const { data, error } = await supabase.from("users").insert({
        clerk_id: clerkUserId, // ID do Clerk como PK
        email: primaryEmail,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        credits_balance: 3, // 3 créditos iniciais
        is_subscribed: false,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("[Webhook Clerk] ❌ Erro ao inserir usuário:", error);
        // Se der erro de duplicata, é ok (pode ser retry do Clerk)
        if (error.code === "23505") {
          console.log("[Webhook Clerk] ℹ️  Usuário já existe (duplicata)");
          return res.json({ success: true, duplicate: true });
        }
        return res.status(500).json({
          error: error.message,
        });
      }

      console.log("[Webhook Clerk] ✅ Usuário sincronizado com sucesso!");
      return res.json({
        success: true,
        message: "Usuário criado e sincronizado",
        data,
      });
    }

    // 4️⃣ Ignorar outros eventos
    console.log(
      `[Webhook Clerk] ℹ️  Evento ignorado (tipo: ${evt.type})`
    );
    res.json({ success: true, ignored: true });
  } catch (error) {
    console.error("[Webhook Clerk] ❌ Erro ao processar webhook:", error);
    res.status(401).json({
      error: "Validação de webhook falhou",
      message: error.message,
    });
  }
});
