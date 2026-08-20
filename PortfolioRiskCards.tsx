"use client";

import { PortfolioRiskMetrics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatCurrency, formatNumber } from "@/lib/utils/helpers";
import { Activity, Target, TrendingDown, TrendingUp, BarChart3, PieChart } from "lucide-react";

interface Props {
  metrics: PortfolioRiskMetrics;
}

export function PortfolioRiskCards({ metrics }: Props) {
  const items = [
    {
      label: "Total Value",
      value: formatCurrency(metrics.totalValue),
      icon: PieChart,
      desc: "Current portfolio value",
      color: "default" as const,
    },
    {
      label: "Volatility (Ann.)",
      value: formatPercent(metrics.volatility),
      icon: Activity,
      desc: "Portfolio std dev",
      color: metrics.volatility > 0.25 ? "destructive" : metrics.volatility > 0.15 ? "warning" : "success",
    },
    {
      label: "VaR 95% (Daily)",
      value: formatPercent(metrics.var95),
      icon: Target,
      desc: "Expected max daily loss",
      color: metrics.var95 > 0.02 ? "destructive" : metrics.var95 > 0.01 ? "warning" : "success",
    },
    {
      label: "Max Drawdown",
      value: formatPercent(metrics.maxDrawdown),
      icon: TrendingDown,
      desc: "Largest decline",
      color: metrics.maxDrawdown < -0.25 ? "destructive" : metrics.maxDrawdown < -0.12 ? "warning" : "success",
    },
    {
      label: "Sharpe Ratio",
      value: formatNumber(metrics.sharpeRatio),
      icon: TrendingUp,
      desc: "Risk-adjusted return",
      color: metrics.sharpeRatio < 0 ? "destructive" : metrics.sharpeRatio < 0.5 ? "warning" : "success",
    },
    {
      label: "Beta (vs SPY)",
      value: formatNumber(metrics.beta),
      icon: BarChart3,
      desc: "Market sensitivity",
      color: metrics.beta > 1.3 || metrics.beta < 0.7 ? "warning" : "success",
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
              <Badge variant={item.color} className="mt-1 text-[10px]">
                {item.desc}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
