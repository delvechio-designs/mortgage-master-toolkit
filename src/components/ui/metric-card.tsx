import { cn } from "@/lib/utils";
import { Card } from "./card";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color: "blue" | "green" | "orange" | "purple" | "red" | "teal";
  className?: string;
}

const colorVariants = {
  blue: "bg-metric-blue text-white",
  green: "bg-metric-green text-white", 
  orange: "bg-metric-orange text-white",
  purple: "bg-metric-purple text-white",
  red: "bg-metric-red text-white",
  teal: "bg-metric-teal text-white",
};

export function MetricCard({ title, value, subtitle, color, className }: MetricCardProps) {
  return (
    <Card className={cn(
      "p-4 text-center",
      colorVariants[color],
      className
    )}>
      <div className="text-sm font-medium opacity-90">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {subtitle && (
        <div className="text-sm opacity-90 mt-1">{subtitle}</div>
      )}
    </Card>
  );
}