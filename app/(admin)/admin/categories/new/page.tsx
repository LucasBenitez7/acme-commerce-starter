import { CategoryForm } from "../_components/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Nueva Categoría</h1>
        <p className="text-sm text-muted-foreground">
          Crea una categoría para organizar tus productos.
        </p>
      </div>
      <CategoryForm />
    </div>
  );
}
