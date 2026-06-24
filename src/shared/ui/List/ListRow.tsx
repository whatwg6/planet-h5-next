import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

export function ListRow({
  title,
  description,
  value,
  icon,
  disabled = false,
  onClick,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  value?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <>
      {icon ? <span className="mr-3 shrink-0 text-text-tertiary">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text-primary">{title}</span>
        {description ? (
          <span className="mt-1 block text-xs leading-5 text-text-secondary">{description}</span>
        ) : null}
      </span>
      {value ? <span className="ml-3 shrink-0 text-sm text-text-secondary">{value}</span> : null}
      {onClick ? <span className="ml-2 shrink-0 text-text-tertiary">›</span> : null}
    </>
  );

  const rowClassName = cn(
    "flex w-full items-center border-b border-border-solid-line-2 px-3 py-4 text-left last:border-b-0",
    disabled && "opacity-60",
    className,
  );

  if (!onClick) return <div className={rowClassName}>{content}</div>;

  return (
    <button type="button" className={rowClassName} disabled={disabled} onClick={onClick}>
      {content}
    </button>
  );
}
