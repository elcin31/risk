import { PricePoint } from "@/types";
import { calculateReturns } from "./volatility";

export function calculateBeta(assetReturns: number[], marketReturns: number[]): number {
  const n = Math.min(assetReturns.length, marketReturns.length);
  if (n < 2) return 1;

  const aR = assetReturns.slice(-n);
  const mR = marketReturns.slice(-n);

  const meanA = aR.reduce((s, r) => s + r, 0) / n;
  const meanM = mR.reduce((s, r) => s + r, 0) / n;

  let covariance = 0;
  let marketVariance = 0;

  for (let i = 0; i < n; i++) {
    const da = aR[i] - meanA;
    const dm = mR[i] - meanM;
    covariance += da * dm;
    marketVariance += dm * dm;
  }

  covariance /= (n - 1);
  marketVariance /= (n - 1);

  if (marketVariance === 0) return 1;
  return covariance / marketVariance;
}
