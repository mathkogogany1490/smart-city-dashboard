import { useState } from "react";
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
  const [playingId, setPlayingId] = useState<string | null>(null);

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
              {playingId && playingId === post.video_id ? (
                <iframe
                  className="sns-player"
                  src={`https://www.youtube.com/embed/${post.video_id}?autoplay=1`}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  className={`thumb accent-${post.accent}`}
                  onClick={() => post.video_id && setPlayingId(post.video_id)}
                  disabled={!post.video_id}
                >
                  {post.thumbnail_url ? <img src={post.thumbnail_url} alt="" /> : null}
                  {post.duration ? <span className="duration">{post.duration}</span> : null}
                </button>
              )}
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
