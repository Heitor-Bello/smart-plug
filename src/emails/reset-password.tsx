import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ResetPasswordEmailProps {
  userName: string;
  resetUrl: string;
}

export function ResetPasswordEmail({ userName, resetUrl }: ResetPasswordEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Redefinição de senha — Smart Plug</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>⚡ Smart Plug</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={heading}>Redefinição de senha</Heading>
            <Text style={paragraph}>Olá, {userName}!</Text>
            <Text style={paragraph}>
              Recebemos uma solicitação para redefinir a senha da sua conta Smart Plug. Se você não
              realizou esta solicitação, ignore este e-mail — sua senha permanece a mesma.
            </Text>
            <Text style={paragraph}>
              Para criar uma nova senha, clique no botão abaixo. Este link expira em{" "}
              <strong>1 hora</strong>.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Redefinir minha senha
              </Button>
            </Section>

            <Text style={linkFallback}>
              Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
            </Text>
            <Text style={linkUrl}>{resetUrl}</Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este e-mail foi enviado automaticamente. Por favor, não responda.
            </Text>
            <Text style={footerText}>© {new Date().getFullYear()} Smart Plug. Todos os direitos reservados.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const header: React.CSSProperties = {
  backgroundColor: "#18181b",
  padding: "24px 40px",
};

const logo: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0",
};

const content: React.CSSProperties = {
  padding: "40px 40px 24px",
};

const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#18181b",
  margin: "0 0 24px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#52525b",
  margin: "0 0 16px",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "32px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#18181b",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "14px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
};

const linkFallback: React.CSSProperties = {
  fontSize: "13px",
  color: "#a1a1aa",
  margin: "0 0 8px",
};

const linkUrl: React.CSSProperties = {
  fontSize: "12px",
  color: "#3b82f6",
  wordBreak: "break-all",
  margin: "0",
};

const divider: React.CSSProperties = {
  borderColor: "#e4e4e7",
  margin: "0 40px",
};

const footer: React.CSSProperties = {
  padding: "24px 40px",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#a1a1aa",
  margin: "0 0 4px",
  textAlign: "center",
};
