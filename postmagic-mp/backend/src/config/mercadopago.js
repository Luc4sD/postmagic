/**
 * src/config/mercadopago.js
 *
 * Inicializa o SDK do Mercado Pago v2 uma única vez (singleton).
 * Importe `mp` em qualquer rota que precisar.
 *
 * SDK oficial: https://github.com/mercadopago/sdk-nodejs
 * Versão usada: mercadopago ^2.x
 */

import { MercadoPagoConfig } from "mercadopago";

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error(
    "[MercadoPago] MP_ACCESS_TOKEN não encontrado. " +
    "Defina a variável no arquivo .env antes de iniciar o servidor."
  );
}

// Instância compartilhada — reutilize em todas as rotas
export const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,

  // Opções extras (opcionais mas recomendadas)
  options: {
    timeout: 10_000,            // 10s de timeout nas chamadas à API do MP
    idempotencyKey: undefined,  // sobrescreva por request quando necessário
  },
});

// Indicador visual no boot para não confundir tokens de teste/produção
const isProduction = process.env.MP_ACCESS_TOKEN.startsWith("APP_USR-") &&
  !process.env.MP_ACCESS_TOKEN.includes("TEST");

console.log(
  `[MercadoPago] SDK inicializado — modo: ${
    process.env.NODE_ENV === "production" && isProduction
      ? "🟢 PRODUÇÃO"
      : "🟡 TESTE/SANDBOX"
  }`
);
