import { Card, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

interface KPICardProps {
  title: string;
  value: number;
  prefix?: React.ReactNode;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "accent" | "warning" | "destructive" | "info";
}

export default function KPICard({
  title,
  value,
  prefix,
  suffix,
  trend,
  color = "primary",
}: KPICardProps) {
  const colorClasses = {
    primary: "border-l-4 border-l-primary",
    accent: "border-l-4 border-l-accent",
    warning: "border-l-4 border-l-warning",
    destructive: "border-l-4 border-l-destructive",
    info: "border-l-4 border-l-info",
  };

  return (
    <Card className={`shadow-kpi hover:shadow-md transition-all ${colorClasses[color]}`}>
      <Statistic
        title={<span className="text-muted-foreground font-medium">{title}</span>}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ color: `hsl(var(--${color}))`, fontWeight: 600 }}
      />
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          {trend.isPositive ? (
            <ArrowUpOutlined className="text-accent text-xs" />
          ) : (
            <ArrowDownOutlined className="text-destructive text-xs" />
          )}
          <span
            className={`text-xs font-medium ${
              trend.isPositive ? "text-accent" : "text-destructive"
            }`}
          >
            {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">vs last month</span>
        </div>
      )}
    </Card>
  );
}
