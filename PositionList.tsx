"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { formatCurrency } from "@/lib/utils/helpers";
import Link from "next/link";

interface Props {
  prices: Record<string, number>;
}

export function PositionList({ prices }: Props) {
  const { positions, removePosition } = usePortfolioStore();

  if (positions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No positions yet. Add your first holding above.
        </CardContent>
      </Card>
    );
  }

  const totalValue = positions.reduce(
    (sum, p) => sum + (prices[p.ticker] || 0) * p.shares,
    0
  );

  return (
    <div className="space-y-2">
      {positions.map((pos) => {
        const price = prices[pos.ticker] || 0;
        const value = price * pos.shares;
        const weight = totalValue > 0 ? value / totalValue : 0;
        return (
          <Card key={pos.ticker} className="overflow-hidden">
            <CardContent className="p-3 flex items-center gap-3">
              <Link
                href={`/asset/${pos.ticker}`}
                className="flex-1 min-w-0"
              >
                <div className="font-semibold">{pos.ticker}</div>
                <div className="text-xs text-muted-foreground">
                  {pos.shares} shares @ {formatCurrency(price)} = {formatCurrency(value)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Weight: {(weight * 100).toFixed(1)}%
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive"
                onClick={() => removePosition(pos.ticker)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
