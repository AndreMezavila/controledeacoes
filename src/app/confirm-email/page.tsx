import * as React from 'react';
import { Suspense } from 'react';
import { ConfirmEmailClient } from './confirm-email-client';

export const dynamic = 'force-dynamic';

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400 text-sm">
          Carregando validação de e-mail...
        </div>
      }
    >
      <ConfirmEmailClient />
    </Suspense>
  );
}
