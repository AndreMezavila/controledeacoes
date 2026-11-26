import NextAuth, { DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { dbRepository } from './repositories';
import { loginSchema } from './lib/validations';
import { EmailService } from './services/email.service';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isVerified?: boolean;
    } & DefaultSession['user'];
  }
}

const providers: any[] = [
  Credentials({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      const { email, password } = parsed.data;
      const user = await dbRepository.users.findByEmail(email);

      if (!user || !user.password) {
        return null;
      }

      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (!passwordsMatch) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
];

// Suporte nativo ao Google / Gmail OAuth
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt',
  },
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;

        const email = user.email.toLowerCase();
        let existingUser = await dbRepository.users.findByEmail(email);

        if (!existingUser) {
          // Criação automática do usuário via Gmail OAuth
          const id = crypto.randomUUID();
          existingUser = await dbRepository.users.create({
            id,
            name: user.name || 'Investidor Google',
            email,
            emailVerified: new Date().toISOString(),
            image: user.image || null,
          });

          // Notifica o administrador sobre novo cadastro
          await EmailService.sendAdminNotification({
            name: user.name || 'Usuário Google',
            email,
          });
        } else if (!existingUser.emailVerified) {
          // Se entrou com Gmail, o e-mail já é confirmado pelo Google
          await dbRepository.users.verifyEmail(existingUser.id);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Se foi login com Google, busca o ID do banco correspondente
        if (account?.provider === 'google' && user.email) {
          const dbUser = await dbRepository.users.findByEmail(user.email);
          if (dbUser) {
            token.id = dbUser.id;
            token.emailVerified = dbUser.emailVerified;
          }
        } else {
          token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified ? new Date(token.emailVerified as string) : null;
        session.user.isVerified = !!token.emailVerified;
      }
      return session;
    },
  },
});
