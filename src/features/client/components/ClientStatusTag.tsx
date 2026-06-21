export function ClientStatusTag({ children }: { children: string }) {
  return (
    <span className="inline-flex h-6 items-center rounded bg-functional-brand-transparent px-2 text-xs font-medium text-functional-brand-foreground">
      {children}
    </span>
  );
}
