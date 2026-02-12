import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface GuestAccessEmailProps {
  orderId: string;
  otp: string;
}

export const GuestAccessEmail = ({ orderId, otp }: GuestAccessEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Tu código de acceso para el pedido {orderId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Código de Verificación</Heading>
          <Text style={text}>
            Has solicitado acceder a los detalles del pedido{" "}
            <span style={bold}>{orderId}</span>.
          </Text>
          <Section style={codeContainer}>
            <Text style={code}>{otp}</Text>
          </Section>
          <Text style={text}>
            Introduce este código en la página de seguimiento para gestionar tu
            pedido o realizar devoluciones.
          </Text>
          <Text style={text}>
            Si no has solicitado este código, puedes ignorar este correo.
          </Text>
          <Text style={footer}>
            © 2026 LSB Shop. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default GuestAccessEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  padding: "0",
  color: "#000",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#000",
  marginBottom: "20px",
};

const bold = {
  fontWeight: "bold",
};

const codeContainer = {
  background: "rgba(0,0,0,0.05)",
  borderRadius: "4px",
  margin: "16px 0",
  padding: "16px",
  textAlign: "center" as const,
};

const code = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#000",
  letterSpacing: "4px",
  margin: "0",
};

const footer = {
  fontSize: "12px",
  color: "#898989",
  marginTop: "20px",
  textAlign: "center" as const,
};
