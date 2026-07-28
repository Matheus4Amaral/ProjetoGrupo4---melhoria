import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const COLOR_MAP = {
  blue: "bg-primary/10 text-primary",
  green: "bg-chart-5/10 text-chart-5",
  yellow: "bg-chart-4/10 text-chart-4",
  red: "bg-destructive/10 text-destructive",
};

function StatCard({
  icon,
  title,
  value,
  description,
  color = "blue",
  onClick,
  actionLabel = "Ver detalhes",
  loading = false,
}) {
  const isClickable = typeof onClick === "function" && !loading;

  const body = (
    <CardContent className="p-6">
      <div
        className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
          COLOR_MAP[color]
        )}
      >
        {icon}
      </div>

      {loading ? (
        <>
          <Skeleton className="h-9 w-16" />
          <Skeleton className="mt-2 h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-36" />
        </>
      ) : (
        <>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </>
      )}

      {isClickable && (
        <p className="mt-4 text-sm font-medium text-primary">{actionLabel} →</p>
      )}
    </CardContent>
  );

  if (!isClickable) {
    return (
      <Card aria-busy={loading || undefined}>
        {body}
      </Card>
    );
  }

  return (
    <Card className="transition-all hover:-translate-y-1 hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
      <button
        type="button"
        onClick={onClick}
        className="w-full cursor-pointer text-left focus-visible:outline-none"
      >
        {body}
      </button>
    </Card>
  );
}

export default StatCard;
