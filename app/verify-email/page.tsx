import Link from "next/link";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { prisma } from "@/lib/db";

interface VerifyEmailPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token || typeof token !== "string") {
    return (
      <VerifyResult
        success={false}
        message="Token inválido o no proporcionado."
      />
    );
  }

  // 1. Buscar token
  const existingToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!existingToken) {
    return (
      <VerifyResult
        success={false}
        message="El token no existe o ha expirado."
      />
    );
  }

  // 2. Verificar expiración
  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return <VerifyResult success={false} message="El token ha expirado." />;
  }

  // 3. Verificar usuario
  const existingUser = await prisma.user.findUnique({
    where: { email: existingToken.identifier },
  });

  if (!existingUser) {
    return (
      <VerifyResult
        success={false}
        message="El email no corresponde a ningún usuario."
      />
    );
  }

  // 4. Actualizar usuario y borrar token
  await prisma.user.update({
    where: { id: existingUser.id },
    data: { emailVerified: new Date(), email: existingToken.identifier },
  });

  await prisma.verificationToken.delete({
    where: {
      identifier_token: { identifier: existingToken.identifier, token },
    },
  });

  return (
    <VerifyResult
      success={true}
      message="Tu correo ha sido verificado correctamente."
    />
  );
}

function VerifyResult({
  success,
  message,
}: {
  success: boolean;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
      <div
        className={`flex items-center justify-center p-6 rounded-full ${
          success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}
      >
        {success ? (
          <FaCircleCheck className="size-12" />
        ) : (
          <FaCircleXmark className="size-12" />
        )}
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {success ? "¡Email Verificado!" : "Error de Verificación"}
        </h1>
        <p className="text-muted-foreground max-w-sm mx-auto">{message}</p>
      </div>
      <Button asChild>
        <Link href="/">Volver a la tienda</Link>
      </Button>
    </div>
  );
}
