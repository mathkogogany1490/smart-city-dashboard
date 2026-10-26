import { Link } from "react-router-dom";
import type { NewsItem } from "../../api/types";
import { formatDate } from "../../lib/format";
import { Panel, QueryNotice } from "../ui/Panel";

export function NewsPanel({
  items,
  loading,
  error,
  limitLabel = true,
}: {
  items?: NewsItem[];
  loading: boolean;
  error: boolean;
  limitLabel?: boolean;
}) {
  return (
    <Panel
      className="news-panel"
      title="시정 뉴스"
      extra={<span className="ghost-label">보도자료</span>}
    >
      <QueryNotice loading={loading && !items} error={error && !items} />
      {items ? (
        <>
          <ul className="news-list">
            {items.map((item) => (
              <li key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <time>{formatDate(item.published_on)}</time>
                </div>
                <div className={`news-thumb accent-${item.accent}`} />
              </li>
            ))}
          </ul>
          {limitLabel ? (
            <Link className="more" to="/city">
              더보기 →
            </Link>
          ) : null}
        </>
      ) : null}
    </Panel>
  );
}
