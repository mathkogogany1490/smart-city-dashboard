import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, subtitle, extra, children, className }: Props) {
  return (
    <section className={className ? `panel ${className}` : "panel"}>
      <header className="panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="subtitle">{subtitle}</p> : null}
        </div>
        {extra}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}

export function QueryNotice({ loading, error }: { loading: boolean; error: boolean }) {
  if (loading) return <p className="state">불러오는 중</p>;
  if (error) return <p className="state error">데이터를 불러오지 못했습니다.</p>;
  return null;
}
