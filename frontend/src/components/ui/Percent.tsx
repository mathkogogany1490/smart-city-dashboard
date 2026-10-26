import { formatPct } from "../../lib/format";

export function Percent({ value, upIsGood }: { value: number; upIsGood: boolean }) {
  const tone = value === 0 ? "flat" : value > 0 === upIsGood ? "good" : "bad";
  return <span className={`pct ${tone}`}>{formatPct(value)}</span>;
}
