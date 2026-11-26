'use server';

import bcrypt from 'bcryptjs';
import { dbRepository } from '@/repositories';
import { loginSchema, registerSchema, LoginInput, RegisterInput } from '@/lib/validations';
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { EmailService } from '@/services/email.service';

export async function loginAction(data: LoginInput) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Dados inválidos' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'E-mail ou senha incorretos.' };
        default:
          return { success: false, error: 'Erro ao autenticar. Tente novamente.' };
      }
    }
    return { success: false, error: 'Ocorreu um erro inesperado no login.' };
  }
}

export async function registerAction(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Dados inválidos' };
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await dbRepository.users.findByEmail(email);
    if (existing) {
      return { success: false, error: 'Este e-mail já está cadastrado.' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = crypto.randomUUID();

    // Gera token de confirmação e código de 6 dígitos
    const verificationToken = crypto.randomUUID();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await dbRepository.users.create({
      id,
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationCode,
      emailVerified: null,
    });

    // Envia o e-mail de confirmação para o novo usuário
    const emailRes = await EmailService.sendVerificationEmail(email, name, verificationToken, verificationCode);

    // Envia notificação para o administrador
    await EmailService.sendAdminNotification({ name, email });

    return {
      success: true,
      email,
      verificationToken,
      verificationCode,
      simulated: emailRes.simulated,
      previewUrl: emailRes.previewUrl,
    };
  } catch (err) {
    console.error('Erro no cadastro de usuário:', err);
    return { success: false, error: 'Falha ao registrar novo usuário. Verifique sua conexão com o banco.' };
  }
}

export async function confirmEmailAction(params: { token?: string; code?: string; email?: string }) {
  const { token, code, email } = params;

  try {
    let user = null;

    if (token) {
      user = await dbRepository.users.findByVerificationToken(token);
    } else if (code && email) {
      user = await dbRepository.users.findByVerificationCode(email, code.trim());
    }

    if (!user) {
      return { success: false, error: 'Código ou link de confirmação inválido ou expirado.' };
    }

    await dbRepository.users.verifyEmail(user.id);
    return { success: true, email: user.email };
  } catch (err) {
    console.error('Erro ao confirmar e-mail:', err);
    return { success: false, error: 'Falha interna ao validar confirmação de e-mail.' };
  }
}

export async function resendVerificationEmailAction(email: string) {
  if (!email) return { success: false, error: 'E-mail não informado.' };

  try {
    const user = await dbRepository.users.findByEmail(email);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Este e-mail já foi confirmado.' };
    }

    const verificationToken = crypto.randomUUID();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await dbRepository.users.update(user.id, {
      verificationToken,
      verificationCode,
    });

    const emailRes = await EmailService.sendVerificationEmail(
      user.email,
      user.name || 'Investidor',
      verificationToken,
      verificationCode
    );

    return {
      success: true,
      simulated: emailRes.simulated,
      previewUrl: emailRes.previewUrl,
    };
  } catch (err) {
    console.error('Erro ao reenviar e-mail de confirmação:', err);
    return { success: false, error: 'Falha ao reenviar e-mail.' };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' });
}
