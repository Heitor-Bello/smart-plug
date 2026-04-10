import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  unit: string;
  description: string;
  icon: ReactNode;
  color: "primary" | "warning" | "success" | "muted";
}

const colorMap: Record<
  StatsCardProps["color"],
  { icon: string; value: string }
> = {
  primary: {
    icon: "text-primary bg-primary/10",
    value: "text-primary",
  },
  warning: {
    icon: "text-warning bg-warning/10",
    value: "text-warning",
  },
  success: {
    icon: "text-success bg-success/10",
    value: "text-success",
  },
  muted: {
    icon: "text-muted-foreground bg-muted",
    value: "text-foreground",
  },
};

export function StatsCard({
  title,
  value,
  unit,
  description,
  icon,
  color,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`p-2 rounded-lg ${colors.icon}`}>{icon}</div>
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl font-bold ${colors.value}`}>{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}
