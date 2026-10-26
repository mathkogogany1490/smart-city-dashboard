import { Link } from "react-router-dom";
import type { SnsPost } from "../../api/types";
import { Panel, QueryNotice } from "../ui/Panel";

type Channel = "youtube" | "blog";

export function SnsPanel({
  channel,
  onChannelChange,
  posts,
  loading,
  error,
}: {
  channel: Channel;
  onChannelChange: (channel: Channel) => void;
  posts?: SnsPost[];
  loading: boolean;
  error: boolean;
}) {
  return (
    <Panel
      className="grow sns-panel"
      title="SNS 현황"
      extra={
        <div className="tabs">
          <button type="button" className={channel === "youtube" ? "active youtube" : ""} onClick={() => onChannelChange("youtube")}>
            YouTube
          </button>
          <button type="button" className={channel === "blog" ? "active blog" : ""} onClick={() => onChannelChange("blog")}>
            Blog
          </button>
        </div>
      }
    >
      <QueryNotice loading={loading && !posts} error={error && !posts} />
      {posts ? (
        <div className="sns-list">
          {posts.map((post) => (
            <article key={`${post.channel}-${post.id}`} className="sns-card">
              <div className={`thumb accent-${post.accent}`}>
                {post.duration ? <span className="duration">{post.duration}</span> : null}
              </div>
              <div>
                <h3>{post.title}</h3>
                <p>
                  시흥시청 {post.views_label} · {post.published_label}
                </p>
              </div>
            </article>
          ))}
          <Link className="more" to="/city">
            더보기 →
          </Link>
        </div>
      ) : null}
    </Panel>
  );
}
