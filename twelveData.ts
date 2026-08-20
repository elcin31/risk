import { PricePoint } from "@/types";

const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || "";
const BASE_URL = "https://api.twelvedata.com";

interface TwelveDataTimeSeriesResponse {
  values?: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }>;
  status?: string;
  message?: string;
}

export async function fetchTwelveDataTimeSeries(
  ticker: string,
  interval: string = "1day",
  outputsize: number = 252
): Promise<PricePoint[]> {
  if (!API_KEY) {
    throw new Error("Twelve Data API key not configured. Add NEXT_PUBLIC_TWELVE_DATA_API_KEY to Vercel Environment Variables.");
  }

  const url = `${BASE_URL}/time_series?symbol=${encodeURIComponent(ticker)}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Twelve Data API error: ${response.status} ${response.statusText}`);
  }

  const data: TwelveDataTimeSeriesResponse = await response.json();

  if (data.status === "error" || !data.values) {
    throw new Error(data.message || `Failed to fetch data for ${ticker}`);
  }

  return data.values.reverse().map(v => ({
    date: v.datetime,
    close: parseFloat(v.close),
    open: parseFloat(v.open),
    high: parseFloat(v.high),
    low: parseFloat(v.low),
    volume: parseInt(v.volume, 10),
  }));
}

export async function fetchTwelveDataQuote(ticker: string): Promise<{ price: number; name?: string }> {
  if (!API_KEY) {
    throw new Error("Twelve Data API key not configured.");
  }

  const url = `${BASE_URL}/quote?symbol=${encodeURIComponent(ticker)}&apikey=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Twelve Data API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status === "error") {
    throw new Error(data.message || `Failed to fetch quote for ${ticker}`);
  }

  return {
    price: parseFloat(data.close || data.price || "0"),
    name: data.name,
  };
}
