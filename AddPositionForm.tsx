"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { usePortfolioStore } from "@/lib/store/portfolioStore";

export function AddPositionForm() {
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const addPosition = usePortfolioStore((s) => s.addPosition);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !shares) return;
    addPosition({
      ticker: ticker.toUpperCase(),
      shares: parseFloat(shares),
    });
    setTicker("");
    setShares("");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add Position</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="uppercase"
          />
          <Input
            placeholder="Shares"
            type="number"
            step="any"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
