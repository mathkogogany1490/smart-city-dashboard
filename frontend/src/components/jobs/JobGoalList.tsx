import type { JobGoal } from "../../api/types";
import { formatRate } from "../../lib/format";
import { Panel, QueryNotice } from "../ui/Panel";

export function JobGoalList({ items, loading, error }: { items?: JobGoal[]; loading: boolean; error: boolean }) {
  const year = items?.[0]?.year ?? 2024;
  return (
    <Panel className="jobs-panel" title="일자리" subtitle={`일자리 목표 달성률 (${year}년)`}>
      <QueryNotice loading={loading && !items} error={error && !items} />
      {items ? (
        <div className="job-list">
          {items.map((item) => (
            <div key={item.id} className="job-row">
              <span>{item.name}</span>
              <div className="job-track">
                <span style={{ width: `${Math.min(item.achievement_rate, 100)}%` }} />
              </div>
              <strong>{formatRate(item.achievement_rate)}%</strong>
            </div>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}
