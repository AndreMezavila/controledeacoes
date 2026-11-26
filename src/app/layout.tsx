import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BolsaAlert - Controle de Ativos e Alertas de Compra/Venda',
  description:
    'Sistema inteligente de apoio à decisão e controle manual de operações na Bolsa de Valores com cálculo de Preço Médio e alertas de Compra/Venda.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
