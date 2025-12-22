import { Card, CardContent } from "@/components/ui/card";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: any;
  subtext?: string;
  trend?: "normal" | "low" | "good";
};

export function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  trend = "normal",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div
          className={cn(
            "p-3 rounded-full",
            trend === "low" && "bg-red-50 text-red-600",
            trend === "good" && "bg-green-50 text-green-600",
            trend === "normal" && "bg-neutral-100 text-neutral-600",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3
            className={cn(
              "text-2xl font-bold",
              trend === "low" ? "text-red-600" : "text-foreground",
            )}
          >
            {value}
          </h3>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
