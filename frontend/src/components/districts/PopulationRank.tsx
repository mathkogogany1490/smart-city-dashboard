import type { RankedDistrict } from "../../api/types";
import { formatNumber } from "../../lib/format";
import { QueryNotice } from "../ui/Panel";

export function PopulationRank({
  items,
  selectedId,
  onSelect,
  loading,
  error,
}: {
  items?: RankedDistrict[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading: boolean;
  error: boolean;
}) {
  return (
    <div className="rank-card">
      <h3>인구 Top 5 (2024년)</h3>
      <QueryNotice loading={loading && !items} error={error && !items} />
      <ol>
        {items?.map((item) => (
          <li key={item.id}>
            <button type="button" className={item.id === selectedId ? "active" : ""} onClick={() => onSelect(item.id)}>
              <span>
                {item.rank} {item.name}
              </span>
              <strong>{formatNumber(item.population)}</strong>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
