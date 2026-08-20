import { PricePoint } from "@/types";
import { calculateReturns } from "./volatility";

export function calculateParametricVaR(returns: number[], confidence: number = 0.95): number {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  const std = Math.sqrt(variance);

  // Z-scores for common confidence levels
  const zScores: Record<number, number> = {
    0.9: 1.282,
    0.95: 1.645,
    0.99: 2.326,
  };
  const z = zScores[confidence] || 1.645;

  // VaR as negative return (loss)
  return -(mean - z * std);
}

export function calculateHistoricalVaR(returns: number[], confidence: number = 0.95): number {
  if (returns.length === 0) return 0;
  const sorted = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidence) * sorted.length);
  return -sorted[index];
}
