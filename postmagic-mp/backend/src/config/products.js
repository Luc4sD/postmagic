/**
 * src/config/products.js
 *
 * Catálogo de produtos — fonte única de verdade.
 * Altere preços e créditos aqui; o resto do sistema lê daqui.
 */

export const PRODUCTS = {
  // ── Pagamento único ──────────────────────────────────────────
  avulso: {
    id:          "postmagic_avulso",
    title:       "PostMagic — Pacote 30 Posts",
    description: "30 gerações de posts com IA. Créditos sem prazo de validade.",
    price:       9.90,
    credits:     30,
    plan:        "avulso",
    type:        "one_time",
    currency:    "BRL",
  },

  // ── Assinatura recorrente ────────────────────────────────────
  mensal: {
    id:            "postmagic_mensal",
    title:         "PostMagic Mensal — 100 Posts/mês",
    description:   "100 gerações por mês + suporte prioritário. Cancele quando quiser.",
    price:         19.90,
    credits:       100,
    plan:          "mensal",
    type:          "subscription",
    currency:      "BRL",
    frequency:     1,
    frequencyType: "months",
  },
};

// Helper: valida e retorna o produto ou lança erro
export function getProduct(productKey) {
  const product = PRODUCTS[productKey];
  if (!product) {
    const valid = Object.keys(PRODUCTS).join(", ");
    throw new Error(`Produto inválido: "${productKey}". Válidos: ${valid}`);
  }
  return product;
}
