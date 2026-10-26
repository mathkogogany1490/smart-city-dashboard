import { formatNumber } from "../lib/format";
import { useRealEstate } from "../query/useDashboard";
import { Panel, QueryNotice } from "../components/ui/Panel";

export function RealEstatePage() {
  const estate = useRealEstate();
  const max = Math.max(...(estate.data?.items.map((item) => item.density) ?? [1]), 1);

  return (
    <main className="subpage">
      <div className="subpage-inner">
        <Panel title="부동산" subtitle="동별 인구밀도">
          <QueryNotice loading={estate.isLoading && !estate.data} error={estate.isError && !estate.data} />
          {estate.data ? (
            <>
              <p className={`note ${estate.data.connected ? "ok" : ""}`}>{estate.data.message}</p>
              <div className="bar-list">
                {estate.data.items.map((item) => (
                  <div key={item.id} className="bar-row">
                    <span className="bar-name">{item.name}</span>
                    <div className="bar-track">
                      <span className="bar-fill" style={{ width: `${(item.density / max) * 100}%` }} />
                    </div>
                    <strong className="bar-value">{formatNumber(item.density)}</strong>
                  </div>
                ))}
              </div>
              <p className="panel-foot">단위: 명/km² · 인구 {formatNumber(estate.data.items.reduce((sum, item) => sum + item.population, 0))}명</p>
            </>
          ) : null}
        </Panel>
      </div>
    </main>
  );
}
