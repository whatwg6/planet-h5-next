import type { ReactNode } from "react";

export function Page({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background-base text-text-primary">
      <header className="sticky top-0 z-10 border-b border-border-solid-line-2 bg-background-primary-container px-4 py-3">
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>
      <section className="flex-1 px-4 py-4">{children}</section>
      {footer ? <footer className="sticky bottom-0 border-t border-border-solid-line-2 bg-background-primary-container p-3">{footer}</footer> : null}
    </main>
  );
}
