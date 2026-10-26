import type { PopulationItem } from "../../api/types";
import { Panel, QueryNotice } from "../ui/Panel";

const AGES = [
  { key: "age_0_14", label: "0-14세", color: "#9ec9ff" },
  { key: "age_15_64", label: "15-64세", color: "#3c89f0" },
  { key: "age_65_plus", label: "65세 이상", color: "#1d4e91" },
] as const;

function axisName(name: string) {
  return name === "배곧동" ? "배곧" : name;
}

type Props = {
  year: number;
  years: number[];
  onYearChange: (year: number) => void;
  items?: PopulationItem[];
  selectedId?: number | null;
  onSelect?: (id: number) => void;
  loading: boolean;
  error: boolean;
  large?: boolean;
};

export function PopulationChart({
  year,
  years,
  onYearChange,
  items,
  selectedId,
  onSelect,
  loading,
  error,
  large = false,
}: Props) {
  const height = large ? 320 : 188;
  const padL = 36;
  const padR = 6;
  const padT = 8;
  const padB = 46;
  const innerW = 360 - padL - padR;
  const innerH = height - padT - padB;
  const max = 60000;
  const groups = items ?? [];
  const groupW = groups.length ? innerW / groups.length : innerW;

  return (
    <Panel
      className="grow"
      title="인구현황"
      subtitle={`동별 인구수 (${years[0] ?? 2022}-${years[years.length - 1] ?? 2024})`}
      extra={
        <div className="year-switch">
          {(years.length ? years : [2022, 2023, 2024]).map((option) => (
            <button key={option} className={option === year ? "active" : ""} onClick={() => onYearChange(option)} type="button">
              {option}
            </button>
          ))}
        </div>
      }
    >
      <QueryNotice loading={loading && !items} error={error && !items} />
      {items ? (
        <>
          <div className="legend">
            {AGES.map((age) => (
              <span key={age.key}>
                <i style={{ background: age.color }} />
                {age.label}
              </span>
            ))}
            <em>단위: 명</em>
          </div>
          <svg className="pop-chart" viewBox={`0 0 360 ${height}`} role="img" aria-label="동별 인구 차트">
            {[0, 20000, 40000, 60000].map((tick) => {
              const y = padT + innerH - (tick / max) * innerH;
              return (
                <g key={tick}>
                  <line x1={padL} x2={354} y1={y} y2={y} className="grid-line" />
                  <text x={padL - 4} y={y + 3} textAnchor="end" className="axis-label">
                    {tick === 0 ? "0" : `${tick / 10000}만`}
                  </text>
                </g>
              );
            })}
            {groups.map((item, groupIndex) => {
              const selected = item.district_id === selectedId;
              const center = padL + groupIndex * groupW + groupW / 2;
              return (
                <g key={item.district_id} onClick={() => onSelect?.(item.district_id)} className="chart-group">
                  <rect
                    x={padL + groupIndex * groupW + 1}
                    y={padT}
                    width={Math.max(groupW - 2, 0)}
                    height={innerH}
                    className={selected ? "hit selected" : "hit"}
                  />
                  {AGES.map((age, index) => {
                    const value = item[age.key];
                    const barH = Math.min((value / max) * innerH, innerH);
                    const barW = Math.min(7, groupW / 5);
                    const x = center - (barW * 3 + 4) / 2 + index * (barW + 2);
                    return <rect key={age.key} x={x} y={padT + innerH - barH} width={barW} height={barH} fill={age.color} rx="1" />;
                  })}
                  <text x={center} y={padT + innerH + 16} textAnchor="end" className="axis-name" transform={`rotate(-38 ${center} ${padT + innerH + 16})`}>
                    {axisName(item.name)}
                  </text>
                </g>
              );
            })}
          </svg>
        </>
      ) : null}
    </Panel>
  );
}
