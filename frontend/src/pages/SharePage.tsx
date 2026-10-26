import { useState } from "react";
import { Panel } from "../components/ui/Panel";
import { formatNumber, formatRate } from "../lib/format";
import { useCity, useComplaintSummary, useDistricts, useJobs, usePledges } from "../query/useDashboard";

export function SharePage() {
  const districts = useDistricts();
  const complaints = useComplaintSummary(30);
  const pledges = usePledges();
  const jobs = useJobs();
  const city = useCity();
  const [copied, setCopied] = useState(false);

  const population = districts.data?.reduce((sum, item) => sum + item.population, 0) ?? 0;
  const pledgeAvg = average(pledges.data?.map((item) => item.achievement_rate) ?? []);
  const jobAvg = average(jobs.data?.map((item) => item.achievement_rate) ?? []);
  const ready = districts.data && complaints.data && pledges.data && jobs.data && city.data;

  async function copySummary() {
    if (!ready || !city.data || !complaints.data) return;
    const text = [
      "시흥시 스마트시정",
      `총인구 ${formatNumber(population)}명`,
      `최근 30일 민원 ${formatNumber(complaints.data.total)}건`,
      `공약 평균 ${formatRate(pledgeAvg)}%`,
      `일자리 평균 ${formatRate(jobAvg)}%`,
      `날씨 ${city.data.weather} ${city.data.temperature_c.toFixed(1)}°C`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      window.prompt("아래 내용을 복사해 주세요.", text);
    }
  }

  return (
    <main className="subpage">
      <div className="subpage-inner">
        <Panel
          title="공유박스"
          subtitle="지금 화면의 핵심 지표"
          extra={
            <button className="copy-button" type="button" onClick={() => void copySummary()} disabled={!ready}>
              {copied ? "복사됨" : "텍스트 복사"}
            </button>
          }
        >
          <div className="share-grid">
            <article>
              <span>총인구</span>
              <strong>{districts.data ? `${formatNumber(population)}명` : "-"}</strong>
            </article>
            <article>
              <span>최근 30일 민원</span>
              <strong>{complaints.data ? `${formatNumber(complaints.data.total)}건` : "-"}</strong>
            </article>
            <article>
              <span>공약 평균</span>
              <strong>{pledges.data ? `${formatRate(pledgeAvg)}%` : "-"}</strong>
            </article>
            <article>
              <span>일자리 평균</span>
              <strong>{jobs.data ? `${formatRate(jobAvg)}%` : "-"}</strong>
            </article>
            <article>
              <span>날씨</span>
              <strong>{city.data ? `${city.data.weather} ${city.data.temperature_c.toFixed(1)}°C` : "-"}</strong>
            </article>
          </div>
        </Panel>
      </div>
    </main>
  );
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
