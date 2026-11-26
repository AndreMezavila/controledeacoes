'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations';
import { loginAction } from '@/actions/auth.actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, AlertCircle, Loader2, Lock, Mail } from 'lucide-react';
import { GoogleSignInButton } from '@/components/google-sign-in-button';

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await loginAction(data);
      if (!res.success) {
        setServerError(res.error || 'Credenciais inválidas.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setServerError('Falha de conexão durante o login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setValue('email', 'investidor@demo.com');
    setValue('password', '123456');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/80 shadow-2xl backdrop-blur-xl relative z-10">
        <CardHeader className="text-center pb-5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-inner">
            <TrendingUp className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Bolsa<span className="text-emerald-400">Alert</span>
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Acesse seu painel com sua conta do Google / Gmail ou credenciais.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {serverError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Botão de Login com Google / Gmail */}
          <GoogleSignInButton text="Entrar com conta do Google / Gmail" />

          {/* Divisor Visual */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-zinc-900 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              ou com e-mail
            </span>
            <div className="border-t border-zinc-800 w-full" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                  className="pl-9 text-xs"
                />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="pl-9 text-xs"
                />
              </div>
              {errors.password && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 text-xs shadow-md shadow-emerald-950/50 transition-all gap-1.5"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Entrar na Plataforma
            </Button>
          </form>

          {/* Quick Demo button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-xs text-zinc-400 hover:text-emerald-400 underline decoration-dashed underline-offset-4 transition-colors"
            >
              Preencher dados de demonstração (Demo)
            </button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 text-center text-xs text-zinc-500 pt-0">
          <div>
            Ainda não tem conta?{' '}
            <Link href="/register" className="text-emerald-400 font-medium hover:underline">
              Cadastre-se gratuitamente
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
