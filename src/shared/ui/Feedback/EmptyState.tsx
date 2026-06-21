export function EmptyState({ title }: { title: string }) {
  return (
    <div className="rounded-md border border-dashed border-border-solid-line-2 bg-background-components p-6 text-center text-sm text-text-secondary">
      {title}
    </div>
  );
}
