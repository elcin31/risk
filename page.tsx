"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RiskMetricsCards } from "@/components/asset/RiskMetricsCards";
import { PriceChart } from "@/components/asset/PriceChart";
import { DrawdownChart } from "@/components/asset/DrawdownChart";
import { getHistoricalPrices } from "@/lib/data/marketDataService";
import {
  calculateReturns,
  calculateVolatility,
  calculateParametricVaR,
  calculateHistoricalVaR,
  calculateDrawdowns,
  calculateSharpeRatio,
  calculateBeta,
} from "@/lib/calculations/risk";
import { RiskMetrics, PricePoint } from "@/types";
import { formatCurrency, formatPercent, cn } from "@/lib/utils/helpers";

const SPY_TICKER = "SPY";

export default function AssetPage() {
  const params = useParams();
  const ticker = (params.ticker as string)?.toUpperCase() || "";

  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [spyPrices, setSpyPrices] = useState<PricePoint[]>([]);
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("1year");

  const loadData = useCallback(async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
      const [assetData, spyData] = await Promise.all([
        getHistoricalPrices(ticker, period),
        getHistoricalPrices(SPY_TICKER, period),
      ]);

      setPrices(assetData);
      setSpyPrices(spyData);

      const returns = calculateReturns(assetData);
      const spyReturns = calculateReturns(spyData);
      const { maxDrawdown, drawdownSeries, cumulativeReturns } = calculateDrawdowns(assetData);
      const volatility = calculateVolatility(returns);
      const var95 = calculateHistoricalVaR(returns, 0.95);
      const var99 = calculateHistoricalVaR(returns, 0.99);
      const sharpe = calculateSharpeRatio(returns);
      const beta = calculateBeta(returns, spyReturns);
      const currentPrice = assetData[assetData.length - 1]?.close || 0;

      setMetrics({
        volatility,
        var95,
        var99,
        maxDrawdown,
        sharpeRatio: sharpe,
        beta,
        currentPrice,
        returns,
        cumulativeReturns,
        drawdownSeries,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [ticker, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4 py-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{ticker}</h1>
          {metrics && (
            <p className="text-sm text-muted-foreground">
              ${metrics.currentPrice.toFixed(2)} · {prices.length} days
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={loadData}
          disabled={loading}
          className="shrink-0"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Period selector */}
      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1month">1M</TabsTrigger>
          <TabsTrigger value="3months">3M</TabsTrigger>
          <TabsTrigger value="6months">6M</TabsTrigger>
          <TabsTrigger value="1year">1Y</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      {loading && !metrics && (
        <div className="space-y-3">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {metrics && (
        <>
          {/* Price Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Price History</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceChart prices={prices} />
            </CardContent>
          </Card>

          {/* Metrics */}
          <RiskMetricsCards metrics={metrics} ticker={ticker} />

          {/* Drawdown Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Drawdown</CardTitle>
            </CardHeader>
            <CardContent>
              <DrawdownChart
                dates={prices.map((p) => p.date)}
                drawdowns={metrics.drawdownSeries}
              />
            </CardContent>
          </Card>

          {/* Returns Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Daily Returns Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ReturnsDistribution returns={metrics.returns} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function ReturnsDistribution({ returns }: { returns: number[] }) {
  if (returns.length === 0) return null;

  const bins = 30;
  const min = Math.min(...returns);
  const max = Math.max(...returns);
  const binWidth = (max - min) / bins || 1;
  const histogram = new Array(bins).fill(0);

  returns.forEach((r) => {
    const idx = Math.min(Math.floor((r - min) / binWidth), bins - 1);
    histogram[idx]++;
  });

  const data = histogram.map((count, i) => ({
    bin: `${((min + i * binWidth) * 100).toFixed(1)}%`,
    count,
  }));

  const maxCount = Math.max(...histogram);

  return (
    <div className="h-40 w-full flex items-end gap-0.5 px-1">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 bg-primary/60 rounded-t-sm min-w-[2px]"
          style={{ height: `${(d.count / maxCount) * 100}%` }}
          title={`${d.bin}: ${d.count} days`}
        />
      ))}
    </div>
  );
}
