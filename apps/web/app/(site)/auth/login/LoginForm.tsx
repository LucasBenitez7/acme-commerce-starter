"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";

import { Button, Input, Label, PasswordInput } from "@/components/ui";

import { loginSchema } from "@/lib/validation/auth";

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mensaje de éxito si venimos del registro (opcional)
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

    // 1. Validación con Zod
    const result = loginSchema.safeParse(data);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        // Usamos String() para evitar el error de índice
        if (issue.path[0]) {
          formattedErrors[String(issue.path[0])] = issue.message;
        }
      });
      setFieldErrors(formattedErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Login con NextAuth (Credentials)
      // redirect: false es importante para manejar el error aquí mismo
      const res = await signIn("credentials", {
        redirect: false,
        email: result.data.email.toLowerCase(),
        password: result.data.password,
        callbackUrl: redirectToParam,
      });

      if (res?.error) {
        // "CredentialsSignin" es el código estándar cuando falla user/pass
        if (res.error === "CredentialsSignin") {
          setFormError("Email o contraseña incorrectos.");
        } else {
          setFormError("Ha ocurrido un error al iniciar sesión.");
        }
        setIsSubmitting(false);
        return;
      }

      // 3. Éxito
      // router.refresh() actualiza el servidor para que el layout sepa que hay sesión
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
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>

      {/* Separador */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>o</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* GitHub Login */}
      <Button
        type="button"
        variant="outline"
        className="w-full text-xs"
        onClick={handleLoginWithGithub}
      >
        Continuar con GitHub
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full text-xs"
        onClick={handleLoginWithGithub}
      >
        Continuar con Google
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full text-xs"
        onClick={handleLoginWithGithub}
      >
        Continuar con Icloud
      </Button>

      <p className="mt-2 text-xs font-medium">
        ¿No tienes cuenta?{" "}
        <a
          href={`/auth/register?redirectTo=${encodeURIComponent(redirectToParam)}`}
          className="fx-underline-anim"
        >
          Crear cuenta
        </a>
      </p>

      {/* Lógica: Si venimos de un intento de compra, ofrecemos continuar como invitado */}
      {redirectToParam.includes("checkout") && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>o</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full text-xs hover:cursor-pointer"
            onClick={() => {
              // Navegamos directamente al checkout sin loguearnos
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
