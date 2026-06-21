import type { ReactNode } from "react";

import { NavigationBar } from "@/shared/ui/Navigation";

export function Page({
  title,
  children,
  footer,
  navigationRight,
  onBack,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  navigationRight?: ReactNode;
  onBack?: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[var(--app-viewport-height)] w-full  flex-col bg-background-base text-text-primary">
      <NavigationBar title={title} onBack={onBack} right={navigationRight} />
      <section className="flex-1 px-4 py-4">{children}</section>
      {footer ? (
        <footer className="sticky bottom-0 border-t border-border-solid-line-2 bg-background-primary-container p-3">
          {footer}
        </footer>
      ) : null}
    </main>
  );
}
