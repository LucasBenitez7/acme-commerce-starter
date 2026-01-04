import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

type CategorySimple = {
  id: string;
  name: string;
  sort: number;
};

interface Props {
  existingCategories: CategorySimple[];
  currentId?: string;
}

export function CategorySortPreview({ existingCategories, currentId }: Props) {
  return (
    <div className="bg-neutral-50 border rounded-xs p-4 space-y-3 h-fit">
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">Orden Actual</h3>
        <p className="text-xs text-muted-foreground">
          Referencia para elegir la prioridad.
        </p>
      </div>

      <div className="space-y-2 overflow-y-auto pr-2 scrollbar-thin">
        {existingCategories.length === 0 && (
          <p className="text-xs text-neutral-400 italic">
            No hay categorías aún.
          </p>
        )}

        {existingCategories.map((cat) => {
          const isCurrent = cat.id === currentId;
          return (
            <div
              key={cat.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-xs text-sm border transition-colors",
                isCurrent
                  ? "bg-background border-foreground"
                  : "bg-background border hover:border-neutral-200 text-neutral-500",
              )}
            >
              <Badge
                variant={isCurrent ? "default" : "secondary"}
                className="w-8 justify-center font-medium text-xs"
              >
                {cat.sort}
              </Badge>
              <span
                className={cn(
                  "truncate font-medium",
                  isCurrent && "text-foreground",
                )}
              >
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t text-xs text-neutral-400 leading-tight">
        <p>
          💡 Tip: Si repites un número, el sistema moverá automáticamente los
          demás hacia abajo.
        </p>
      </div>
    </div>
  );
}
