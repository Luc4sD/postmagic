import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo, {user.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Email: <span className="font-semibold">{user.primaryEmailAddress?.emailAddress}</span>
          </p>
          <p className="text-gray-600">
            ID Clerk: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{user.id}</code>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card de Créditos */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Créditos</h2>
            <p className="text-4xl font-bold text-blue-600">3</p>
            <p className="text-sm text-gray-500 mt-2">Créditos disponíveis</p>
          </div>

          {/* Card de Plano */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Plano</h2>
            <p className="text-lg font-bold text-green-600">Gratuito</p>
            <p className="text-sm text-gray-500 mt-2">Upgrade para Premium</p>
          </div>

          {/* Card de Status */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Status</h2>
            <p className="text-lg font-bold text-purple-600">✅ Ativo</p>
            <p className="text-sm text-gray-500 mt-2">Conta verificada</p>
          </div>
        </div>

        {/* Seção de Ações */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximos Passos</h2>
          <ul className="space-y-3">
            <li className="flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                ✓
              </span>
              <span className="text-gray-700">Conta criada e sincronizada com Supabase</span>
            </li>
            <li className="flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                →
              </span>
              <span className="text-gray-700">Explorar recursos do dashboard</span>
            </li>
            <li className="flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                →
              </span>
              <span className="text-gray-700">Realizar primeiro pagamento</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
