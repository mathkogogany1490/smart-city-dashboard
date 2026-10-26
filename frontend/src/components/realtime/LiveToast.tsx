import { useEffect, useState } from "react";
import type { ComplaintItem } from "../../api/types";

export function LiveToast({ events }: { events: ComplaintItem[] }) {
  const latest = events[0];
  const [visibleId, setVisibleId] = useState<number | null>(null);

  useEffect(() => {
    if (!latest) return;
    setVisibleId(latest.id);
    const timer = window.setTimeout(() => {
      setVisibleId((current) => (current === latest.id ? null : current));
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [latest]);

  if (!latest || visibleId !== latest.id) return null;
  return (
    <div className="toasts" aria-live="polite">
      {[latest].map((event) => (
        <article key={event.id} className="toast">
          <strong>실시간 민원</strong>
          <p>
            {event.department} · {event.district}
          </p>
          <span>{event.title}</span>
        </article>
      ))}
    </div>
  );
}
