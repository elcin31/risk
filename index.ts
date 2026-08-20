export interface PricePoint {
  date: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

export interface AssetData {
  ticker: string;
  name?: string;
  prices: PricePoint[];
}

export interface PortfolioPosition {
  ticker: string;
  shares: number;
  avgPrice?: number;
}

export interface RiskMetrics {
  volatility: number;        // annualized std dev of returns
  var95: number;             // 95% VaR (daily)
  var99: number;             // 99% VaR (daily)
  maxDrawdown: number;       // max drawdown (%)
  sharpeRatio: number;       // annualized
  beta: number;              // beta to market (SPY)
  currentPrice: number;
  returns: number[];         // daily log returns
  cumulativeReturns: number[];
  drawdownSeries: number[];
}

export interface PortfolioRiskMetrics {
  totalValue: number;
  volatility: number;
  var95: number;
  var99: number;
  maxDrawdown: number;
  sharpeRatio: number;
  beta: number;
  concentrationHHI: number;  // Herfindahl-Hirschman Index
  positionRisks: PositionRisk[];
  sectorAllocation?: Record<string, number>;
}

export interface PositionRisk {
  ticker: string;
  value: number;
  weight: number;
  volatility: number;
  beta: number;
  contribution: number;      // risk contribution
}

export interface TimeSeriesData {
  dates: string[];
  values: number[];
}
