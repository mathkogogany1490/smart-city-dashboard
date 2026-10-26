import { useState } from "react";
import { ComplaintChart } from "../components/complaints/ComplaintChart";
import { ComplaintFeed } from "../components/complaints/ComplaintFeed";
import { useLive } from "../query/LiveProvider";
import { useComplaintSummary, useRecentComplaints } from "../query/useDashboard";

export function ComplaintPage() {
  const [days, setDays] = useState(30);
  const live = useLive();
  const summary = useComplaintSummary(days);
  const recent = useRecentComplaints({ limit: 20 });

  return (
    <main className="subpage">
      <div className="subpage-inner wide split-page">
        <ComplaintChart
          large
          days={days}
          onDaysChange={setDays}
          data={summary.data}
          loading={summary.isLoading}
          error={summary.isError}
          latest={live.events[0] ?? null}
        />
        <ComplaintFeed title="최근 접수" items={recent.data} loading={recent.isLoading} error={recent.isError} />
      </div>
    </main>
  );
}
