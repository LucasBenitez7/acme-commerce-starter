import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  firstName?: string;
  lastName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lsbstack.com";

export const WelcomeEmail = ({
  firstName = "Usuario",
  lastName = "",
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>{`:root { color-scheme: light; supported-color-schemes: light; }`}</style>
      </Head>
      <Body style={main}>
        <Preview>¡Bienvenido a LSB Shop!</Preview>
        <Container style={container}>
          <Heading style={header}>LSB SHOP</Heading>

          <Section style={cardContainer}>
            <Heading style={subHeader}>
              Bienvenido, {firstName} {lastName} 👋
            </Heading>
            <Text style={text}>
              Gracias por unirte a LSB Shop. Estamos encantados de tenerte aquí.
            </Text>
            <Text style={text}>
              Explora nuestro catálogo y encuentra las mejores ofertas que hemos
              seleccionado para ti.
            </Text>
            <Section style={btnContainer}>
              <Link href={baseUrl} style={button}>
                Ir a la tienda
              </Link>
            </Section>
            <Text style={text}>
              Si tienes alguna duda o necesitas ayuda, puedes responder
              directamente a este correo.
            </Text>
          </Section>

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
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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
  margin: "20px 0 15px",
  color: "#1a1a1a",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  fontWeight: 400,
  color: "#1a1a1a",
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
  fontSize: "16px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 100px",
};

const footer = {
  borderTop: "1px solid #e6e6e6",
  marginTop: "20px",
  paddingTop: "20px",
  textAlign: "center" as const,
  width: "100%",
  maxWidth: "560px",
  margin: "0 auto",
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
