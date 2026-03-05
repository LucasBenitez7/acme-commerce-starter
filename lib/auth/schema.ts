import { z } from "zod";

export const phoneRegex = /^[0-9+\s]+$/;

export const emailSchema = z
  .string()
  .min(1, "Introduce tu email")
  .email({ message: "Introduce un email válido" });

export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(
    /(?=.*[A-Za-z])(?=.*\d)/,
    "Debe incluir al menos una letra y un número",
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Introduce tu contraseña"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Mínimo 2 letras"),
    lastName: z.string().min(2, "Mínimo 2 letras"),
    phone: z
      .string()
      .trim()
      .min(6, "Teléfono inválido")
      .regex(phoneRegex, "Solo números"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Repite la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
