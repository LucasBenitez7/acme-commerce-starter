"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Resend } from "resend";

import { prisma } from "@/lib/db";
import { GuestAccessEmail } from "@/lib/email/templates/GuestAccessEmail";
import {
  requestOrderReturn,
  type ReturnRequestItem,
} from "@/lib/orders/service";

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. SOLICITAR CÓDIGO DE ACCESO
export async function requestGuestAccess(orderId: string, email: string) {
  // 1. Validar entrada
  if (!orderId || !email) {
    return { error: "Por favor, introduce el ID del pedido y tu email." };
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanOrderId = orderId.trim();

  try {
    // 2. Buscar el pedido
    const order = await prisma.order.findUnique({
      where: { id: cleanOrderId },
    });

    if (!order) {
      return { error: "No encontramos un pedido con esos datos." };
    }

    // 3. Validar Email
    if (order.email.toLowerCase() !== cleanEmail) {
      return { error: "No encontramos un pedido con esos datos." };
    }

    // 4. Generar OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 5. Guardar OTP en DB
    await prisma.order.update({
      where: { id: cleanOrderId },
      data: {
        guestAccessCode: otp,
        guestAccessCodeExpiry: expiresAt,
      },
    });

    // 6. Enviar Email
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: [cleanEmail],
      subject: `Código de verificación`,
      react: GuestAccessEmail({ orderId: cleanOrderId, otp }),
    });

    if (error) {
      console.error("Email Error:", error);
      return {
        error: "Error al enviar el correo. Inténtalo de nuevo más tarde.",
      };
    }

    return { success: true, message: "Código enviado a tu correo." };
  } catch (error) {
    console.error("Guest Access Request Error:", error);
    return { error: "Ocurrió un error inesperado." };
  }
}

// 2. VERIFICAR CÓDIGO DE ACCESO
export async function verifyGuestAccess(
  orderId: string,
  email: string,
  code: string,
) {
  if (!orderId || !email || !code) {
    return { error: "Faltan datos." };
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanOrderId = orderId.trim();
  const cleanCode = code.trim();

  try {
    const order = await prisma.order.findUnique({
      where: { id: cleanOrderId },
    });

    if (!order || order.email.toLowerCase() !== cleanEmail) {
      return { error: "Datos incorrectos." };
    }

    // 1. Verificar Código y Expiración
    if (
      !order.guestAccessCode ||
      order.guestAccessCode !== cleanCode ||
      !order.guestAccessCodeExpiry ||
      new Date() > order.guestAccessCodeExpiry
    ) {
      return { error: "Código inválido o expirado." };
    }

    // 2. Código Válido -> Crear Cookie de Sesión
    const cookieStore = await cookies();

    cookieStore.set(`guest_access_${cleanOrderId}`, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 2,
      path: "/",
    });

    // 3. Limpiar el código usado (Single Use)
    await prisma.order.update({
      where: { id: cleanOrderId },
      data: {
        guestAccessCode: null,
        guestAccessCodeExpiry: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Guest Verify Error:", error);
    return { error: "Error al verificar el código." };
  }
}

// 3. SOLICITAR DEVOLUCIÓN (INVITADO)
export async function requestReturnGuestAction(
  orderId: string,
  reason: string,
  items: ReturnRequestItem[],
) {
  // 1. Verificar Cookie de Acceso
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(`guest_access_${orderId}`);

  if (!hasAccess) {
    return { error: "Tu sesión de invitado ha expirado. Vuelve a ingresar." };
  }

  // 2. Validaciones
  if (!reason || reason.trim().length < 5) {
    return {
      error: "Por favor, indica un motivo detallado (mínimo 5 caracteres).",
    };
  }
  if (!items || items.length === 0) {
    return { error: "Selecciona al menos un producto para devolver." };
  }

  try {
    // 3. Llamar al servicio (userId = null)
    await requestOrderReturn(orderId, null, reason, items);

    revalidatePath(`/tracking/${orderId}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Error al solicitar la devolución" };
  }
}
