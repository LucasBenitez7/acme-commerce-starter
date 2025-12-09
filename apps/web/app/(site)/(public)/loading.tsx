import { Separator, Skeleton } from "@/components/ui";

export default function LoadingPublic() {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i: number) => (
          <div key={i} className="overflow-hidden rounded-xs border">
            <Skeleton className="aspect-[4/5] w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
