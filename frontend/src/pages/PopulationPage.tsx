import { useState } from "react";
import { DistrictDetail } from "../components/districts/DistrictDetail";
import { PopulationRank } from "../components/districts/PopulationRank";
import { PopulationChart } from "../components/population/PopulationChart";
import { useDistrictSelection } from "../query/DistrictSelection";
import { useDistrictSummary, usePopulation, useTopDistricts } from "../query/useDashboard";

export function PopulationPage() {
  const [year, setYear] = useState(2024);
  const [days] = useState(30);
  const { districtId, setDistrictId } = useDistrictSelection();
  const population = usePopulation(year);
  const top = useTopDistricts();
  const detail = useDistrictSummary(districtId, days);

  return (
    <main className="subpage">
      <div className="subpage-inner wide">
        <PopulationChart
          large
          year={year}
          years={population.data?.years ?? []}
          onYearChange={setYear}
          items={population.data?.items}
          selectedId={districtId}
          onSelect={setDistrictId}
          loading={population.isLoading}
          error={population.isError}
        />
        <div className="map-split plain">
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
      </div>
    </main>
  );
}
