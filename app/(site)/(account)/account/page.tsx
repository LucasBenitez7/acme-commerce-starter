import { Input, Label } from "@/components/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { auth } from "@/lib/auth";

export default async function AccountProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Perfil</h2>
        <p className="text-muted-foreground">
          Gestiona tu información personal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos Personales</CardTitle>
          <CardDescription>Información básica de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                defaultValue={user.firstName || ""}
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Apellidos</Label>
              <Input
                defaultValue={user.lastName || ""}
                readOnly
                className="bg-muted/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              defaultValue={user.email || ""}
              readOnly
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              El email no se puede cambiar por seguridad.
            </p>
          </div>

          {user.phone && (
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                defaultValue={user.phone}
                readOnly
                className="bg-muted/50"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
