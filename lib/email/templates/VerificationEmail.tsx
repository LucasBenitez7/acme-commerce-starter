import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lsbstack.com";

interface VerificationEmailProps {
  verificationLink?: string;
}

export const VerificationEmail = ({
  verificationLink = "https://lsbstack.com/verify-email?token=XXX",
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>{`:root { color-scheme: light; supported-color-schemes: light; }`}</style>
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Heading style={header}>LSB SHOP</Heading>

          <Section style={cardContainer}>
            <Heading style={subHeader}>Verifica tu correo electrónico</Heading>
            <Text style={text}>Hola,</Text>
            <Text style={text}>
              Gracias por registrarte en LSB Shop. Para asegurar la seguridad de
              tu cuenta y acceder a todas las funciones, por favor verifica tu
              dirección de email.
            </Text>

            <Section style={btnContainer}>
              <Link href={verificationLink} style={button}>
                VERIFICAR EMAIL
              </Link>
            </Section>
          </Section>
        </Container>

        <Container style={footer}>
          <Text style={footerText}>
            © 2026 lsbstack. Todos los derechos reservados.
          </Text>
          <div style={footerLinks}>
            <Link href="#" style={link}>
              Privacidad
            </Link>
            <Link href="#" style={link}>
              Términos
            </Link>
            <Link href="#" style={link}>
              Contacto
            </Link>
          </div>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 20px",
  maxWidth: "560px",
};

const header = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0px 0px 30px",
  padding: "0",
  color: "#1a1a1a",
};

const subHeader = {
  fontSize: "20px",
  fontWeight: "bold",
  textAlign: "left" as const,
  margin: "0 0 15px",
  color: "#1a1a1a",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  fontWeight: 400,
  color: "#1a1a1a",
  marginBottom: "16px",
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "20px",
  marginBottom: "20px",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "2px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 60px",
};

const footer = {
  borderTop: "1px solid #e6e6e6",
  marginTop: "20px",
  paddingTop: "20px",
  textAlign: "center" as const,
  width: "100%",
  maxWidth: "560px",
  margin: "0 auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const footerText = {
  fontSize: "12px",
  color: "#666",
  fontWeight: 500,
  margin: "0 0 10px",
};

const footerLinks = {
  display: "flex",
  justifyContent: "center",
  gap: "15px",
};

const link = {
  color: "#666",
  textDecoration: "underline",
  fontSize: "12px",
  fontWeight: 600,
  margin: "0 10px",
};

const cardContainer = {
  border: "1px solid #e5e5e5",
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  marginTop: "20px",
  backgroundColor: "#ffffff",
  padding: "24px",
};
