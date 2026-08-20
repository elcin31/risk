export function calculateHHI(weights: number[]): number {
  if (weights.length === 0) return 0;
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return 0;
  const normalized = weights.map(w => w / sum);
  return normalized.reduce((sum, w) => sum + w * w, 0);
}

export function getConcentrationLabel(hhi: number): string {
  if (hhi < 0.15) return "Diversified";
  if (hhi < 0.25) return "Moderate";
  if (hhi < 0.35) return "Concentrated";
  return "Highly Concentrated";
}
