"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddPositionForm } from "@/components/portfolio/AddPositionForm";
import { PositionList } from "@/components/portfolio/PositionList";
import { PortfolioRiskCards } from "@/components/portfolio/PortfolioRiskCards";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { getHistoricalPrices, getCurrentPrice } from "@/lib/data/marketDataService";
import {
  calculateReturns,
  calculateVolatility,
  calculateHistoricalVaR,
  calculateDrawdowns,
  calculateSharpeRatio,
  calculateBeta,
  calculateHHI,
} from "@/lib/calculations/risk";
import { PortfolioRiskMetrics, PricePoint, PositionRisk } from "@/types";

const SPY_TICKER = "SPY";

export default function PortfolioPage() {
  const positions = usePortfolioStore((s) => s.positions);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [metrics, setMetrics] = useState<PortfolioRiskMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (positions.length === 0) {
      setMetrics(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tickers = positions.map((p) => p.ticker);
      const priceMap: Record<string, number> = {};

      // Fetch current prices
      await Promise.all(
        tickers.map(async (t) => {
          try {
            const price = await getCurrentPrice(t);
            priceMap[t] = price;
          } catch {
            priceMap[t] = 0;
          }
        })
      );
      setPrices(priceMap);

      // Fetch historical prices for all positions + SPY
      const allTickers = [...tickers, SPY_TICKER];
      const histData: Record<string, PricePoint[]> = {};
      await Promise.all(
        allTickers.map(async (t) => {
          try {
            histData[t] = await getHistoricalPrices(t, "1year");
          } catch {
            histData[t] = [];
          }
        })
      );

      // Calculate position-level metrics
      const positionRisks: PositionRisk[] = [];
      const dataLengths = Object.values(histData).map((d) => d.length).filter((l) => l > 0);
      const minLen = dataLengths.length > 0 ? Math.min(...dataLengths) : 0;
      const spyReturns = calculateReturns(histData[SPY_TICKER] || []);
      const portfolioReturns: number[] = [];
      let totalValue = 0;

      positions.forEach((pos) => {
        const data = histData[pos.ticker] || [];
        const price = priceMap[pos.ticker] || 0;
        const value = price * pos.shares;
        totalValue += value;

        const returns = calculateReturns(data);
        const volatility = calculateVolatility(returns);
        const beta = calculateBeta(returns, spyReturns);
        positionRisks.push({
          ticker: pos.ticker,
          value,
          weight: 0,
          volatility,
          beta,
          contribution: 0,
        });
      });

      // Recalculate weights
      positionRisks.forEach((p) => {
        p.weight = totalValue > 0 ? p.value / totalValue : 0;
      });

      // Portfolio returns (value-weighted)
      const alignedReturns: number[][] = [];
      positions.forEach((pos) => {
        const data = histData[pos.ticker] || [];
        const returns = calculateReturns(data);
        alignedReturns.push(returns.slice(-minLen + 1));
      });

      for (let i = 0; i < (alignedReturns[0]?.length || 0); i++) {
        let dailyReturn = 0;
        positions.forEach((pos, idx) => {
          const weight = positionRisks[idx].weight;
          dailyReturn += (alignedReturns[idx][i] || 0) * weight;
        });
        portfolioReturns.push(dailyReturn);
      }

      // Portfolio-level metrics
      const volatility = calculateVolatility(portfolioReturns);
      const var95 = calculateHistoricalVaR(portfolioReturns, 0.95);
      const var99 = calculateHistoricalVaR(portfolioReturns, 0.99);
      const sharpe = calculateSharpeRatio(portfolioReturns);
      const beta = calculateBeta(portfolioReturns, spyReturns);

      // Approximate drawdown from portfolio returns
      let cumulative = 0;
      let peak = 0;
      let maxDrawdown = 0;
      portfolioReturns.forEach((r) => {
        cumulative += r;
        if (cumulative > peak) peak = cumulative;
        const dd = cumulative - peak;
        if (dd < maxDrawdown) maxDrawdown = dd;
      });

      const hhi = calculateHHI(positionRisks.map((p) => p.weight));

      setMetrics({
        totalValue,
        volatility,
        var95,
        var99,
        maxDrawdown,
        sharpeRatio: sharpe,
        beta,
        concentrationHHI: hhi,
        positionRisks,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate portfolio risk");
    } finally {
      setLoading(false);
    }
  }, [positions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Portfolio Risk</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <AddPositionForm />

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      <PositionList prices={prices} />

      {metrics && (
        <>
          <div className="text-xs text-muted-foreground text-center">
            HHI Concentration: {metrics.concentrationHHI.toFixed(3)} (
            {metrics.concentrationHHI < 0.15
              ? "Diversified"
              : metrics.concentrationHHI < 0.25
              ? "Moderate"
              : metrics.concentrationHHI < 0.35
              ? "Concentrated"
              : "Highly Concentrated"}
            )
          </div>
          <PortfolioRiskCards metrics={metrics} />
        </>
      )}
    </div>
  );
}
