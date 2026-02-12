"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";

import { Button, Input, Label, PasswordInput } from "@/components/ui";

import { loginSchema } from "@/lib/auth/schema";

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const successMessage =
    searchParams.get("success") === "registered"
      ? "Cuenta creada correctamente. Inicia sesión."
      : null;

  const redirectToParam = searchParams.get("redirectTo") ?? redirectTo;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const result = loginSchema.safeParse(data);

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
      const res = await signIn("credentials", {
        redirect: false,
        email: result.data.email.toLowerCase(),
        password: result.data.password,
        callbackUrl: redirectToParam,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
          setFormError("Email o contraseña incorrectos.");
        } else {
          setFormError("Ha ocurrido un error al iniciar sesión.");
        }
        setIsSubmitting(false);
        return;
      }

      router.refresh();
      router.push(redirectToParam);
    } catch (error) {
      console.error(error);
      setFormError("Error de conexión.");
      setIsSubmitting(false);
    }
  }

  async function handleLoginWithGithub() {
    setFormError(null);
    await signIn("github", {
      callbackUrl: redirectToParam,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMessage && (
        <div className="rounded-xs bg-green-50 p-3 text-sm text-green-700 border border-green-200">
          {successMessage}
        </div>
      )}

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
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          aria-invalid={!!fieldErrors.password}
        />
        {fieldErrors.password && (
          <p className="text-xs text-red-600">{fieldErrors.password}</p>
        )}
      </div>

      {formError && <p className="text-xs text-red-600">{formError}</p>}

      <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
        {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>

      <div className="flex justify-start">
        <a
          href="/forgot-password"
          className="font-medium text-xs text-foreground hover:underline active:underline underline-offset-2"
        >
          ¿Has olvidado tu contraseña?
        </a>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>¿No tienes cuenta?</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Link
        href={`/auth/register?redirectTo=${encodeURIComponent(redirectToParam)}`}
        className="border border-border rounded-xs text-center flex items-center justify-center w-full h-10 font-medium hover:cursor-pointer text-sm hover:bg-neutral-50 text-foreground active:bg-neutral-50"
      >
        Crear cuenta
      </Link>

      {/* Lógica: Si venimos de un intento de compra, ofrecemos continuar como invitado */}
      {redirectToParam.includes("checkout") && (
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>o</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-10 hover:cursor-pointer"
            onClick={() => {
              router.push("/checkout");
            }}
          >
            Continuar como invitado
          </Button>
        </div>
      )}
    </form>
  );
}
