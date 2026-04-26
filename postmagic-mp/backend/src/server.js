/**
 * src/server.js
 *
 * Entry point do backend PostMagic.
 * Inicializa Express, middlewares e rotas.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { checkoutRouter } from "./routes/checkout.js";
import { webhookRouter  } from "./routes/webhook.js";
import { clerkWebhookRouter } from "./routes/clerk-webhook.js";

// Valida variáveis obrigatórias na inicialização
["MP_ACCESS_TOKEN", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "CLERK_SECRET_KEY", "FRONTEND_URL"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`[BOOT] ❌ Variável de ambiente ausente: ${key}`);
    process.exit(1);
  }
});

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Segurança ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.FRONTEND_URL,
  credentials: true,
}));

// ── IMPORTANTE: webhook precisa do body RAW (antes do express.json) ──────────
// O MP assina o payload — se você parsear antes, a verificação falha.
// Por isso a rota de webhook é registrada com raw body.
app.use("/api/pagamento/webhook", express.raw({ type: "*/*" }), (req, _res, next) => {
  // Converte Buffer para string/objeto para o handler usar normalmente
  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString("utf8"));
    } catch {
      req.body = {};
    }
  }
  next();
});

// ── Body parser (para todas as outras rotas) ──────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max:      100,
  message:  { error: "Muitas requisições. Tente novamente em 15 minutos." },
});
app.use("/api/", apiLimiter);

// ── Rotas ─────────────────────────────────────────────────────────────────────
app.use("/api/webhooks/clerk", clerkWebhookRouter);
app.use("/api/pagamento/checkout", checkoutRouter);
app.use("/api/pagamento/webhook",  webhookRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    env:    process.env.NODE_ENV,
    ts:     new Date().toISOString(),
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "development" ? err.message : "Erro interno.",
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 PostMagic Backend rodando em http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Checkout: POST http://localhost:${PORT}/api/pagamento/checkout`);
  console.log(`   Webhook:  POST http://localhost:${PORT}/api/pagamento/webhook\n`);
});
