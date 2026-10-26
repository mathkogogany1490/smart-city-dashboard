import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { CityInfoPage } from "./pages/CityInfoPage";
import { ComplaintPage } from "./pages/ComplaintPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PledgePage } from "./pages/PledgePage";
import { PopulationPage } from "./pages/PopulationPage";
import { RealEstatePage } from "./pages/RealEstatePage";
import { SharePage } from "./pages/SharePage";
import { TrafficPage } from "./pages/TrafficPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/population" element={<PopulationPage />} />
        <Route path="/pledges" element={<PledgePage />} />
        <Route path="/complaints" element={<ComplaintPage />} />
        <Route path="/city" element={<CityInfoPage />} />
        <Route path="/realestate" element={<RealEstatePage />} />
        <Route path="/traffic" element={<TrafficPage />} />
        <Route path="/share" element={<SharePage />} />
      </Route>
    </Routes>
  );
}
