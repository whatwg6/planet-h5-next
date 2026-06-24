export type SelectFieldOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function SelectField({
  label,
  value,
  options,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  options: SelectFieldOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 border-b border-border-solid-line-2 px-3 py-4 last:border-b-0">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <select
        className="min-w-0 flex-1 bg-transparent text-right text-sm text-text-secondary outline-none"
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
