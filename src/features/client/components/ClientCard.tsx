import { ArrowIcon } from "@/shared/assets/icons";

import { ClientStatusTag } from "./ClientStatusTag";

export function ClientCard({
  name,
  phone,
  isDeveloperTest,
}: {
  name: string;
  phone?: string;
  isDeveloperTest?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border-solid-line-2 bg-background-primary-container p-4 shadow-card transition active:bg-background-primary-container--active">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background-components text-sm font-semibold text-text-tertiary">
          客
        </div>
        <div className="min-w-0">
          <div className="line-clamp-2 text-[17px] font-medium leading-6 text-text-primary">{name}</div>
          {phone ? <div className="mt-1 text-sm text-text-secondary">{phone}</div> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {isDeveloperTest ? <ClientStatusTag>测试</ClientStatusTag> : null}
        <ArrowIcon className="h-6 w-6 text-text-quaternary" aria-hidden="true" />
      </div>
    </div>
  );
}
