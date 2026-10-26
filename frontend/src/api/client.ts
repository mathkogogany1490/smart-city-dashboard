const configuredApi = import.meta.env.VITE_API_BASE_URL;
const configuredWs = import.meta.env.VITE_WS_URL;

// 빈 문자열이면 Nginx와 같은 주소로 호출합니다. 로컬 개발은 .env의 절대 주소를 사용합니다.
export const API_BASE_URL =
  configuredApi === "" ? "" : (configuredApi || "http://127.0.0.1:8000").replace(/\/$/, "");

export function resolveWsUrl(): string {
  if (configuredWs) return configuredWs;
  if (configuredWs === "" && typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/live`;
  }
  return "ws://127.0.0.1:8000/ws/live";
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new ApiError(response.status, `API ${response.status}`);
  }
  return response.json() as Promise<T>;
}
