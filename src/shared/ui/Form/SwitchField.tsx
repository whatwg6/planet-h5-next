export function SwitchField({
  label,
  description,
  checked,
  disabled = false,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 border-b border-border-solid-line-2 px-3 py-4 last:border-b-0">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-text-primary">{label}</span>
        {description ? (
          <span className="mt-1 block text-xs leading-5 text-text-secondary">{description}</span>
        ) : null}
      </span>
      <input
        role="switch"
        type="checkbox"
        className="h-6 w-11 shrink-0 accent-functional-brand-foreground"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
    </label>
  );
}
