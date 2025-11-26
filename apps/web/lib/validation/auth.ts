import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Introduce tu email")
    .email("Introduce un email válido"),
  password: z.string().min(1, "Introduce tu contraseña"),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Introduce tu nombre"),
    email: z
      .string()
      .min(1, "Introduce tu email")
      .email("Introduce un email válido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(
        /(?=.*[A-Za-z])(?=.*\d)/,
        "Debe incluir al menos una letra y un número",
      ),
    confirmPassword: z.string().min(1, "Repite la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
