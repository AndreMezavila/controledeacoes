import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  ShieldCheck,
  Bell,
  Layers,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Bolsa<span className="text-emerald-400">Alert</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-300 hover:text-white">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-4 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Bell className="h-3.5 w-3.5" />
            Sistema de Apoio à Tomada de Decisão
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Controle de Ativos com{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Alertas Inteligentes
            </span>{' '}
            de Compra e Venda
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Monitore seus ativos da B3 e exterior sem conectar corretoras. Defina seu Preço-Teto e Preço-Alvo,
            calcule seu Preço Médio automaticamente e receba orientações claras de atitude para cada ativo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 text-sm shadow-xl shadow-emerald-950/50">
                Começar Agora Gratuitamente
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-700 hover:bg-zinc-800 text-sm">
                Acessar Minha Carteira
              </Button>
            </Link>
          </div>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base">Alertas Visuais Claros</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Indicação imediata de COMPRAR, VENDER, MANTER ou AGUARDAR baseada na margem de segurança configurada por você.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base">Preço Médio Contábil</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Cálculo rigoroso de Preço Médio e lucro/prejuízo realizado conforme as regras fiscais de mercado financeiro.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base">Zero Trust & Dual Database</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Isolamento estrito entre usuários com prevenção anti-IDOR. Suporte nativo a SQLite local e Supabase PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BolsaAlert © 2026 - Controle seguro de investimentos</span>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" /> SQLite & Supabase
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> Zero Trust Architecture
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
