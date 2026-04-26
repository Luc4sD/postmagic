"use client";

/**
 * hooks/useCheckout.ts
 *
 * Hook do frontend para iniciar o fluxo de checkout.
 * Chama o backend, recebe o link do MP e redireciona.
 *
 * Uso:
 *   const { startCheckout, loading } = useCheckout();
 *   <button onClick={() => startCheckout("avulso")}>Comprar</button>
 */

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ProductKey = "avulso" | "mensal";

export function useCheckout() {
  const { user, isSignedIn } = useUser();
  const [loading, setLoading] = useState<ProductKey | null>(null);
  const [error, setError]     = useState<string | null>(null);

  async function startCheckout(product: ProductKey) {
    // Usuário não logado → redireciona para cadastro
    if (!isSignedIn || !user) {
      window.location.href = "/sign-up";
      return;
    }

    setLoading(product);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/pagamento/checkout`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          clerkUserId: user.id,
          userEmail:   user.emailAddresses[0]?.emailAddress ?? "",
          userName:    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao iniciar checkout.");
      }

      // Em desenvolvimento usa sandboxUrl, em produção usa checkoutUrl
      const redirectUrl =
        process.env.NODE_ENV === "production"
          ? data.checkoutUrl
          : (data.sandboxUrl ?? data.checkoutUrl);

      if (!redirectUrl) {
        throw new Error("URL de checkout não recebida do servidor.");
      }

      // Redireciona para o Mercado Pago
      window.location.href = redirectUrl;

    } catch (err: any) {
      setError(err.message);
      console.error("[CHECKOUT]", err);
    } finally {
      setLoading(null);
    }
  }

  return { startCheckout, loading, error };
}
