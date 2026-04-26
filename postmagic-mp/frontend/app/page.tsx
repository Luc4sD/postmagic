import { SignInButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function HomePage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-center mb-6">PostMagic</h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          Plataforma integrada com Mercado Pago, Clerk e Supabase
        </p>

        {user ? (
          <div className="text-center">
            <p className="text-lg mb-6">
              Bem-vindo de volta, <strong>{user.firstName}</strong>!
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Ir para Dashboard
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg mb-6">Comece agora criando sua conta gratuita!</p>
            <SignInButton
              mode="modal"
              fallbackRedirectUrl="/dashboard"
              signUpFallbackRedirectUrl="/dashboard"
            >
              <button className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                Entrar / Cadastrar
              </button>
            </SignInButton>
          </div>
        )}
      </div>
    </div>
  );
}
