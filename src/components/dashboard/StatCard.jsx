import { Card, CardContent } from "@/components/ui/card";
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
}) {
  const isClickable = typeof onClick === "function";

  function handleKeyDown(event) {
    if (!isClickable) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <Card
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        "transition-all hover:shadow-md",
        isClickable &&
          "cursor-pointer hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      )}
    >
      <CardContent className="p-6">
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
            COLOR_MAP[color]
          )}
        >
          {icon}
        </div>

        <p className="text-3xl font-bold text-foreground">{value}</p>

        <p className="mt-1 text-sm font-semibold text-foreground">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {description}
        </p>

        {isClickable && (
          <p className="mt-4 text-sm font-medium text-primary">
            {actionLabel} →
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;