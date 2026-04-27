"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { UploadCloud, CheckCircle2, Copy, Sparkles, Image as ImageIcon } from "lucide-react";

export default function DashboardPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulação de 3 segundos para testar o visual
    setTimeout(() => {
      setResult("✨ Aqui está o post mágico gerado para o seu produto!\n\nDescubra a qualidade e o design impecável que você sempre procurou. Perfeito para o seu dia a dia e feito para durar.\n\n👉 Clique no link da bio e garanta o seu com desconto especial!\n\n#Inovação #Qualidade #Lançamento #ProdutoPremium");
      setIsGenerating(false);
    }, 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080c10] text-[#e2e8f0] font-sans selection:bg-[#22c55e] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#1c2736] bg-[#080c10]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg flex items-center justify-center text-[#4ade80] font-bold text-lg">
              ✦
            </div>
            <span className="font-bold text-xl tracking-tight text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Post<span className="text-[#4ade80]">Magic</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141b24] border border-[#243044] text-sm font-medium">
              <Sparkles className="w-4 h-4 text-[#fbbf24]" />
              <span>3 Créditos</span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Coluna Esquerda - Controles */}
          <div className="bg-[#0e1319] border border-[#1c2736] rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Criar Novo Post</h2>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-[#243044] hover:border-[#4ade80]/50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group bg-[#141b24]/50 mb-6">
              <div className="w-14 h-14 bg-[#1c2736] group-hover:bg-[#22c55e]/10 rounded-full flex items-center justify-center mb-4 transition-colors">
                <UploadCloud className="w-7 h-7 text-[#64748b] group-hover:text-[#4ade80]" />
              </div>
              <p className="text-sm font-medium text-white mb-1">Clique ou arraste a foto do produto</p>
              <p className="text-xs text-[#64748b]">Suporta JPG, PNG e WEBP</p>
            </div>

            {/* Configurações */}
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-medium text-[#64748b] mb-2">Rede Social</label>
                <select className="w-full bg-[#141b24] border border-[#243044] text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[#4ade80] transition-colors appearance-none">
                  <option>Instagram</option>
                  <option>LinkedIn</option>
                  <option>Twitter / X</option>
                  <option>Facebook</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748b] mb-2">Tom de Voz</label>
                <select className="w-full bg-[#141b24] border border-[#243044] text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[#4ade80] transition-colors appearance-none">
                  <option>Profissional & Direto</option>
                  <option>Casual & Amigável</option>
                  <option>Divertido & Engraçado</option>
                  <option>Inspirador & Emocionante</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_25px_rgba(34,197,94,0.25)]"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Gerando Mágica...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  ✦ Gerar Post Mágico
                </>
              )}
            </button>
          </div>

          {/* Coluna Direita - Resultado */}
          <div className="bg-[#0e1319] border border-[#1c2736] rounded-2xl p-6 shadow-xl h-full min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Resultado</h2>
              {result && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141b24] border border-[#243044] text-[#a1a1aa] hover:text-white hover:border-[#64748b] transition-all text-sm font-medium"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-[#4ade80]" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              )}
            </div>

            <div className="flex-1 bg-[#141b24] border border-[#243044] rounded-xl p-6 relative overflow-hidden group">
              {result ? (
                <div className="text-[#e2e8f0] whitespace-pre-wrap leading-relaxed text-[15px]">
                  {result}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#64748b]">
                  <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Sua legenda aparecerá aqui...</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}