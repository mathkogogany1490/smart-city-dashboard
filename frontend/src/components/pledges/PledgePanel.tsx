import type { Pledge } from "../../api/types";
import { Icon } from "../icons";
import { Panel, QueryNotice } from "../ui/Panel";

const STYLE: Record<string, { color: string; icon: string }> = {
  education: { color: "#5eb0ff", icon: "book" },
  economy: { color: "#3ddc97", icon: "coin" },
  welfare: { color: "#ff8fab", icon: "heart" },
  city: { color: "#8eb4ff", icon: "building" },
  environment: { color: "#7dE7a8", icon: "leaf" },
  safety: { color: "#ffb020", icon: "shield" },
};

export function PledgePanel({ items, loading, error }: { items?: Pledge[]; loading: boolean; error: boolean }) {
  const year = items?.[0]?.year ?? 2024;
  return (
    <Panel className="pledge-panel" title="공약 현황" subtitle={`목표 달성률 (${year}년)`}>
      <QueryNotice loading={loading && !items} error={error && !items} />
      {items ? (
        <>
          <div className="pledge-grid">
            {items.map((item) => {
              const style = STYLE[item.icon] ?? { color: "#5eb0ff", icon: "shield" };
              const radius = 18;
              const circ = 2 * Math.PI * radius;
              return (
                <article key={item.id} className="pledge">
                  <div className="ring-wrap">
                    <svg viewBox="0 0 44 44" aria-hidden="true">
                      <circle className="ring-bg" cx="22" cy="22" r={radius} />
                      <circle
                        className="ring-fg"
                        cx="22"
                        cy="22"
                        r={radius}
                        stroke={style.color}
                        strokeDasharray={`${circ} ${circ}`}
                        strokeDashoffset={circ - (item.achievement_rate / 100) * circ}
                      />
                    </svg>
                    <span className="ring-icon" style={{ color: style.color }}>
                      <Icon name={style.icon} />
                    </span>
                  </div>
                  <strong>{Math.round(item.achievement_rate)}%</strong>
                  <em>{item.category}</em>
                </article>
              );
            })}
          </div>
          <div className="pledge-scale">
            <span>0</span>
            <span>시정과제 추진 현황 (단위: %)</span>
            <span>100</span>
          </div>
        </>
      ) : null}
    </Panel>
  );
}
