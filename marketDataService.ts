import { PricePoint } from "@/types";
import { fetchTwelveDataTimeSeries, fetchTwelveDataQuote } from "./providers/twelveData";
import { getCachedData, setCachedData } from "./cache";

export async function getHistoricalPrices(
  ticker: string,
  period: string = "1year"
): Promise<PricePoint[]> {
  const cacheKey = `prices_${ticker}_${period}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const outputsize = period === "1month" ? 22 : period === "3months" ? 66 : period === "6months" ? 126 : 252;
  const data = await fetchTwelveDataTimeSeries(ticker, "1day", outputsize);
  setCachedData(cacheKey, data);
  return data;
}

export async function getCurrentPrice(ticker: string): Promise<number> {
  const cacheKey = `price_${ticker}`;
  const cached = getCachedData(cacheKey);
  if (cached && cached.length > 0) return cached[cached.length - 1].close;

  const quote = await fetchTwelveDataQuote(ticker);
  return quote.price;
}

export async function getAssetName(ticker: string): Promise<string | undefined> {
  try {
    const quote = await fetchTwelveDataQuote(ticker);
    return quote.name;
  } catch {
    return undefined;
  }
}
