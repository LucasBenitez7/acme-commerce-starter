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

import { EmailFooter } from "./EmailFooter";
import { EmailHeader } from "./EmailHeader";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shop.lsbstack.com";

interface PasswordChangedEmailProps {
  userEmail?: string;
}

export const PasswordChangedEmail = ({
  userEmail = "usuario@ejemplo.com",
}: PasswordChangedEmailProps) => {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>{`:root { color-scheme: light; supported-color-schemes: light; }`}</style>
      </Head>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <Section style={cardContainer}>
            <Heading style={subHeader}>Contraseña Actualizada</Heading>
            <Text style={text}>Hola,</Text>
            <Text style={text}>
              Te confirmamos que la contraseña de tu cuenta asociada a{" "}
              <strong>{userEmail}</strong> ha sido cambiada correctamente.
            </Text>
            <Text style={text}>
              Si has sido tú, no necesitas hacer nada más.
            </Text>
            <Section style={btnContainer}>
              <Link href={`${baseUrl}/auth/login`} style={button}>
                INICIAR SESIÓN
              </Link>
            </Section>

            <Section>
              <Text style={alertText}>
                ¿No has sido tú? Contacta inmediatamente con soporte o intenta
                restablecer tu contraseña.
              </Text>
            </Section>
          </Section>
        </Container>

        <EmailFooter />
      </Body>
    </Html>
  );
};

export default PasswordChangedEmail;

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
  fontWeight: 500,
  color: "#1a1a1a",
  marginBottom: "16px",
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "15px",
  marginBottom: "15px",
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

const alertText = {
  fontSize: "14px",
  lineHeight: "20px",
  fontWeight: 500,
  color: "#991b1b",
  margin: "0",
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
