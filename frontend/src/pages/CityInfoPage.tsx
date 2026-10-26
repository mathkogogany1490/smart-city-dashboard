import { useState } from "react";
import { NewsPanel } from "../components/news/NewsPanel";
import { SnsPanel } from "../components/sns/SnsPanel";
import { useNews, useSns } from "../query/useDashboard";

export function CityInfoPage() {
  const [channel, setChannel] = useState<"youtube" | "blog">("youtube");
  const sns = useSns(channel);
  const news = useNews(6);
  return (
    <main className="subpage">
      <div className="subpage-inner split-page">
        <SnsPanel
          channel={channel}
          onChannelChange={setChannel}
          posts={sns.data}
          loading={sns.isLoading}
          error={sns.isError}
        />
        <NewsPanel items={news.data} loading={news.isLoading} error={news.isError} limitLabel={false} />
      </div>
    </main>
  );
}
