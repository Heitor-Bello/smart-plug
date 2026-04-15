import { betterAuth } from "better-auth";
import { prisma } from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { resend } from "./resend";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { render } from "@react-email/render";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,

    async sendResetPassword({ user, url }) {
      const html = await render(
        ResetPasswordEmail({
          userName: user.name ?? user.email,
          resetUrl: url,
        })
      );
      await resend.emails.send({
        from: "Smart Plug <onboarding@resend.dev>",
        to: user.email,
        subject: "Redefinição de senha — Smart Plug",
        html,
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
