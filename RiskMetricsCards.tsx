"use client";

import { RiskMetrics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatNumber } from "@/lib/utils/helpers";
import { Activity, TrendingDown, TrendingUp, Target, BarChart3 } from "lucide-react";

interface Props {
  metrics: RiskMetrics;
  ticker: string;
}

export function RiskMetricsCards({ metrics, ticker }: Props) {
  const items = [
    {
      label: "Volatility (Ann.)",
      value: formatPercent(metrics.volatility),
      icon: Activity,
      desc: "Standard deviation of daily returns",
      color: metrics.volatility > 0.3 ? "destructive" : metrics.volatility > 0.2 ? "warning" : "success",
    },
    {
      label: "VaR 95% (Daily)",
      value: formatPercent(metrics.var95),
      icon: Target,
      desc: "Expected max loss at 95% confidence",
      color: metrics.var95 > 0.03 ? "destructive" : metrics.var95 > 0.02 ? "warning" : "success",
    },
    {
      label: "VaR 99% (Daily)",
      value: formatPercent(metrics.var99),
      icon: Target,
      desc: "Expected max loss at 99% confidence",
      color: metrics.var99 > 0.05 ? "destructive" : metrics.var99 > 0.03 ? "warning" : "success",
    },
    {
      label: "Max Drawdown",
      value: formatPercent(metrics.maxDrawdown),
      icon: TrendingDown,
      desc: "Largest peak-to-trough decline",
      color: metrics.maxDrawdown < -0.3 ? "destructive" : metrics.maxDrawdown < -0.15 ? "warning" : "success",
    },
    {
      label: "Sharpe Ratio",
      value: formatNumber(metrics.sharpeRatio),
      icon: TrendingUp,
      desc: "Risk-adjusted return (rf = 4.5%)",
      color: metrics.sharpeRatio < 0 ? "destructive" : metrics.sharpeRatio < 0.5 ? "warning" : "success",
    },
    {
      label: "Beta (vs SPY)",
      value: formatNumber(metrics.beta),
      icon: BarChart3,
      desc: "Sensitivity to market movements",
      color: metrics.beta > 1.5 || metrics.beta < 0.5 ? "warning" : "success",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="overflow-hidden">
            <CardHeader className="p-3 pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">{item.label}</CardTitle>
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="text-lg font-bold">{item.value}</div>
              <Badge variant={item.color as any} className="mt-1 text-[10px]">
                {item.desc}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
