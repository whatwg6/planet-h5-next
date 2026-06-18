export function LoadingState({ title = "加载中" }: { title?: string }) {
  return <div className="py-8 text-center text-sm text-text-secondary">{title}</div>;
}
