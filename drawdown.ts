import { PricePoint } from "@/types";

export function calculateDrawdowns(prices: PricePoint[]): {
  maxDrawdown: number;
  drawdownSeries: number[];
  cumulativeReturns: number[];
} {
  if (prices.length === 0) return { maxDrawdown: 0, drawdownSeries: [], cumulativeReturns: [] };

  const cumulativeReturns: number[] = [0];
  let peak = prices[0].close;
  const drawdownSeries: number[] = [0];
  let maxDrawdown = 0;

  for (let i = 1; i < prices.length; i++) {
    const price = prices[i].close;
    const ret = Math.log(price / prices[i - 1].close);
    cumulativeReturns.push(cumulativeReturns[cumulativeReturns.length - 1] + ret);

    if (price > peak) peak = price;
    const dd = Math.log(price / peak);
    drawdownSeries.push(dd);
    if (dd < maxDrawdown) maxDrawdown = dd;
  }

  return { maxDrawdown, drawdownSeries, cumulativeReturns };
}
