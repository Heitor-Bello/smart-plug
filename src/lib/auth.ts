import { betterAuth } from "better-auth";
import { prisma } from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { resend } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,

    async sendResetPassword({ user, url }) {
      await resend.emails.send({
        from: "Smart Plug <onboarding@resend.dev>",
        to: user.email,
        subject: "Redefinição de senha",
        html: `
          <div>
            <h2>Recuperação de senha</h2>
            <p>Você solicitou a redefinição da sua senha.</p>
            <p>
              <a href="${url}">Clique aqui para redefinir sua senha</a>
            </p>
          </div>
        `,
      });
    },

    async onPasswordReset({ user }) {
      console.log(`Senha redefinida para o usuário: ${user.email}`);
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
