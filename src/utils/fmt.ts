export function fmtAmount(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const r = Math.round(n * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}
