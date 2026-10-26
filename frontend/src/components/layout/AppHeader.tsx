import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import type { CityStatus } from "../../api/types";
import { formatClock } from "../../lib/format";
import type { useLive } from "../../query/LiveProvider";
import { Icon } from "../icons";

const NAV = [
  { to: "/", label: "통계지리정보", icon: "map", end: true },
  { to: "/population", label: "인구", icon: "people", end: false },
  { to: "/pledges", label: "공약사항", icon: "flag", end: false },
  { to: "/complaints", label: "민원분석", icon: "doc", end: false },
  { to: "/city", label: "시정정보", icon: "news", end: false },
  { to: "/realestate", label: "부동산", icon: "building", end: false },
  { to: "/traffic", label: "교통정보 & CCTV", icon: "cctv", end: false },
  { to: "/share", label: "공유박스", icon: "box", end: false },
];

type LiveStatus = ReturnType<typeof useLive>["status"];

export function AppHeader({ city, liveStatus }: { city?: CityStatus; liveStatus: LiveStatus }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const liveLabel = liveStatus === "open" ? "실시간" : liveStatus === "connecting" ? "연결 중" : "재연결";

  return (
    <header className="header">
      <div className="brand">
        <span className="logo-mark">
          <Icon name="shield" />
        </span>
        <div>
          <strong>스마트시정</strong>
          <span>시흥시 · Smart City Dashboard</span>
        </div>
      </div>
      <nav className="nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="header-side">
        <span className={`live-status ${liveStatus}`}>
          <i />
          {liveLabel}
        </span>
        <div className="weather" title={city ? `출처 ${city.source}` : undefined}>
          <Icon name="sun" />
          <div>
            <strong>{city ? `${city.weather} ${city.temperature_c.toFixed(1)}°C` : "날씨 확인 중"}</strong>
            <span>
              {city?.name ?? "시흥시"} · {formatClock(now)} 기준
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
