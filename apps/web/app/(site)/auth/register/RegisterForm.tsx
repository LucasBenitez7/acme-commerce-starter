"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";

import { Button, Input, Label } from "@/components/ui";

import { registerSchema } from "@/lib/validation/auth";

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
      {/* NOMBRE */}
      <div className="space-y-1">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          aria-invalid={!!fieldErrors.name}
        />
        {fieldErrors.name && (
          <p className="text-xs text-red-600">{fieldErrors.name}</p>
        )}
      </div>

      {/* EMAIL */}
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

      {/* PASSWORD */}
      <div className="space-y-1">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
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

      {/* CONFIRM PASSWORD */}
      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!fieldErrors.confirmPassword}
        />
        {fieldErrors.confirmPassword && (
          <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      {formError && <p className="text-xs text-red-600">{formError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      {/* Links footer... */}
      <p className="mt-2 text-xs text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <a
          href={`/auth/login?redirectTo=${encodeURIComponent(redirectToParam)}`}
          className="fx-underline-anim"
        >
          Inicia sesión
        </a>
      </p>
    </form>
  );
}
