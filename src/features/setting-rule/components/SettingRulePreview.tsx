import type { PlanRule } from "@/domain/plan/Plan";

export function SettingRulePreview({ rules }: { rules: PlanRule[] }) {
  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <div key={rule.id} className="rounded-md border border-line bg-white p-3 text-sm">
          <div className="font-medium">{rule.label}</div>
          <div className="mt-1 text-muted">{Object.values(rule.values).join(" / ")}</div>
        </div>
      ))}
    </div>
  );
}
