"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";

import { Button, Input, Label, PasswordInput } from "@/components/ui";

import { registerSchema } from "@/lib/auth/schema";

type Props = {
  action: (
    formData: FormData,
  ) => Promise<{ error?: string; success?: boolean }>;
  redirectTo: string;
};

export function RegisterForm({ action, redirectTo }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectToParam = searchParams.get("redirectTo") ?? "/";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const result = registerSchema.safeParse(data);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[String(issue.path[0])] = issue.message;
        }
      });
      setFieldErrors(formattedErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await action(formData);

      if (response?.error) {
        if (response.error === "exists")
          setFormError("Ya existe una cuenta con este email.");
        else setFormError("Ha ocurrido un error inesperado.");
        setIsSubmitting(false);
      } else if (response?.success) {
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: result.data.email.toLowerCase(),
          password: result.data.password,
          callbackUrl: redirectToParam,
        });

        if (loginRes?.error) {
          router.push("/auth/login?success=registered");
        } else {
          router.refresh();
          router.push(redirectToParam);
        }
      }
    } catch (error) {
      console.error(error);
      setFormError("Error de conexión.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* GRID PARA NOMBRE Y APELLIDO EN UNA FILA */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            aria-invalid={!!fieldErrors.firstName}
          />
          {fieldErrors.firstName && (
            <p className="text-xs text-red-600">{fieldErrors.firstName}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="lastName">Apellidos</Label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            aria-invalid={!!fieldErrors.lastName}
          />
          {fieldErrors.lastName && (
            <p className="text-xs text-red-600">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={!!fieldErrors.phone}
        />
        {fieldErrors.phone && (
          <p className="text-xs text-red-600">{fieldErrors.phone}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
        />
        {fieldErrors.email && (
          <p className="text-xs text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Contraseña</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          aria-invalid={!!fieldErrors.password}
        />
        {fieldErrors.password && (
          <p className="text-xs text-red-600">{fieldErrors.password}</p>
        )}
        <p className="text-[11px] text-muted-foreground">
          Mínimo 8 caracteres, letra y número.
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          aria-invalid={!!fieldErrors.confirmPassword}
        />
        {fieldErrors.confirmPassword && (
          <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      {formError && <p className="text-xs text-red-600">{formError}</p>}

      <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
        {isSubmitting ? "Registrando..." : "Crear cuenta"}
      </Button>

      <p className="mt-2 text-xs text-foreground font-medium">
        ¿Ya tienes cuenta?{" "}
        <a
          href={`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="text-xs text-foreground hover:underline active:underline underline-offset-2"
        >
          Iniciar sesión
        </a>
      </p>
    </form>
  );
}
