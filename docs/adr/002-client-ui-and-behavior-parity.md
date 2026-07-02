# ADR-002: Client UI and Behavior Parity

## Status

Accepted

## Context

The main risk in the client rewrite is not real API integration. The main risk is failing to match the legacy client UI and behavior closely enough. The rewrite must preserve visual layout, spacing, interaction flows, dialogs, toast behavior, and intentionally unsupported behavior where the legacy client does.

## Decision

- Treat legacy `planet-h5/src/apps/client` as the behavior and UI reference for client flows.
- Do not treat the current partial client rewrite as the acceptance baseline.
- Reference the legacy implementation's ideas and interaction flow, but avoid copying source code directly where practical.
- Do not force the new implementation to preserve the legacy component API.
- Keep legacy unsupported behavior unsupported in the rewrite.
- Use the following form-save behavior consistently:
  - On success, navigate back or close the modal/sheet.
  - On failure, show a toast and stay on the current page.
  - When there are unsaved changes, back navigation must ask for confirmation.
  - While saving, prevent duplicate submissions.
- Do not introduce screenshot baseline tests for this rewrite. Use human review plus focused behavior tests.

## Implementation Preference

Prefer components that express business intent directly:

```tsx
<SettingSection title="账号设置">
  <SettingActionRow title="部门" value="12 个" onClick={openDepartment} />
  <SettingSwitchRow
    title="录入面容"
    checked={enabled}
    confirmTitle="确认开启录入面容？"
    onChange={toggleFaceRecognition}
  />
</SettingSection>
```

Avoid pushing every setting behavior into a single generic row component with arbitrary JSX slots when a more specific feature component makes intent clearer.

## Boundaries

- `shared/ui` contains H5 base components only.
- Client, plan, and order semantic components belong under their feature modules.
- Reusable business capabilities that are not client-specific may live under focused feature capability modules such as `features/setting-rule`.
