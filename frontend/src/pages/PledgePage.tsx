import { JobGoalList } from "../components/jobs/JobGoalList";
import { PledgePanel } from "../components/pledges/PledgePanel";
import { useJobs, usePledges } from "../query/useDashboard";

export function PledgePage() {
  const pledges = usePledges();
  const jobs = useJobs();
  return (
    <main className="subpage">
      <div className="subpage-inner">
        <PledgePanel items={pledges.data} loading={pledges.isLoading} error={pledges.isError} />
        <JobGoalList items={jobs.data} loading={jobs.isLoading} error={jobs.isError} />
      </div>
    </main>
  );
}
