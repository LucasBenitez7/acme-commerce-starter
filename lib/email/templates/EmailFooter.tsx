import { Container, Img, Link, Text } from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lsbshop.com";

export function EmailFooter() {
  return (
    <Container style={footer}>
      <Img
        src={`${baseUrl}/images/logo.png`}
        alt="LSB Shop"
        width="110"
        height="37"
        style={logoStyle}
      />
      <Text style={footerText}>
        © {new Date().getFullYear()} lsbshop. Todos los derechos reservados.
      </Text>
      <div style={footerLinks}>
        <Link href={`${baseUrl}/privacidad`} style={link}>
          Política de Privacidad
        </Link>
        <Link href={`${baseUrl}/terminos`} style={link}>
          Términos y Condiciones
        </Link>
        <Link href={`${baseUrl}/contacto`} style={link}>
          Contacto
        </Link>
      </div>
    </Container>
  );
}

const footer = {
  borderTop: "1px solid #e6e6e6",
  marginTop: "20px",
  paddingTop: "20px",
  textAlign: "center" as const,
  width: "100%",
  maxWidth: "560px",
  margin: "0 auto",
};

const logoStyle = {
  margin: "0 auto 12px",
  display: "block",
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
