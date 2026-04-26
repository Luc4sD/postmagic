import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Ignora rotas internas do Next.js e arquivos estáticos (Isso resolve o erro do _not-found!)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Executa o Clerk sempre nas rotas de API
    '/(api|trpc)(.*)',
  ],
};