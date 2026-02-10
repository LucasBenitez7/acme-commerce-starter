import { getStoreConfig } from "@/lib/settings/service";

import { SettingsForm } from "./_components/SettingsForm";

export const metadata = {
  title: "Configuración de la Tienda | Admin",
};

export default async function SettingsPage() {
  const config = await getStoreConfig();

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="border-b pb-2">
        <h1 className="text-2xl lg:text-3xl font-semibold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona el contenido de la página de inicio y otras opciones
          globales.
        </p>
      </div>

      <SettingsForm initialData={config} />
    </div>
  );
}
