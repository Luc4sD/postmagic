# PostMagic — Integração Mercado Pago

## Instalação

### Backend — instale o SDK oficial v2
```bash
cd backend
npm install mercadopago@^2.0.15 @supabase/supabase-js express cors helmet express-rate-limit
```

> **Por que v2?** O SDK v1 está depreciado. A v2 usa classes
> (`Preference`, `Payment`, `PreApproval`) em vez de métodos estáticos,
> tem melhor suporte a TypeScript e é a única com suporte ativo.

### Frontend — nenhuma dependência extra necessária
O frontend só precisa do `useCheckout.ts` que chama o backend.
A Public Key é usada apenas se você for montar um formulário de cartão
próprio (Checkout Bricks) — para o Checkout Pro (redirect), não é necessária.

---

## Configuração do .env

### Backend (`backend/.env`)
```env
MP_ACCESS_TOKEN=APP_USR-SEU_TOKEN_AQUI
MP_PUBLIC_KEY=APP_USR-SUA_PUBLIC_KEY_AQUI
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-SUA_PUBLIC_KEY_AQUI
```

---

## Rodando localmente

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend (se separado)
cd frontend && npm run dev
```

---

## Testando o webhook localmente (ngrok)

O MP não consegue chamar `localhost`. Use ngrok para expor o backend:

```bash
# Instalar ngrok (uma vez)
npm install -g ngrok

# Expor o backend
ngrok http 3001
```

Copie a URL gerada (ex: `https://abc123.ngrok.io`) e:
1. Adicione ao `.env` do backend:
   ```env
   BACKEND_URL=https://abc123.ngrok.io
   ```
2. Ou configure diretamente no painel do MP:
   **Aplicações → Seu App → Webhooks → URL de produção**
   → `https://abc123.ngrok.io/api/pagamento/webhook`

---

## Cartões de teste (sandbox)

| Cenário         | Número do cartão      | CVV | Validade |
|-----------------|-----------------------|-----|----------|
| Aprovado        | 5031 7557 3453 0604   | 123 | 11/25    |
| Recusado        | 4000 0000 0000 0002   | 123 | 11/25    |
| Pendente        | 4235 6477 2802 5682   | 123 | 11/25    |

**CPF do titular (sempre):** 12345678909
**Nome:** pode ser qualquer coisa

**PIX no sandbox:** o QR Code gerado em modo teste aprova automaticamente.

---

## Testando o fluxo completo

```bash
# 1. Criar uma preferência (substitua os valores)
curl -X POST http://localhost:3001/api/pagamento/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "product": "avulso",
    "clerkUserId": "user_test_123",
    "userEmail": "teste@exemplo.com",
    "userName": "Usuário Teste"
  }'

# Resposta esperada:
# {
#   "type": "one_time",
#   "preferenceId": "123456789-...",
#   "checkoutUrl": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
#   "sandboxUrl": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
# }

# 2. Abra a sandboxUrl no browser e pague com o cartão de teste

# 3. Simular webhook manualmente (para testar sem pagar)
curl -X POST http://localhost:3001/api/pagamento/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": { "id": "ID_DO_PAGAMENTO_AQUI" }
  }'
```

---

## Estrutura dos arquivos

```
backend/
├── src/
│   ├── config/
│   │   ├── mercadopago.js   ← Singleton do SDK MP
│   │   ├── supabase.js      ← Cliente Supabase + helpers
│   │   └── products.js      ← Catálogo de planos (preços e créditos)
│   ├── routes/
│   │   ├── checkout.js      ← POST /api/pagamento/checkout
│   │   └── webhook.js       ← POST /api/pagamento/webhook
│   └── server.js            ← Express + middlewares
├── .env                     ← Suas chaves (nunca commite)
└── package.json

frontend/
├── hooks/
│   └── useCheckout.ts       ← Hook React para iniciar checkout
└── .env.local               ← Apenas a Public Key
```

---

## Checklist antes de ir para produção

- [ ] Trocar `MP_ACCESS_TOKEN` pelo token de **produção** no `.env`
- [ ] Configurar `BACKEND_URL` com a URL real (HTTPS obrigatório)
- [ ] Testar fluxo completo no sandbox antes de trocar
- [ ] Configurar webhook no painel do MP apontando para a URL de produção
- [ ] Garantir que `.env` está no `.gitignore`
- [ ] Nunca logar o `accessToken` em produção
