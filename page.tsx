"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, PieChart, TrendingUp, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const POPULAR_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX"];

export default function HomePage() {
  const [searchTicker, setSearchTicker] = useState("");

  return (
    <div className="space-y-6 py-4">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">RiskGuard</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Analyze portfolio risk and individual asset metrics with real market data
        </p>
      </div>

      {/* Quick Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Asset Lookup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter ticker (e.g. AAPL)"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchTicker) {
                  window.location.href = `/asset/${searchTicker}`;
                }
              }}
            />
            <Button
              size="icon"
              disabled={!searchTicker}
              onClick={() => {
                if (searchTicker) window.location.href = `/asset/${searchTicker}`;
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TICKERS.map((t) => (
              <Link
                key={t}
                href={`/asset/${t}`}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors hover:bg-accent"
              >
                {t}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mode Cards */}
      <div className="grid gap-4">
        <Link href="/portfolio">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <PieChart className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">Portfolio Risk</h3>
                <p className="text-sm text-muted-foreground truncate">
                  VaR, volatility, Sharpe, drawdown for your positions
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/asset/AAPL">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">Single Asset</h3>
                <p className="text-sm text-muted-foreground truncate">
                  Volatility, beta, max drawdown for any ticker
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
