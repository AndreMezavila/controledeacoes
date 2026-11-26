'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Briefcase, History, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: 'Dashboard de Alertas',
    href: '/dashboard',
    icon: Bell,
    badgeText: 'Core',
  },
  {
    name: 'Carteira & Posições',
    href: '/carteira',
    icon: Briefcase,
  },
  {
    name: 'Registro de Operações',
    href: '/operacoes',
    icon: History,
  },
  {
    name: 'Ativos Monitorados',
    href: '/monitorados',
    icon: Sliders,
  },
];

export function NavigationBar() {
  const pathname = usePathname();

  return (
    <div className="border-b border-zinc-800 bg-zinc-950/40 sticky top-16 z-30">
      <div className="container px-4 sm:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-emerald-400' : 'text-zinc-400')} />
                <span>{item.name}</span>
                {item.badgeText && (
                  <span className="hidden sm:inline-block ml-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                    {item.badgeText}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
