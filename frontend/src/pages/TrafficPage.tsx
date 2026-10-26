import { ComplaintFeed } from "../components/complaints/ComplaintFeed";
import { Panel } from "../components/ui/Panel";
import { useComplaintSummary, useRecentComplaints } from "../query/useDashboard";
import { formatNumber } from "../lib/format";

export function TrafficPage() {
  const summary = useComplaintSummary(30);
  const recent = useRecentComplaints({ department: "교통행정과", limit: 20 });
  const traffic = summary.data?.items.find((item) => item.name === "교통행정과");

  return (
    <main className="subpage">
      <div className="subpage-inner split-page">
        <Panel title="교통정보 & CCTV" subtitle="교통행정과 민원">
          <p className="note">실시간 영상은 별도 중계 주소가 필요합니다. 아래 숫자는 교통 민원 접수입니다.</p>
          <p className="traffic-count">
            최근 30일 <strong>{traffic ? formatNumber(traffic.count) : "-"}</strong>건
          </p>
        </Panel>
        <ComplaintFeed title="교통 민원 실시간" items={recent.data} loading={recent.isLoading} error={recent.isError} />
      </div>
    </main>
  );
}
