'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmEmailAction, resendVerificationEmailAction } from '@/actions/auth.actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, AlertCircle, Mail, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export function ConfirmEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tokenParam = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';

  const [code, setCode] = React.useState('');
  const [email, setEmail] = React.useState(emailParam);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState<string | null>(null);

  // Auto-validate if token is present in URL
  React.useEffect(() => {
    if (tokenParam) {
      handleConfirmWithToken(tokenParam);
    }
  }, [tokenParam]);

  const handleConfirmWithToken = async (token: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await confirmEmailAction({ token });
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Token de confirmação inválido ou expirado.');
      }
    } catch {
      setError('Falha de conexão ao validar confirmação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setError('Informe o código de 6 dígitos recebido por e-mail.');
      return;
    }
    if (!email) {
      setError('Informe o seu e-mail cadastrado.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await confirmEmailAction({ code, email });
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Código de verificação incorreto.');
      }
    } catch {
      setError('Falha ao processar código de confirmação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Informe seu e-mail para receber um novo código.');
      return;
    }

    setIsResending(true);
    setError(null);
    setResendMessage(null);

    try {
      const res = await resendVerificationEmailAction(email);
      if (res.success) {
        setResendMessage('Novo e-mail de confirmação enviado com sucesso! Verifique sua caixa de entrada.');
      } else {
        setError(res.error || 'Falha ao reenviar e-mail.');
      }
    } catch {
      setError('Erro de rede ao solicitar reenvio.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/80 shadow-2xl backdrop-blur-xl relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-inner">
            {success ? <CheckCircle2 className="h-8 w-8 text-emerald-400" /> : <Mail className="h-7 w-7 text-emerald-400" />}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            {success ? 'E-mail Confirmado!' : 'Confirmação de Cadastro'}
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            {success
              ? 'Sua conta foi ativada com sucesso. Você já pode acessar todos os seus alertas e operações.'
              : `Enviamos um e-mail de confirmação com link e código de 6 dígitos ${
                  emailParam ? `para ${emailParam}` : 'para sua conta'
                }.`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resendMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{resendMessage}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4 pt-2">
              <Link href="/login">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-lg shadow-emerald-950/50">
                  Fazer Login e Acessar Carteira
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleConfirmWithCode} className="space-y-4">
              {!emailParam && (
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Seu E-mail Cadastrado</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">
                  Código de 6 Dígitos
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Ex: 584920"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center font-mono text-xl tracking-widest uppercase py-3 font-bold text-emerald-400 border-zinc-700"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || code.length < 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 text-xs shadow-md shadow-emerald-950/50 gap-1.5"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar Conta
              </Button>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Não recebeu o e-mail?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
                >
                  {isResending && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Reenviar e-mail
                </button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center text-xs text-zinc-500 pt-0">
          <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">
            Voltar para o Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
