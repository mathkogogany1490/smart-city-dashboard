import { useState } from "react";
import { ComplaintChart } from "../components/complaints/ComplaintChart";
import { DistrictDetail } from "../components/districts/DistrictDetail";
import { PopulationRank } from "../components/districts/PopulationRank";
import { JobGoalList } from "../components/jobs/JobGoalList";
import { DistrictMap } from "../components/map/DistrictMap";
import { NewsPanel } from "../components/news/NewsPanel";
import { PledgePanel } from "../components/pledges/PledgePanel";
import { PopulationChart } from "../components/population/PopulationChart";
import { SnsPanel } from "../components/sns/SnsPanel";
import { Panel } from "../components/ui/Panel";
import { useDistrictSelection } from "../query/DistrictSelection";
import { useLive } from "../query/LiveProvider";
import {
  useAreas,
  useComplaintSummary,
  useDistrictSummary,
  useJobs,
  useNews,
  usePledges,
  usePopulation,
  useSns,
  useTopDistricts,
} from "../query/useDashboard";

export function DashboardPage() {
  const [days, setDays] = useState(30);
  const [year, setYear] = useState(2024);
  const [channel, setChannel] = useState<"youtube" | "blog">("youtube");
  const { districtId, setDistrictId } = useDistrictSelection();
  const live = useLive();
  const areas = useAreas();
  const complaints = useComplaintSummary(days);
  const population = usePopulation(year);
  const jobs = useJobs();
  const top = useTopDistricts();
  const detail = useDistrictSummary(districtId, days);
  const sns = useSns(channel);
  const pledges = usePledges();
  const news = useNews(3);

  if (areas.isError) {
    return <p className="page-state">API에 연결하지 못했습니다. 서버와 .env의 VITE_API_BASE_URL을 확인해 주세요.</p>;
  }

  return (
    <main className="dashboard">
      <div className="column">
        <ComplaintChart
          days={days}
          onDaysChange={setDays}
          data={complaints.data}
          loading={complaints.isLoading}
          error={complaints.isError}
          latest={live.events[0] ?? null}
        />
        <PopulationChart
          year={year}
          years={population.data?.years ?? []}
          onYearChange={setYear}
          items={population.data?.items}
          selectedId={districtId}
          onSelect={setDistrictId}
          loading={population.isLoading}
          error={population.isError}
        />
        <JobGoalList items={jobs.data} loading={jobs.isLoading} error={jobs.isError} />
      </div>
      <div className="column">
        <Panel className="map-panel grow" title="통계지리 · 중점관리" subtitle="시흥시 중점관리지역 현황">
          {areas.isLoading ? <p className="state">지도를 불러오는 중</p> : null}
          {areas.data ? (
            <>
              <DistrictMap areas={areas.data} selectedDistrictId={districtId} onSelect={setDistrictId} />
              <div className="map-split">
                <PopulationRank
                  items={top.data}
                  selectedId={districtId}
                  onSelect={setDistrictId}
                  loading={top.isLoading}
                  error={top.isError}
                />
                <DistrictDetail
                  summary={detail.data}
                  days={days}
                  onSelect={setDistrictId}
                  loading={detail.isLoading}
                  error={detail.isError}
                />
              </div>
            </>
          ) : null}
        </Panel>
      </div>
      <div className="column">
        <SnsPanel
          channel={channel}
          onChannelChange={setChannel}
          posts={sns.data}
          loading={sns.isLoading}
          error={sns.isError}
        />
        <PledgePanel items={pledges.data} loading={pledges.isLoading} error={pledges.isError} />
        <NewsPanel items={news.data} loading={news.isLoading} error={news.isError} />
      </div>
    </main>
  );
}
