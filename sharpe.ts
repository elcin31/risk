import { PricePoint } from "@/types";
import { calculateReturns, calculateVolatility } from "./volatility";

const RISK_FREE_RATE = 0.045; // 4.5% annual — approximate current T-bill rate

export function calculateSharpeRatio(returns: number[]): number {
  if (returns.length < 2) return 0;
  const meanDailyReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const annualizedReturn = meanDailyReturn * 252;
  const volatility = calculateVolatility(returns);
  if (volatility === 0) return 0;
  return (annualizedReturn - RISK_FREE_RATE) / volatility;
}
