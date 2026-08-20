import { PricePoint } from "@/types";

export function calculateReturns(prices: PricePoint[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1].close;
    const curr = prices[i].close;
    returns.push(Math.log(curr / prev));
  }
  return returns;
}

export function calculateVolatility(returns: number[]): number {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  const dailyStd = Math.sqrt(variance);
  // Annualize: sqrt(252) for trading days
  return dailyStd * Math.sqrt(252);
}
