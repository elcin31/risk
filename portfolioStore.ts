import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PortfolioPosition } from "@/types";

interface PortfolioState {
  positions: PortfolioPosition[];
  addPosition: (position: PortfolioPosition) => void;
  removePosition: (ticker: string) => void;
  updatePosition: (ticker: string, updates: Partial<PortfolioPosition>) => void;
  clearPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      positions: [],
      addPosition: (position) =>
        set((state) => {
          const exists = state.positions.find((p) => p.ticker === position.ticker);
          if (exists) {
            return {
              positions: state.positions.map((p) =>
                p.ticker === position.ticker
                  ? { ...p, shares: p.shares + position.shares }
                  : p
              ),
            };
          }
          return { positions: [...state.positions, position] };
        }),
      removePosition: (ticker) =>
        set((state) => ({
          positions: state.positions.filter((p) => p.ticker !== ticker),
        })),
      updatePosition: (ticker, updates) =>
        set((state) => ({
          positions: state.positions.map((p) =>
            p.ticker === ticker ? { ...p, ...updates } : p
          ),
        })),
      clearPortfolio: () => set({ positions: [] }),
    }),
    {
      name: "risk-portfolio-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
