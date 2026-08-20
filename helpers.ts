import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number, digits = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(digits)}%`;
}

export function formatCurrency(value: number, digits = 0): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(digits)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(digits)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(digits)}K`;
  return `$${value.toFixed(digits)}`;
}

export function formatNumber(value: number, digits = 2): string {
  return value.toFixed(digits);
}
