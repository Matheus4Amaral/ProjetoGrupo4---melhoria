import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLOR_MAP = {
  blue: "bg-primary/10 text-primary",
  green: "bg-chart-5/10 text-chart-5",
  yellow: "bg-chart-4/10 text-chart-4",
  red: "bg-destructive/10 text-destructive",
};

function StatCard({ icon, title, value, description, color = "blue" }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", COLOR_MAP[color])}>
          {icon}
        </div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm font-semibold text-foreground mt-1">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </CardContent>
    </Card>
  );
}

export default StatCard;