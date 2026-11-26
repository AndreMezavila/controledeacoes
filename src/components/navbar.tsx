'use client';

import Link from 'next/link';
import { TrendingUp, Database, LogOut, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { logoutAction } from '@/actions/auth.actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    emailVerified?: Date | string | null;
    isVerified?: boolean;
  };
  activeProvider: string;
}

export function Navbar({ user, activeProvider }: NavbarProps) {
  const isSupabase = activeProvider.toLowerCase() === 'supabase';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-base text-zinc-100 tracking-tight flex items-center gap-1.5">
                Bolsa<span className="text-emerald-400 font-extrabold">Alert</span>
              </span>
              <span className="text-[10px] text-zinc-400 block -mt-1 font-medium">Controle de Ativos & Decisões</span>
            </div>
          </Link>

          {/* Active DB Provider Badge */}
          <div className="hidden md:flex items-center ml-4">
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono border-zinc-700 bg-zinc-900/80"
            >
              <Database className="h-3 w-3 text-zinc-400" />
              <span>Provider:</span>
              <span
                className={`flex items-center gap-1 font-semibold ${
                  isSupabase ? 'text-emerald-400' : 'text-cyan-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
                  }`}
                />
                {isSupabase ? 'Supabase (PostgreSQL)' : 'SQLite Local (Offline)'}
              </span>
            </Badge>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 rounded-lg">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name || 'User'} className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <UserIcon className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span className="text-zinc-200 font-medium">{user.name || user.email}</span>
              {user.emailVerified && (
                <span title="E-mail Verificado" className="text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          )}

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 text-xs flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
