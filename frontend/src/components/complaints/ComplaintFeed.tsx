import type { ComplaintItem } from "../../api/types";
import { formatDateTime } from "../../lib/format";
import { Panel, QueryNotice } from "../ui/Panel";

export function ComplaintFeed({
  title,
  items,
  loading,
  error,
}: {
  title: string;
  items?: ComplaintItem[];
  loading: boolean;
  error: boolean;
}) {
  return (
    <Panel className="grow" title={title} subtitle="접수 시각 기준">
      <QueryNotice loading={loading && !items} error={error && !items} />
      {items ? (
        <ul className="feed">
          {items.length === 0 ? <li className="state">최근 민원이 없습니다.</li> : null}
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>
                  {item.department} · {item.district}
                </span>
              </div>
              <time>{formatDateTime(item.created_at)}</time>
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}
