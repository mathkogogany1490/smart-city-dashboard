import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAreas } from "./useDashboard";

type Selection = {
  districtId: number | null;
  setDistrictId: (id: number) => void;
};

const SelectionContext = createContext<Selection | null>(null);

export function DistrictSelectionProvider({ children }: { children: ReactNode }) {
  const areas = useAreas();
  const [districtId, setDistrictId] = useState<number | null>(null);

  useEffect(() => {
    if (districtId != null || !areas.data) return;
    const baegot = areas.data.find((area) => area.code === "baegot");
    if (baegot) setDistrictId(baegot.primary_district_id);
  }, [areas.data, districtId]);

  return <SelectionContext.Provider value={{ districtId, setDistrictId }}>{children}</SelectionContext.Provider>;
}

export function useDistrictSelection() {
  const value = useContext(SelectionContext);
  if (!value) throw new Error("구역 선택 상태가 없습니다.");
  return value;
}
