'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validations';
import { registerAction } from '@/actions/auth.actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, AlertCircle, Loader2, Lock, Mail, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { GoogleSignInButton } from '@/components/google-sign-in-button';

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [registeredInfo, setRegisteredInfo] = React.useState<{
    email: string;
    simulated?: boolean;
    previewUrl?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await registerAction(data);
      if (!res.success) {
        setServerError(res.error || 'Erro ao criar conta.');
      } else {
        setRegisteredInfo({
          email: data.email,
          simulated: res.simulated,
          previewUrl: res.previewUrl,
        });

        // Redirect after a brief moment to confirmation page
        setTimeout(() => {
          router.push(`/confirm-email?email=${encodeURIComponent(data.email)}`);
        }, 1500);
      }
    } catch {
      setServerError('Falha de conexão durante o cadastro.');
    } finally {
      setIsSubmitting(false);
    }
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
            Criar Nova Conta
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Cadastre-se com sua conta Google / Gmail ou dados cadastrais.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {serverError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {registeredInfo && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Cadastro realizado com sucesso!</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Enviamos um e-mail de confirmação para <strong>{registeredInfo.email}</strong>. Redirecionando para a página de confirmação...
              </p>
            </div>
          )}

          {/* Botão de Cadastro Instantâneo com Google / Gmail */}
          <GoogleSignInButton text="Cadastrar com Google / Gmail" />

          {/* Divisor */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-zinc-900 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              ou com e-mail e senha
            </span>
            <div className="border-t border-zinc-800 w-full" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Seu Nome"
                  {...register('name')}
                  className="pl-9 text-xs"
                />
              </div>
              {errors.name && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.name.message}</p>
              )}
            </div>

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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    type="password"
                    placeholder="••••••"
                    {...register('password')}
                    className="pl-9 text-xs"
                  />
                </div>
                {errors.password && (
                  <p className="text-rose-400 text-[11px] mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    type="password"
                    placeholder="••••••"
                    {...register('confirmPassword')}
                    className="pl-9 text-xs"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-rose-400 text-[11px] mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !!registeredInfo}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 text-xs shadow-md shadow-emerald-950/50 transition-all gap-1.5"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar Conta e Receber Confirmação
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 text-center text-xs text-zinc-500 pt-0">
          <div>
            Já possui uma conta?{' '}
            <Link href="/login" className="text-emerald-400 font-medium hover:underline">
              Fazer login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
