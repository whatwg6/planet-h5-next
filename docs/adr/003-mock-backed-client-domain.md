# ADR-003: Mock-Backed Client Domain

## Status

Accepted

## Context

This rewrite does not integrate real APIs. However, static mock data is not enough because many client flows require persistent write behavior during a session. Examples include creating a department, editing it, deleting it, toggling a setting, and seeing the updated data after refetch.

## Decision

- Define only the business types needed for this rewrite.
- All client rewrite data comes from mock repositories.
- Mock repositories return domain entities, not backend response shapes.
- Mock repositories must be mutable and reflect writes in later reads.
- Do not use Orval or real API integration for this rewrite.
- Define repository contracts in `domain`.
- Keep mock repository implementations in `infrastructure/repositories/*`.
- Feature hooks call application use cases, and application use cases coordinate repository calls.

## Required Mock Coverage

- Client list and client detail.
- Full client settings data.
- Manual department tree.
- Third-party synchronized department tree.
- Cost centers, managers, field settings, login settings, password policy, support, notification, and app version settings.
- Group delivery meal plans.
- Dine-in meal plans.
- Different payment configurations.
- Different order states.
- Successful and failed save scenarios.

## Department Model Requirement

Department settings must support a tree model:

```ts
type ClientDepartmentTree = {
  rootIds: string[];
  nodeMap: Record<string, ClientDepartmentNode>;
};

type ClientDepartmentNode = {
  id: string;
  name: string;
  parentId?: string;
  parentPath: string;
  childIds: string[];
  source: "manual" | "thirdParty";
  editable: boolean;
};
```

Department behavior must include:

- Manual department tree display.
- Third-party synchronized department tree display.
- Expand and collapse.
- Create department.
- Edit department.
- Delete department.
- Select parent department.
- Prevent selecting itself or a descendant as parent.
- Confirm before leaving with unsaved changes.
- Toast on save failure.
- Preserve changes after refetch through the mutable mock repository.
