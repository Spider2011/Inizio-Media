/* Number formatting for count-up stats ("10.2M" keeps one decimal while counting). */

export function decimalsOf(value: string): number {
  return (value.split('.')[1] ?? '').length;
}

export function formatCount(n: number, decimals: number): string {
  return decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
