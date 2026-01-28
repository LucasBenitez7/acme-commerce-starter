import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Img,
} from "@react-email/components";
import * as React from "react";

import { formatCurrency } from "@/lib/currency";

import type { DisplayOrder } from "@/lib/orders/utils";

interface OrderSuccessEmailProps {
  order: DisplayOrder;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lsbstack.com";

export const OrderSuccessEmail = ({ order }: OrderSuccessEmailProps) => {
  const currency = order.currency || "EUR";
  const createdDate = new Date(order.createdAt).toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <Html>
      <Head />
      <Preview> </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>LSB SHOP</Heading>
          <Heading style={subHeader}>
            Detalles del Pedido Nº{" "}
            <span style={{ textTransform: "uppercase" }}>{order.id}</span>
          </Heading>

          <Section style={cardContainer}>
            <Section style={cardContent}>
              {/* ROW 1: PAYMENT & DATE */}
              <Row style={{ marginBottom: "14px" }}>
                <Column style={{ width: "60%", verticalAlign: "top" }}>
                  <Text style={labelStyle}>Método de pago</Text>
                  <Text style={valueStyle}>{order.paymentMethod}</Text>
                </Column>
                <Column style={{ width: "40%", verticalAlign: "top" }}>
                  <Text style={labelStyle}>Realizado</Text>
                  <Text style={valueStyle}>{createdDate}</Text>
                </Column>
              </Row>

              {/* ROW 2: CONTACT & SHIPPING */}
              <Row style={{ marginBottom: "14px" }}>
                <Column style={{ width: "60%", verticalAlign: "top" }}>
                  <Text style={labelStyle}>Datos de contacto</Text>
                  <Text style={valueStyle}>{order.contact.name}</Text>
                  <Text style={subValueStyle}>
                    {order.contact.phone || "Sin teléfono"}
                  </Text>
                </Column>
                <Column style={{ width: "40%", verticalAlign: "top" }}>
                  <Text style={labelStyle}>{order.shippingInfo.label}</Text>
                  {order.shippingInfo.addressLines.map((line, i) => (
                    <Text key={i} style={valueAddressStyle}>
                      {line}
                    </Text>
                  ))}
                </Column>
              </Row>

              {/* PRODUCTS */}
              <Section
                style={{ borderTop: "1px solid #e5e5e5", paddingTop: "6px" }}
              >
                <Heading as="h3" style={productsTitle}>
                  Productos ({order.items.length})
                </Heading>
                {order.items.map((item) => (
                  <Section key={item.id} style={itemRow}>
                    <Row>
                      <Column style={{ width: "80px", verticalAlign: "top" }}>
                        <Img
                          src={item.image || ""}
                          alt={item.name}
                          width={64}
                          height={85}
                          style={itemImage}
                        />
                      </Column>
                      <Column
                        style={{ verticalAlign: "top", paddingLeft: "0px" }}
                      >
                        <Row>
                          <Column>
                            <Text style={itemTitle}>{item.name}</Text>
                          </Column>
                          <Column style={{ textAlign: "right" }}>
                            <Text style={itemPrice}>
                              {formatCurrency(
                                item.price * item.quantity,
                                currency,
                              )}
                            </Text>
                          </Column>
                        </Row>
                        <Row style={{ marginTop: "2px" }}>
                          <Text style={itemSubtitle}>{item.subtitle}</Text>
                          <Text style={itemQty}>X{item.quantity}</Text>
                        </Row>
                      </Column>
                    </Row>
                  </Section>
                ))}
              </Section>

              {/* TOTALS */}
              <Section style={totalsSection}>
                <Row>
                  <Column>
                    <Text style={totalLabel}>Subtotal</Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={totalValue}>
                      {formatCurrency(order.totals.subtotal, currency)}
                    </Text>
                  </Column>
                </Row>
                <Row>
                  <Column>
                    <Text style={totalLabel}>Envío</Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text
                      style={{
                        ...totalValue,
                        color:
                          order.totals.shipping === 0 ? "#16a34a" : "#737373",
                      }}
                    >
                      {order.totals.shipping === 0
                        ? "Gratis"
                        : formatCurrency(order.totals.shipping, currency)}
                    </Text>
                  </Column>
                </Row>
                {order.totals.tax !== undefined && order.totals.tax > 0 && (
                  <Row style={{ borderTop: "1px solid #171717" }}>
                    <Column>
                      <Text style={totalLabel}>Impuestos</Text>
                    </Column>
                    <Column style={{ textAlign: "right" }}>
                      <Text style={totalValue}>
                        {formatCurrency(order.totals.tax, currency)}
                      </Text>
                    </Column>
                  </Row>
                )}
                <Row>
                  <Column>
                    <Text style={grandTotalLabel}>TOTAL</Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={grandTotalValue}>
                      {formatCurrency(order.totals.total, currency)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>
          </Section>

          <Section style={btnContainer}>
            <Link href={`${baseUrl}/account/orders/${order.id}`} style={button}>
              Ver pedido en la web
            </Link>
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

export default OrderSuccessEmail;

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
  margin: "0px 0px 30px",
  padding: "0",
  color: "#1a1a1a",
};

const subHeader = {
  fontSize: "18px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 20px",
  paddingBottom: "10px",
  borderBottom: "1px solid #e6e6e6",
  color: "#1a1a1a",
};

const cardContainer = {
  border: "1px solid #e5e5e5",
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  marginTop: "24px",
  backgroundColor: "#ffffff",
};

const cardContent = {
  padding: "18px",
};

const labelStyle = {
  fontSize: "14px",
  lineHeight: "16px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  color: "#1a1a1a",
  marginBottom: "4px",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const valueStyle = {
  fontSize: "14px",
  lineHeight: "20px",
  fontWeight: "500",
  color: "#171717",
  margin: "0",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const subValueStyle = {
  fontSize: "14px",
  lineHeight: "20px",
  fontWeight: "500",
  color: "#171717",
  margin: "0",
};

const valueAddressStyle = {
  fontSize: "14px",
  lineHeight: "20px",
  fontWeight: "500",
  color: "#171717",
  margin: "0",
};

const productsTitle = {
  fontSize: "18px",
  lineHeight: "28px",
  fontWeight: "700",
  color: "#171717",
  margin: "10px 0 16px 0",
};

const itemRow = {
  marginBottom: "10px",
};

const itemImage = {
  borderRadius: "2px",
  border: "1px solid #e5e5e5",
  objectFit: "cover" as const,
};

const itemTitle = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#171717",
  margin: "0 0 4px 0",
  lineHeight: "20px",
};

const itemSubtitle = {
  fontSize: "12px",
  color: "#171717",
  fontWeight: "500",
  margin: "0",
};

const itemPrice = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#171717",
  margin: "0",
  whiteSpace: "nowrap" as const,
};

const itemQty = {
  fontSize: "12px",
  color: "#171717",
  margin: "0",
};

const totalsSection = {
  borderTop: "1px solid #e5e5e5",
  paddingTop: "16px",
  marginTop: "16px",
};

const totalLabel = {
  fontSize: "14px",
  color: "#525252",
  fontWeight: "500",
  margin: "0 0 8px 0",
};

const totalValue = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#525252",
  margin: "0 0 8px 0",
};

const grandTotalLabel = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#171717",
  marginTop: "6px",
};

const grandTotalValue = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#171717",
  margin: "0",
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
  padding: "12px 60px",
};

const footer = {
  borderTop: "1px solid #e6e6e6",
  marginTop: "20px",
  paddingTop: "20px",
  textAlign: "center" as const,
  width: "100%",
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
