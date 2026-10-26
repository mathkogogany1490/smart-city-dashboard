export function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function formatManwon(value: number) {
  if (value >= 10000) {
    const eok = Math.floor(value / 10000);
    const rest = value % 10000;
    return rest ? `${eok}억 ${formatNumber(rest)}만` : `${eok}억`;
  }
  return `${formatNumber(value)}만`;
}

export function formatPct(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatRate(value: number, digits = 1) {
  return value.toFixed(digits);
}

export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${year}.${month}.${day}`;
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(new Date(iso));
}

export function formatClock(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(date);
}
