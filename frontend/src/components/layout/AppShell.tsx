import { Outlet } from "react-router-dom";
import { useCity } from "../../query/useDashboard";
import { useLive } from "../../query/LiveProvider";
import { AppHeader } from "./AppHeader";
import { LiveToast } from "../realtime/LiveToast";

export function AppShell() {
  const city = useCity();
  const live = useLive();

  return (
    <div className="app">
      <AppHeader city={city.data} liveStatus={live.status} />
      <LiveToast events={live.events} />
      <div className="route">
        <Outlet />
      </div>
    </div>
  );
}
