import type { ReactNode } from "react";

import { ArrowIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/utils/cn";

type NavigationBarProps = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
};

export function NavigationBar({ title, onBack, right, className }: NavigationBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 grid h-12 grid-cols-[3rem_minmax(0,1fr)_3rem] items-center border-b border-border-solid-line-2 bg-background-primary-container px-1",
        className,
      )}
    >
      <div className="flex min-w-0 items-center justify-start">
        {onBack ? (
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-text-primary transition-colors active:bg-background-primary-container--active"
            aria-label="返回"
            onClick={onBack}
          >
            <ArrowIcon className="h-6 w-6 rotate-180" aria-hidden />
          </button>
        ) : null}
      </div>
      <h1 className="truncate text-center text-lg font-semibold leading-6">{title}</h1>
      <div className="flex min-w-0 items-center justify-end">{right}</div>
    </header>
  );
}
