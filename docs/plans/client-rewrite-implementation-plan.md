# Client Rewrite Implementation Plan

## Purpose

This plan turns the client rewrite PRD into a sequential vertical-slice implementation path without using GitHub issues.

Use this plan as the local checklist for `/tdd` sessions. Each slice should be implemented, tested, reviewed, and committed independently before moving to the next slice.

## Source Documents

- `CLIENT_REWRITE_CONTEXT.md`
- `docs/prd/client-rewrite-prd.md`
- `docs/adr/001-client-rewrite-scope.md`
- `docs/adr/002-client-ui-and-behavior-parity.md`
- `docs/adr/003-mock-backed-client-domain.md`
- `docs/architecture-design.md`

## Working Rules

- Keep the current project as the implementation target.
- Use the legacy client only as a behavior and UI reference.
- Keep route entries thin.
- Use `routeMode` for same-path child pages, detail pages, and edit pages.
- Use mock repositories only.
- Make mock repositories mutable when a flow has write behavior.
- Return domain entities from repositories, not backend response shapes.
- Keep business semantics out of `shared/ui`.
- Prefer one complete vertical slice over broad partial scaffolding.
- Do not add screenshot baseline tests.

## Slice 1: Client Department Settings Vertical Slice

Status: Not started

### Goal

Fully rewrite `客户设置 > 部门` with legacy behavior parity.

### Scope

- Department tree domain model.
- Manual department tree.
- Third-party synchronized department tree.
- Mutable mock repository behavior for department reads and writes.
- Department settings route mode.
- Department edit route mode.
- Tree display, expand, collapse, create, edit, delete, and parent selection.
- Save success, save failure, and unsaved-change confirmation behavior.

### Acceptance Criteria

- Manual departments render as a tree.
- Third-party synchronized departments render separately as a readonly tree.
- Tree nodes can expand and collapse.
- A manual department can be created.
- A manual department can be renamed.
- A manual department can be moved under another valid parent.
- A manual department can be deleted with confirmation.
- Selecting itself or a descendant as parent is rejected.
- Leaving an edited form with unsaved changes asks for confirmation.
- Save failure shows a toast and keeps the user on the current page.
- Successful save returns to the department page or closes the edit surface.
- Refetching after a write shows the updated tree.

### Suggested Tests

- Domain rule tests for invalid parent selection.
- Repository tests for create, update, delete, and refetch persistence.
- Feature view tests for tree rendering, parent selection, save failure, and unsaved-change confirmation.
- Route mode test for opening department and department edit modes from the client detail route.

## Slice 2: H5 Settings UI Base

Status: Not started

### Goal

Add or refine the H5 base components needed by client settings flows without adding business semantics to `shared/ui`.

### Scope

- Navigation and edit navigation behavior.
- List sections and rows.
- Tree base component if Slice 1 needs extraction.
- Dialog and confirmation behavior.
- Toast behavior.
- Popup or sheet behavior.
- Switch row foundation.
- Input and form field behavior.
- Loading, error, and empty states where current primitives are insufficient.

### Acceptance Criteria

- Shared UI components remain business-agnostic.
- Settings feature components can compose action rows, switch rows, readonly rows, and grouped sections.
- Dialog confirm/cancel behavior is reusable.
- Toast can be triggered from mutation failure paths.
- Base components do not know about client, plan, order, department, or payment semantics.

### Suggested Tests

- Narrow shared UI tests only for components with standalone behavior, such as Tree expand/collapse or Dialog confirm/cancel.
- Prefer feature tests over shared UI implementation tests when behavior is business-specific.

## Slice 3: Mutable Client Mock Repository Foundation

Status: Not started

### Goal

Replace static client mock behavior with a mutable mock repository foundation that supports the rest of the rewrite.

### Scope

- Client list reads.
- Client detail reads.
- Client settings reads.
- Generic client setting updates.
- Save success and save failure scenarios.
- Query invalidation support through existing query key patterns.

### Acceptance Criteria

- Repositories expose stable facades from infrastructure modules.
- Feature hooks call application use cases with repository facades.
- Writes are reflected in later reads.
- Mock data includes enough variation for client settings, group delivery plans, dine-in plans, payment configuration, and order states.
- Backend response shapes do not leak into feature views.

### Suggested Tests

- Repository tests for mutable read/write behavior.
- Use case tests for update success and failure.
- Query hook tests where cache invalidation or refetch behavior matters.

## Slice 4: Client Settings Catalog

Status: Not started

### Goal

Rebuild the client settings catalog so it matches the legacy grouping, setting visibility, row behavior, and unsupported-feature handling.

### Scope

- Settings catalog domain/application logic.
- Grouped settings sections.
- Action rows.
- Switch rows.
- Readonly rows.
- Unsupported rows that preserve legacy behavior.
- Dynamic values and descriptions.

### Acceptance Criteria

- Settings are grouped like the legacy client.
- Rows can navigate, toggle, show readonly values, or show unsupported behavior.
- Switch rows confirm before changing when the legacy behavior requires it.
- Failed toggles show toast and do not silently commit.
- The settings catalog does not embed repository or backend details.

### Suggested Tests

- Catalog rule tests for visible settings and grouping.
- Feature view tests for row behavior and switch confirmation.
- Route mode tests for opening supported setting details.

