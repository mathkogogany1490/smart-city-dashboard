import type { DistrictSummary } from "../../api/types";
import { formatNumber } from "../../lib/format";
import { Percent } from "../ui/Percent";
import { QueryNotice } from "../ui/Panel";

export function DistrictDetail({
  summary,
  days,
  onSelect,
  loading,
  error,
}: {
  summary?: DistrictSummary;
  days: number;
  onSelect: (id: number) => void;
  loading: boolean;
  error: boolean;
}) {
  return (
    <div className="detail-card">
      <div className="detail-head">
        <h3>선택 지역{summary ? `: ${summary.name}` : ""}</h3>
        {summary?.is_priority ? <span className="badge">중점관리지역</span> : null}
      </div>
      <QueryNotice loading={loading && !summary} error={error && !summary} />
      {summary ? (
        <>
          {summary.parts.length > 1 ? (
            <div className="chips">
              {summary.parts.map((part) => (
                <button key={part.id} type="button" className={part.id === summary.id ? "active" : ""} onClick={() => onSelect(part.id)}>
                  {part.name}
                </button>
              ))}
            </div>
          ) : null}
          <dl>
            <div>
              <dt>인구 (2024)</dt>
              <dd>{formatNumber(summary.population)}명</dd>
              <Percent value={summary.population_change_pct} upIsGood />
            </div>
            <div>
              <dt>인구밀도</dt>
              <dd>{formatNumber(summary.density)}명/km²</dd>
            </div>
            <div>
              <dt>민원건수 (최근 {days}일)</dt>
              <dd>{formatNumber(summary.complaint_count)}건</dd>
              <Percent value={summary.complaint_change_pct} upIsGood={false} />
            </div>
          </dl>
          <p className="issues">
            <span>중점관리 이슈</span>
            {summary.focus_issues}
          </p>
        </>
      ) : null}
    </div>
  );
}
