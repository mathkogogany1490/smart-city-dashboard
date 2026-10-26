import type { ComplaintItem, ComplaintSummary } from "../../api/types";
import { formatNumber } from "../../lib/format";
import { Panel, QueryNotice } from "../ui/Panel";

const DAY_OPTIONS = [7, 30, 90];

type Props = {
  days: number;
  onDaysChange: (days: number) => void;
  data?: ComplaintSummary;
  loading: boolean;
  error: boolean;
  latest: ComplaintItem | null;
  large?: boolean;
};

export function ComplaintChart({ days, onDaysChange, data, loading, error, latest, large = false }: Props) {
  const max = Math.max(...(data?.items.map((item) => item.count) ?? [1]), 1);

  return (
    <Panel
      className={large ? "grow complaint-panel large" : "grow complaint-panel"}
      title="민원현황"
      subtitle="부서별 민원 접수 Top 10"
      extra={
        <select className="period-select" value={days} onChange={(event) => onDaysChange(Number(event.target.value))}>
          {DAY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              최근 {option}일
            </option>
          ))}
        </select>
      }
    >
      <QueryNotice loading={loading && !data} error={error && !data} />
      {data ? (
        <>
          <div className="bar-list">
            {data.items.map((item) => {
              const width = item.count === 0 ? 0 : Math.max((item.count / max) * 100, 3);
              const fresh = latest?.department_id === item.department_id;
              return (
                <div key={item.department_id} className={fresh ? "bar-row is-new" : "bar-row"}>
                  <span className="bar-name">{item.name}</span>
                  <div className="bar-track">
                    <span className="bar-fill" style={{ width: `${width}%` }} />
                  </div>
                  <strong className="bar-value">{formatNumber(item.count)}</strong>
                </div>
              );
            })}
          </div>
          <p className="panel-foot">
            합계 <b className="complaint-total">{formatNumber(data.total)}</b>건 · 실시간 반영
          </p>
        </>
      ) : null}
    </Panel>
  );
}