## Slice 5: Client Basic Setting Details

Status: Not started

### Goal

Implement the first group of client setting detail pages after the catalog is stable.

### Scope

- Name and remark.
- Notification.
- Support and support edit.
- App version.
- Manager.
- Cost center and cost center edit.

### Acceptance Criteria

- Each page opens through `routeMode`.
- Forms follow the standard save behavior.
- Failed saves show toast and remain on the page.
- Successful saves return or close as legacy behavior dictates.
- Unsaved changes ask for confirmation before leaving.
- Mock writes are visible after refetch.

### Suggested Tests

- Feature view tests for representative form behavior.
- Use case tests for successful and failed updates.
- Route mode dispatch tests for each mode group.

## Slice 6: Client Account and Login Settings

Status: Not started

### Goal

Implement account-related client settings with legacy interaction parity.

### Scope

- Field settings.
- Field setting detail.
- Login settings.
- Employee-number login settings.
- Third-party login configuration.
- Third-party login detail.
- Third-party login association settings.
- Third-party login meal-plan joining settings.
- Password settings.
- Password complexity settings.
- Password period settings.

### Acceptance Criteria

- All required account route modes are represented.
- Nested setting modes still use same-path `routeMode`.
- Forms, switches, and unsupported behaviors match the legacy client.
- Password policy state is saved through mutable mock behavior.
- Field requirements are validated before save.

### Suggested Tests

- Domain rule tests for field and password validation.
- Feature tests for save behavior and nested mode dispatch.
- Repository/use case tests for saved account settings.

## Slice 7: Client Meal, Payment, and Card Settings

Status: Not started

### Goal

Implement the remaining client settings related to meals, payment, points, and card associations.

### Scope

- Payment method.
- Meal type.
- Meal type setting.
- Meal group.
- Meal point.
- Meican card behavior.
- External card behavior.

### Acceptance Criteria

- Supported settings behave like the legacy client.
- Unsupported legacy behavior remains unsupported.
- Meal point toggles and settings persist through mutable mock behavior.
- Payment method configuration renders with representative mock states.

### Suggested Tests

- Feature tests for settings navigation and toggle behavior.
- Repository/use case tests for persisted settings.

## Slice 8: Plan Detail and Plan Settings Foundation

Status: Not started

### Goal

Rebuild plan detail and the plan settings catalog with explicit support for group delivery and dine-in branches.

### Scope

- Plan detail page.
- Plan settings catalog.
- Plan business type model.
- Group delivery settings visibility.
- Dine-in settings visibility.
- Mock plan data for both branches.

### Acceptance Criteria

- Group delivery and dine-in plans show different settings where legacy behavior differs.
- Plan settings open through `routeMode`.
- Plan settings catalog uses the same settings UI principles as client settings.
- Mock data covers both branches.

### Suggested Tests

- Domain/application tests for plan setting visibility by business type.
- Feature tests for both catalog branches.
- Route mode tests for plan settings modes.

## Slice 9: Plan Setting Details

Status: Not started

### Goal

Implement plan setting detail and edit modes.

### Scope

- Base info and base info edit.
- Operation day.
- Restriction.
- Member count.
- Group delivery open times.
- Dine-in open times.
- Maximum order amount.
- Hide price and meal point settings.
- Disable append dish.
- Hidden account types.
- Dish remark.
- Delivery remark.
- Order rule.
- Payment method and payment method select config.
- Manual order confirmation.
- Occupation time.
- Order transfer.
- Merchant order verification.
- Pickup setting.
- Pickup meal code rule.
- Menu style.
- Finance config, amount, and meal type.
- Client member list and detail.
- Location.

### Acceptance Criteria

- Every required plan route mode is represented.
- Save behavior matches the client settings standard.
- Group delivery-only and dine-in-only modes are shown only when appropriate.
- Mock writes are visible after refetch.

### Suggested Tests

- Feature tests for representative setting types rather than every visual variation.
- Domain/application tests for rules and visibility.
- Route mode tests for mode coverage.

## Slice 10: Client Order Flows

Status: Not started

### Goal

Implement client order flows at the end of the client route chain.

### Scope

- Client member order list.
- Client order detail.
- Price summary.
- Merchant schedule information.
- Representative order states.

### Acceptance Criteria

- Order list and detail pages match the legacy behavior closely enough for manual review.
- Mock data covers representative order states.
- Price summary and merchant schedule information render from domain entities.
- Loading, empty, and error states are present.

### Suggested Tests

- Feature tests for order list and detail rendering.
- Repository tests for order mock data mapping.
- Optional e2e route flow from plan detail to order detail.

## Review Cadence

After each slice:

1. Run the narrowest meaningful tests for the slice.
2. Run `pnpm lint`.
3. Run `pnpm format:check`.
4. Run `pnpm test` when unit or feature behavior changed.
5. Run `pnpm build` for broad shared UI or route changes.
6. Run `pnpm e2e` for browser-level route, navigation, or user-flow changes.
7. Do a code-review pass against the PRD and ADRs before committing.

## Recommended Next Step

Start Slice 1 with `/tdd`:

```txt
Implement Client Department Settings Vertical Slice from docs/plans/client-rewrite-implementation-plan.md.
Use docs/prd/client-rewrite-prd.md and the accepted ADRs as the spec.
```
