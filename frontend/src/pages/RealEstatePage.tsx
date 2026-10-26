import { formatManwon, formatNumber } from "../lib/format";
import { useRealEstate } from "../query/useDashboard";
import { Panel, QueryNotice } from "../components/ui/Panel";

export function RealEstatePage() {
  const estate = useRealEstate();
  const data = estate.data;
  const trades = data?.trades ?? [];
  const districts = data?.districts ?? [];
  const maxAverage = Math.max(...districts.map((item) => item.average_manwon), 1);
  const maxDensity = Math.max(...(data?.items.map((item) => item.density) ?? [1]), 1);

  return (
    <main className="subpage">
      <div className="subpage-inner">
        <Panel title="부동산" subtitle={data?.month ? `아파트 매매 · ${data.month}` : "동별 인구밀도"}>
          <QueryNotice loading={estate.isLoading && !data} error={estate.isError && !data} />
          {data ? (
            <>
              <p className={`note ${data.connected ? "ok" : ""}`}>{data.message}</p>
              {data.connected ? (
                <>
                  <div className="bar-list">
                    {districts.map((item) => (
                      <div key={item.name} className="bar-row">
                        <span className="bar-name">{item.name}</span>
                        <div className="bar-track">
                          <span className="bar-fill" style={{ width: `${(item.average_manwon / maxAverage) * 100}%` }} />
                        </div>
                        <strong className="bar-value">{formatManwon(item.average_manwon)}</strong>
                      </div>
                    ))}
                  </div>
                  <p className="panel-foot">막대는 법정동 평균 매매가입니다. 금액 단위는 만원입니다.</p>
                  <ul className="feed">
                    {trades.map((item, index) => (
                      <li key={`${item.contract_date}-${item.apartment}-${item.floor}-${index}`}>
                        <div>
                          <strong>{item.apartment}</strong>
                          <span>
                            {item.district} · {item.area_m2.toFixed(1)}㎡ · {item.floor}층
                          </span>
                        </div>
                        <div>
                          <strong>{formatManwon(item.amount_manwon)}</strong>
                          <time>{item.contract_date}</time>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <div className="bar-list">
                    {data.items.map((item) => (
                      <div key={item.id} className="bar-row">
                        <span className="bar-name">{item.name}</span>
                        <div className="bar-track">
                          <span className="bar-fill" style={{ width: `${(item.density / maxDensity) * 100}%` }} />
                        </div>
                        <strong className="bar-value">{formatNumber(item.density)}</strong>
                      </div>
                    ))}
                  </div>
                  <p className="panel-foot">단위: 명/km²</p>
                </>
              )}
            </>
          ) : null}
        </Panel>
      </div>
    </main>
  );
}
