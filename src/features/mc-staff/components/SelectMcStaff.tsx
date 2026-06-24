import { useMemo, useState } from "react";

import type { McStaff } from "@/domain/mc-staff/McStaff";
import { isSameMcStaff } from "@/domain/mc-staff/mcStaffRules";
import { useMcStaffSearchQuery } from "@/features/mc-staff/queries/useMcStaffSearchQuery";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Button, Field } from "@/shared/ui/Form";
import { ListRow, ListSection } from "@/shared/ui/List";

type SelectMcStaffProps = {
  defaultSelected?: McStaff[];
  onSelect?: (selected: McStaff[]) => void;
  selectedIds?: string[];
  onChange?: (ids: string[]) => void;
};

export function SelectMcStaff({
  defaultSelected = [],
  onSelect,
  selectedIds,
  onChange,
}: SelectMcStaffProps) {
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<McStaff[]>([]);
  const query = useMcStaffSearchQuery(keyword);
  const defaultSelectedEmails = useMemo(
    () => new Set(defaultSelected.map((staff) => staff.email.toLowerCase())),
    [defaultSelected],
  );

  const toggle = (staff: McStaff) => {
    if (defaultSelectedEmails.has(staff.email.toLowerCase())) return;

    setSelected((current) =>
      current.some((item) => isSameMcStaff(item, staff))
        ? current.filter((item) => !isSameMcStaff(item, staff))
        : [...current, staff],
    );
  };

  const confirm = () => {
    if (selected.length === 0 || !onSelect) return;
    onSelect(selected);
    setSelected([]);
    setKeyword("");
  };

  if (selectedIds && onChange) {
    return (
      <section className="space-y-3">
        <Field
          label="搜索员工"
          placeholder="输入姓名、邮箱或部门"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? <ErrorState title="员工搜索失败" onRetry={() => query.refetch()} /> : null}
        {query.isSuccess && query.data.length === 0 ? <EmptyState title="暂无员工结果" /> : null}
        {query.isSuccess && query.data.length > 0 ? (
          <ListSection title="员工">
            {query.data.map((staff) => (
              <ListRow
                key={staff.id}
                title={staff.displayName}
                description={staff.department ?? staff.email}
                value={selectedIds.includes(staff.id) ? "已选择" : "可选"}
                onClick={() =>
                  onChange(
                    selectedIds.includes(staff.id)
                      ? selectedIds.filter((id) => id !== staff.id)
                      : [...selectedIds, staff.id],
                  )
                }
              />
            ))}
          </ListSection>
        ) : null}
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-md border border-border-solid-line-2 bg-background-primary-container p-3 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-text-primary">添加管理员</h2>
        <Button
          type="button"
          variant="secondary"
          className="h-8 px-3"
          disabled={selected.length === 0}
          onClick={confirm}
        >
          添加 {selected.length > 0 ? selected.length : ""}
        </Button>
      </div>
      <Field
        label="搜索员工"
        placeholder="输入姓名、邮箱或部门"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState title="员工搜索失败" onRetry={() => query.refetch()} /> : null}
      {query.isSuccess && query.data.length === 0 ? <EmptyState title="暂无员工结果" /> : null}
      {query.isSuccess && query.data.length > 0 ? (
        <div className="overflow-hidden rounded-md border border-border-solid-line-2">
          {query.data.map((staff) => {
            const disabled = defaultSelectedEmails.has(staff.email.toLowerCase());
            const checked =
              disabled || selected.some((selectedStaff) => isSameMcStaff(selectedStaff, staff));

            return (
              <label
                key={staff.email}
                className="flex items-center justify-between gap-3 border-b border-border-solid-line-2 px-3 py-4 last:border-b-0"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-text-primary">
                    {staff.displayName}
                  </span>
                  <span className="mt-1 block text-xs text-text-secondary">{staff.email}</span>
                  {staff.department ? (
                    <span className="mt-1 block text-xs text-text-tertiary">
                      {staff.department}
                    </span>
                  ) : null}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(staff)}
                  className="h-5 w-5 shrink-0 accent-functional-brand-foreground"
                  aria-label={`${staff.displayName} ${disabled ? "已添加" : "选择"}`}
                />
              </label>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
