import { Img } from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shop.lsbstack.com";
const logoUrl = `${baseUrl}/images/logo.png`;

const logoStyle: React.CSSProperties = {
  display: "block",
  margin: "0 auto 24px",
  width: "120px",
  height: "auto",
};

/** CSS para modo oscuro: invierte el logo para que se vea en fondos oscuros */
export const emailLogoDarkModeStyle = `
  @media (prefers-color-scheme: dark) {
    .email-logo-img { filter: invert(1); }
  }
`;

export function EmailHeader() {
  return (
    <>
      <style>{emailLogoDarkModeStyle}</style>
      <Img
        src={logoUrl}
        alt="LSB Shop"
        width={120}
        height={40}
        style={logoStyle}
        className="email-logo-img"
      />
    </>
  );
}
