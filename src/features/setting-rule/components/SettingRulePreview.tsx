import type { PlanRule } from "@/domain/plan/Plan";

export function SettingRulePreview({ rules }: { rules: PlanRule[] }) {
  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <div key={rule.id} className="rounded-md border border-border-solid-line-2 bg-background-primary-container p-3 text-sm shadow-card">
          <div className="font-medium">{rule.label}</div>
          <div className="mt-1 text-text-secondary">{Object.values(rule.values).join(" / ")}</div>
        </div>
      ))}
    </div>
  );
}
