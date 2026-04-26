"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  const buy = (product: string) => {
    alert('Em modo de preview — no futuro redirecionará para o checkout do Mercado Pago.\n\nProduto: ' + product);
  };

  return (
    <>
      <h2 className="sr-only">PostMagic — Landing page com planos de preços</h2>

      {/* Nav */}
      <nav className="nav">
        <div className="logo">
          <div className="logo-icon">✦</div>
          Post<span className="green">Magic</span>
        </div>
        <div className="nav-links">
          <a href="#how">Como funciona</a>
          <a href="#pricing">Preços</a>
          <a href="#faq">FAQ</a>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Clerk Integration */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-ghost">Entrar</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn btn-primary">Começar grátis</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn btn-primary">Ir para o App</Link>
            <div style={{ marginLeft: '10px' }}>
               <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="launch-badge">
          <span className="pulse-dot"></span>
          Lançamento — preço especial para os primeiros clientes
        </div>
        <h1>Sua loja merece posts<br />perfeitos <span className="green">em 5 segundos</span></h1>
        <p className="hero-sub">
          Faça upload da foto do seu produto. Nossa IA gera na hora: título, legenda persuasiva, hashtags e CTA prontos para copiar e publicar.
        </p>
        <div className="cta-group">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="btn-hero btn-hero-main">✦ Gerar meu primeiro post — Grátis</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
             <Link href="/dashboard" className="btn-hero btn-hero-main" style={{ textDecoration: 'none' }}>✦ Acessar o Gerador</Link>
          </SignedIn>
          
          <button className="btn-hero btn-hero-ghost" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
            Ver planos a partir de R$ 9,90 ↓
          </button>
        </div>
        <div className="social-proof">
          <div className="sp-item"><span className="sp-val">2.400+</span><span className="sp-lbl">posts gerados</span></div>
          <div className="sp-item"><span className="sp-val">4.9 ★</span><span className="sp-lbl">avaliação média</span></div>
          <div className="sp-item"><span className="sp-val">5 seg</span><span className="sp-lbl">por post</span></div>
        </div>
      </section>

      {/* Networks */}
      <div className="net-bar">
        <div className="net-item"><span style={{ color: '#E1306C', fontSize: '13px' }}>◉</span> Instagram</div>
        <div className="net-item"><span style={{ color: '#0077B5', fontSize: '13px' }}>◉</span> LinkedIn</div>
        <div className="net-item"><span style={{ color: '#1DA1F2', fontSize: '13px' }}>◉</span> X / Twitter</div>
        <div className="net-item"><span style={{ color: '#1877F2', fontSize: '13px' }}>◉</span> Facebook</div>
      </div>

      {/* How it works */}
      <section className="section" id="how">
        <div className="section-label">Como funciona</div>
        <div className="section-title">3 passos. Sem complicação.</div>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-icon">⬆</div>
            <div className="step-title">Upload da foto</div>
            <div className="step-desc">Arraste a imagem do produto. JPG, PNG ou WEBP. Sem edição necessária.</div>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div className="step-icon">⚙</div>
            <div className="step-title">Escolha rede e tom</div>
            <div className="step-desc">Instagram, LinkedIn, X ou Facebook. Tom profissional, casual ou inspirador.</div>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div className="step-icon">⎘</div>
            <div className="step-title">Copie e publique</div>
            <div className="step-desc">Título, legenda, hashtags e CTA prontos. Um clique para copiar tudo.</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section" id="pricing">
        <div className="section-label">Preços</div>
        <div className="section-title">Simples, justo e sem surpresas</div>

        <div className="pricing-grid">
          {/* Starter */}
          <div className="plan-card">
            <div>
              <div className="plan-name">Starter</div>
              <div className="plan-price-row">
                <span className="plan-price">R$ 0</span>
              </div>
              <div className="plan-period" style={{ marginTop: '2px' }}>para sempre</div>
            </div>
            <div className="plan-credits-box">
              <span style={{ fontSize: '16px' }}>⚡</span>
              <div>
                <div className="credit-val">3 posts</div>
                <div className="credit-lbl">para você testar</div>
              </div>
            </div>
            <ul className="plan-features">
              <li><span className="check">✓</span>3 créditos gratuitos</li>
              <li><span className="check">✓</span>Todas as redes sociais</li>
              <li><span className="check">✓</span>4 tons de voz</li>
              <li><span className="check-dim">—</span><span style={{ color: 'var(--faint)' }}>Histórico de posts</span></li>
              <li><span className="check-dim">—</span><span style={{ color: 'var(--faint)' }}>Suporte prioritário</span></li>
            </ul>
            <SignedOut>
                <SignUpButton mode="modal">
                    <button className="plan-cta outline">Começar grátis</button>
                </SignUpButton>
            </SignedOut>
            <SignedIn>
                <Link href="/dashboard" className="plan-cta outline" style={{ textDecoration: 'none' }}>Ir para o App</Link>
            </SignedIn>
            <div className="plan-note">Sem cartão de crédito</div>
          </div>

          {/* Avulso */}
          <div className="plan-card" id="card-avulso">
            <div className="plan-badge note">Sem compromisso</div>
            <div>
              <div className="plan-name">Pacote Avulso</div>
              <div className="plan-price-row">
                <span className="plan-price">R$ 9,90</span>
              </div>
              <div className="plan-period" style={{ marginTop: '2px' }}>pagamento único · 30 posts</div>
            </div>
            <div className="plan-credits-box">
              <span style={{ fontSize: '16px' }}>⚡</span>
              <div>
                <div className="credit-val">30 posts</div>
                <div className="credit-lbl">que nunca expiram</div>
              </div>
            </div>
            <ul className="plan-features">
              <li><span className="check">✓</span>30 créditos sem prazo</li>
              <li><span className="check">✓</span>Todas as redes sociais</li>
              <li><span className="check">✓</span>Todos os tons de voz</li>
              <li><span className="check">✓</span>Histórico de posts</li>
              <li><span className="check-dim">—</span><span style={{ color: 'var(--faint)' }}>Suporte prioritário</span></li>
            </ul>
            <button className="plan-cta outline" id="btn-avulso" onClick={() => buy('avulso')}>Comprar pacote</button>
            <div className="plan-note">PIX ou Cartão</div>
          </div>

          {/* Mensal */}
          <div className="plan-card highlight">
            <div className="plan-badge hot">🔥 Mais popular</div>
            <div>
              <div className="plan-name">Assinatura Mensal</div>
              <div className="plan-price-row">
                <span className="plan-price">R$ 19,90</span>
              </div>
              <div className="plan-period" style={{ marginTop: '2px' }}>/mês · cancele quando quiser</div>
            </div>
            <div className="plan-credits-box hl">
              <span style={{ fontSize: '16px', color: 'var(--green-text)' }}>⚡</span>
              <div>
                <div className="credit-val hl">100 posts/mês</div>
                <div className="credit-lbl">renova automaticamente</div>
              </div>
            </div>
            <ul className="plan-features">
              <li><span className="check">✓</span>100 créditos por mês</li>
              <li><span className="check">✓</span>Todas as redes sociais</li>
              <li><span className="check">✓</span>Todos os tons de voz</li>
              <li><span className="check">✓</span>Histórico ilimitado</li>
              <li><span className="check">✓</span><strong>Suporte via WhatsApp</strong></li>
            </ul>
            <button className="plan-cta primary" id="btn-mensal" onClick={() => buy('mensal')}>✦ Assinar agora</button>
            <div className="plan-note">Renova todo mês automaticamente</div>
          </div>
        </div>

        {/* Trust row */}
        <div className="trust-row" style={{ marginTop: '20px' }}>
          <div className="trust-item">🔒 Compra segura (SSL)</div>
          <div className="trust-item">💳 PIX e Cartão via Mercado Pago</div>
          <div className="trust-item">📱 Suporte via WhatsApp</div>
          <div className="trust-item">↩ Cancele quando quiser</div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ background: 'rgba(255,255,255,.01)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="section-label">Depoimentos</div>
        <div className="section-title">Quem usa, não volta ao manual</div>
        <div className="testi-grid">
          <div className="testi-card">
            <div className="stars">★★★★★</div>
            <div className="testi-text">"Gastava 1h por post. Agora leva 10 segundos. Vendas subiram 30% só com a consistência das postagens."</div>
            <div className="testi-author">
              <span className="testi-avatar">🌸</span>
              <div><div className="testi-name">Carla M.</div><div className="testi-role">Loja de cosméticos naturais</div></div>
            </div>
          </div>
          <div className="testi-card">
            <div className="stars">★★★★★</div>
            <div className="testi-text">"Testei com ceticismo e fui surpreendido. As legendas ficaram melhores do que as que eu fazia manualmente."</div>
            <div className="testi-author">
              <span className="testi-avatar">🐾</span>
              <div><div className="testi-name">Rafael S.</div><div className="testi-role">Pet shop e distribuidora</div></div>
            </div>
          </div>
          <div className="testi-card">
            <div className="stars">★★★★★</div>
            <div className="testi-text">"Uso o plano mensal pra 14 clientes da minha agência. R$ 19,90 me economiza umas 20h por mês facilmente."</div>
            <div className="testi-author">
              <span className="testi-avatar">📊</span>
              <div><div className="testi-name">Ana Lima</div><div className="testi-role">Agência de marketing digital</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <div className="final-cta" id="faq">
        <div className="final-cta-box">
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>✦</div>
          <h2>Comece agora, sem risco</h2>
          <p>3 posts grátis para testar.<br />Se gostar: <strong style={{ color: '#fff' }}>30 posts por R$ 9,90</strong> ou <strong style={{ color: '#fff' }}>100 posts/mês por R$ 19,90</strong>.</p>
          <div className="cta-btns">
            <SignedOut>
                <SignUpButton mode="modal">
                    <button className="btn-hero btn-hero-main">⚡ Começar com 3 posts grátis</button>
                </SignUpButton>
            </SignedOut>
            <SignedIn>
                <Link href="/dashboard" className="btn-hero btn-hero-main" style={{ textDecoration: 'none' }}>⚡ Ir para o meu Painel</Link>
            </SignedIn>
            <button className="btn-hero btn-hero-ghost" onClick={() => buy('avulso')} id="btn-avulso2">30 posts por R$ 9,90</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="logo" style={{ fontSize: '14px' }}>
          <span style={{ fontSize: '12px' }}>✦</span> Post<span className="green">Magic</span>
        </div>
        <div className="footer-copy">© 2024 PostMagic · Pagamentos via Mercado Pago · Termos · Privacidade</div>
      </footer>
    </>
  );
}