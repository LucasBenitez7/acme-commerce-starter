"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa6";
import { ImSpinner8 } from "react-icons/im";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { emailSchema } from "@/lib/auth/schema";

const formSchema = z.object({
  email: emailSchema,
});

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      setSuccess(true);
      toast.success("Correo enviado correctamente");
    } catch (error: any) {
      toast.error("Error al enviar la solicitud");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <Card className="w-full max-w-md py-4">
        {!success && (
          <CardHeader className="mb-4">
            <CardTitle className="text-2xl font-bold text-center">
              Recuperar Contraseña
            </CardTitle>
            <CardDescription className="text-center">
              Introduce tu email y te enviaremos las instrucciones para
              restablecer tu contraseña.
            </CardDescription>
          </CardHeader>
        )}
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center gap-4 text-center animate-in fade-in-50">
              <div className="rounded-full bg-green-100 p-3 text-green-600">
                <FaEnvelope className="size-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">¡Correo enviado!</h3>
                <p className="text-sm text-muted-foreground">
                  Si existe una cuenta con el email{" "}
                  <span className="font-medium text-foreground">
                    {form.getValues("email")}
                  </span>
                  , recibirás un enlace para restablecer tu contraseña.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Revisa tu bandeja de spam si no lo ves en unos minutos.
                </p>
              </div>
              <Button
                asChild
                className="w-full h-10 mb-3 mt-2"
                variant="default"
              >
                <Link href="/auth/login">Volver a Iniciar Sesión</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="tu@email.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="w-full h-10"
                  type="submit"
                  disabled={loading}
                >
                  {loading && <ImSpinner8 className="size-4 animate-spin" />}
                  Enviar enlace de recuperación
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="flex justify-center mt-4">
            <Link
              href="/auth/login"
              className="flex items-center text-xs text-foreground hover:underline underline-offset-2"
            >
              <FaArrowLeft className="mr-2 size-3" />
              Volver al inicio de sesión
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
