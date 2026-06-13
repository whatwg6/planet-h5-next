import type { PlanRule } from "@/domain/plan/Plan";
import { Field } from "@/shared/ui/Form";

export function SettingRuleEditor({
  rules,
  onChange,
}: {
  rules: PlanRule[];
  onChange: (rules: PlanRule[]) => void;
}) {
  return (
    <div className="space-y-3">
      {rules.map((rule, index) => (
        <Field
          key={rule.id}
          label={rule.label}
          value={rule.values.value ?? ""}
          onChange={(event) => {
            const next = [...rules];
            next[index] = { ...rule, values: { ...rule.values, value: event.target.value } };
            onChange(next);
          }}
        />
      ))}
    </div>
  );
}
