# Planet H5 Business Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the source `planet-h5` client business flows in this project with mock data, current routes, and the current Clean Architecture boundaries.

**Architecture:** Implement vertical slices through `pages -> features -> application -> domain` with mock repositories under `infrastructure -> domain`. Keep TanStack Router, `RouteStack`, `RouteModeSwitch`, TanStack Query, React Hook Form, Zod, Zustand, Tailwind, and `shared/ui` as the target framework.

**Tech Stack:** pnpm, Vite, React 19, TypeScript, TanStack Router, TanStack Query, Zustand, React Hook Form, Zod, Tailwind CSS, vite-plugin-svgr, Vitest, React Testing Library, MSW, Playwright.

## Global Constraints

- Source business reference: `/Users/yxc/code/planet-h5/src/apps/client/**` and required dependencies from `/Users/yxc/code/planet-h5/src/biz/**`.
- Ignore `docs/migration` and `docs/migration-v2` while implementing this plan.
- Existing routes and business pages in this project may be rewritten.
- Use current URLs: `/ops/client`, `/ops/client/$clientId`, `/ops/client/$clientId/plan/$planId`, `/ops/client/$clientId/plan/$planId/setting`, `/ops/client/$clientId/plan/$planId/order/$orderParams`.
- Do not preserve old `/ops/client-next...` paths.
- Use mock data only.
- Do not migrate hybrid behavior or SDK integration.
- Do not migrate SSO.
- Do not migrate request interceptors.
- Do not migrate real API integration.
- Do not migrate Orval generated API code or generation workflow.
- Do not migrate old React Router setup.
- Do not migrate old Sass global styling system.
- Do not migrate `/Users/yxc/code/planet-h5/src/apps/system/**`.
- Do not migrate `/Users/yxc/code/planet-h5/src/apps/dev/**`.
- Map old `pageType` behavior to current `routeMode` with `location.state.routeMode`, `routeModeState`, and `RouteModeSwitch`.
- Route entries that read params must use `useParams({ strict: false, shouldThrow: false })`.
- Feature views must not read `location.state` directly.
- Repository mock implementations must return domain entities.
- Feature views and hooks must not depend on old API response shapes.
- `Icons.XXX` usages from old code must become `src/shared/assets/icons` SVG files exported from `src/shared/assets/icons/index.ts` with the `?react` suffix.
- Final migrated flows must not leave hard-coded unfinished-migration labels as business behavior.
- Before handoff run `pnpm lint`, `pnpm format:check`, and `pnpm test`.
- For route, navigation, or user-flow changes run `pnpm e2e`.

---

## File Structure Map

This plan keeps the current architectural layout. Files listed here are the planned ownership boundaries; individual tasks below specify exact create, modify, and test files.

### App And Routing

- `src/app/router/routeTree.tsx`: single route registration table for the five target URLs.
- `src/app/router/historyState.ts`: existing route mode state helpers; extend only if a strongly typed mode helper is needed.
- `src/app/router/RouteModeSwitch.tsx`: existing mode dispatch component; reuse, do not duplicate.
- `src/pages/client/ClientListRoute.tsx`: route entry for `/ops/client`.
- `src/pages/client/ClientDetailRoute.tsx`: route entry for `/ops/client/$clientId` and all customer-detail route modes.
- `src/pages/plan/PlanDetailRoute.tsx`: route entry for `/ops/client/$clientId/plan/$planId`.
- `src/pages/plan/PlanSettingsRoute.tsx`: route entry for `/ops/client/$clientId/plan/$planId/setting` and plan-setting route modes.
- `src/pages/order/ClientOrderRoute.tsx`: route entry for `/ops/client/$clientId/plan/$planId/order/$orderParams`.

### Shared UI And Assets

- `src/shared/ui/List/ListRow.tsx`: business-agnostic mobile list row.
- `src/shared/ui/List/ListSection.tsx`: business-agnostic grouped list section.
- `src/shared/ui/List/index.ts`: exports list primitives.
- `src/shared/ui/Form/SwitchField.tsx`: business-agnostic switch row for boolean settings.
- `src/shared/ui/Form/SelectField.tsx`: business-agnostic select-style row backed by native `select` for the mock-first migration.
- `src/shared/ui/Feedback/Toast.tsx`: minimal inline toast primitive for success/error messages.
- `src/shared/assets/icons/*.svg`: reusable icons migrated from old `Icons.XXX` use sites.
- `src/shared/assets/icons/index.ts`: SVGR exports with `?react`.

### Client Slice

- `src/domain/client/Client.ts`: client entities, setting entities, list params, and update input.
- `src/domain/client/ClientRepository.ts`: repository contract for client reads and writes.
- `src/domain/client/clientRules.ts`: pure formatting and validation helpers for client settings.
- `src/application/client/getClientList.ts`: list use case.
- `src/application/client/getClientDetail.ts`: detail use case.
- `src/application/client/updateClient.ts`: update use case.
- `src/infrastructure/mock/clientMockData.ts`: deterministic mock clients and setting details.
- `src/infrastructure/repositories/client/clientRepository.mock.ts`: mutable mock repository implementation.
- `src/infrastructure/repositories/client/index.ts`: exports `clientRepository`.
- `src/features/client/queries/useClientListQuery.ts`: list query hook.
- `src/features/client/queries/useClientDetailQuery.ts`: detail query hook.
- `src/features/client/mutations/useUpdateClientMutation.ts`: update mutation hook with client query invalidation.
- `src/features/client/store/clientListStore.ts`: committed keyword/filter UI state.
- `src/features/client/store/clientDetailUiStore.ts`: draft and transient detail-setting UI state.
- `src/features/client/components/ClientCard.tsx`: client list card.
- `src/features/client/components/ClientSettingRows.tsx`: reusable client setting rows.
- `src/features/client/views/*.tsx`: client list, detail, settings, and route-mode subpage views.

### Shared Business Capabilities

- `src/domain/mc-staff/McStaff.ts`: Meican staff entity and search params.
- `src/domain/mc-staff/McStaffRepository.ts`: staff search contract.
- `src/application/mc-staff/searchMcStaffs.ts`: staff search use case.
- `src/infrastructure/mock/mcStaffMockData.ts`: staff mock data.
- `src/infrastructure/repositories/mc-staff/mcStaffRepository.mock.ts`: staff mock repository.
- `src/features/mc-staff/components/SelectMcStaff.tsx`: staff selection component.
- `src/domain/merchant/Merchant.ts`: merchant entity and list params.
- `src/domain/merchant/MerchantRepository.ts`: merchant list/detail contract.
- `src/application/merchant/getMerchantList.ts`: merchant list use case.
- `src/infrastructure/mock/merchantMockData.ts`: merchant mock data.
- `src/features/merchant/components/SelectMerchant.tsx`: merchant selection component.
- `src/domain/payment/Payment.ts`: payment method and account entities.
- `src/domain/payment/PaymentRepository.ts`: payment mock contract.
- `src/application/payment/listPaymentMethods.ts`: payment methods use case.
- `src/infrastructure/mock/paymentMockData.ts`: payment mock data.
- `src/features/payment/components/PaymentMethodList.tsx`: business-specific payment method UI.

### Plan Slice

- `src/domain/plan/Plan.ts`: plan detail, setting summaries, plan setting details, and save input.
- `src/domain/plan/PlanRepository.ts`: repository contract for plan detail and setting saves.
- `src/domain/plan/planRules.ts`: pure helpers for setting labels, validation, and display values.
- `src/application/plan/getPlanDetail.ts`: detail use case.
- `src/application/plan/savePlanSettings.ts`: save use case.
- `src/infrastructure/mock/planMockData.ts`: deterministic mock plan details.
- `src/infrastructure/repositories/plan/planRepository.mock.ts`: mutable mock repository implementation.
- `src/features/plan/queries/usePlanDetailQuery.ts`: plan detail query hook.
- `src/features/plan/mutations/useSavePlanSettingsMutation.ts`: save mutation hook with plan query invalidation.
- `src/features/plan/store/planDraftStore.ts`: local draft state for complex settings.
- `src/features/plan/views/PlanDetailView.tsx`: plan detail view.
- `src/features/plan/views/PlanSettingsView.tsx`: settings index and simple fields.
- `src/features/plan/views/PlanSettingModeView.tsx`: route-mode dispatcher view for setting subflows.
- `src/features/plan/components/*.tsx`: business-specific setting editors.

### Order Slice

- `src/domain/order/Order.ts`: order status, parsed route params, order detail, member order list, merchant summary.
- `src/domain/order/OrderRepository.ts`: repository contract for order detail and member order list.
- `src/domain/order/orderRules.ts`: parsing and display helpers.
- `src/application/order/getClientOrderDetail.ts`: detail use case.
- `src/application/order/listClientMemberOrders.ts`: member list use case.
- `src/infrastructure/mock/orderMockData.ts`: deterministic order mock data.
- `src/infrastructure/repositories/order/orderRepository.mock.ts`: mock repository.
- `src/features/order/queries/useClientOrderDetailQuery.ts`: order detail query hook.
- `src/features/order/queries/useClientMemberOrderListQuery.ts`: member list query hook.
- `src/features/order/views/ClientOrderDetailView.tsx`: order detail view.
- `src/features/order/views/ClientMemberOrderListView.tsx`: member list route-mode or tab view.

### End-To-End Coverage

- `e2e/client-list.spec.ts`: list/search/detail happy path.
- `e2e/client-settings.spec.ts`: detail settings route-mode navigation.
- `e2e/plan-settings.spec.ts`: plan settings route and save path.
- `e2e/client-order.spec.ts`: order detail/member list path.

---

### Task 1: Foundation Shared UI, Icon Boundary, And Route Baseline

**Files:**
- Create: `src/shared/ui/List/ListRow.tsx`
- Create: `src/shared/ui/List/ListSection.tsx`
- Create: `src/shared/ui/List/index.ts`
- Create: `src/shared/ui/Form/SwitchField.tsx`
- Create: `src/shared/ui/Form/SelectField.tsx`
- Create: `src/shared/ui/Feedback/Toast.tsx`
- Modify: `src/shared/ui/Form/index.ts`
- Modify: `src/shared/ui/Feedback/index.ts`
- Modify: `src/shared/assets/icons/index.ts`
- Modify: `src/app/router/routeTree.tsx`
- Test: `src/shared/ui/List/ListRow.test.tsx`
- Test: `src/shared/ui/Form/SwitchField.test.tsx`
- Test: `src/app/router/router.test.ts`

**Interfaces:**
- Consumes: existing `cn(className)` from `src/shared/utils/cn.ts`, existing `Button`, `Field`, `Page`, `RouteStack`, `RouteModeSwitch`.
- Produces:
  - `ListRow(props: { title: ReactNode; description?: ReactNode; value?: ReactNode; icon?: ReactNode; disabled?: boolean; onClick?: () => void; className?: string }): JSX.Element`
  - `ListSection(props: { title?: ReactNode; children: ReactNode; className?: string }): JSX.Element`
  - `SwitchField(props: { label: string; description?: string; checked: boolean; disabled?: boolean; onCheckedChange: (checked: boolean) => void }): JSX.Element`
  - `SelectField(props: { label: string; value: string; options: { value: string; label: string; disabled?: boolean }[]; disabled?: boolean; onChange: (value: string) => void }): JSX.Element`
  - `Toast(props: { tone?: "success" | "error" | "info"; children: ReactNode }): JSX.Element`

- [ ] **Step 1: Write failing tests for shared list and switch primitives**

Create `src/shared/ui/List/ListRow.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ListRow } from "./ListRow";

describe("ListRow", () => {
  it("renders title, description, value, and calls onClick", async () => {
    const onClick = vi.fn();
    render(<ListRow title="客户名称" description="基础信息" value="美餐" onClick={onClick} />);

    expect(screen.getByText("客户名称")).toBeInTheDocument();
    expect(screen.getByText("基础信息")).toBeInTheDocument();
    expect(screen.getByText("美餐")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /客户名称/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

Create `src/shared/ui/Form/SwitchField.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SwitchField } from "./SwitchField";

describe("SwitchField", () => {
  it("emits the next checked value", async () => {
    const onCheckedChange = vi.fn();
    render(<SwitchField label="启用通知" checked={false} onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole("switch", { name: "启用通知" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test src/shared/ui/List/ListRow.test.tsx src/shared/ui/Form/SwitchField.test.tsx
```

Expected: FAIL because `ListRow` and `SwitchField` do not exist.

- [ ] **Step 3: Implement shared primitives**

Create `src/shared/ui/List/ListRow.tsx`:

```tsx
import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

export function ListRow({
  title,
  description,
  value,
  icon,
  disabled = false,
  onClick,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  value?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <>
      {icon ? <span className="mr-3 shrink-0 text-text-tertiary">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text-primary">{title}</span>
        {description ? (
          <span className="mt-1 block text-xs leading-5 text-text-secondary">{description}</span>
        ) : null}
      </span>
      {value ? <span className="ml-3 shrink-0 text-sm text-text-secondary">{value}</span> : null}
      {onClick ? <span className="ml-2 shrink-0 text-text-tertiary">›</span> : null}
    </>
  );

  const rowClassName = cn(
    "flex w-full items-center border-b border-border-solid-line-2 px-3 py-4 text-left last:border-b-0",
    disabled && "opacity-60",
    className,
  );

  if (!onClick) return <div className={rowClassName}>{content}</div>;

  return (
    <button type="button" className={rowClassName} disabled={disabled} onClick={onClick}>
      {content}
    </button>
  );
}
```

Create `src/shared/ui/List/ListSection.tsx`:

```tsx
import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

export function ListSection({
  title,
  children,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2", className)}>
      {title ? <h2 className="px-1 text-xs font-medium text-text-tertiary">{title}</h2> : null}
      <div className="overflow-hidden rounded-md border border-border-solid-line-2 bg-background-primary-container shadow-card">
        {children}
      </div>
    </section>
  );
}
```

Create `src/shared/ui/List/index.ts`:

```ts
export { ListRow } from "./ListRow";
export { ListSection } from "./ListSection";
```

Create `src/shared/ui/Form/SwitchField.tsx`:

```tsx
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
```

Create `src/shared/ui/Form/SelectField.tsx`:

```tsx
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
```

Create `src/shared/ui/Feedback/Toast.tsx`:

```tsx
import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

const toneClassName = {
  success: "bg-functional-brand-background text-functional-brand-foreground",
  error: "bg-functional-error-background text-functional-error-foreground",
  info: "bg-background-components text-text-secondary",
};

export function Toast({ tone = "info", children }: { tone?: keyof typeof toneClassName; children: ReactNode }) {
  return (
    <div role="status" className={cn("rounded-md px-3 py-2 text-sm", toneClassName[tone])}>
      {children}
    </div>
  );
}
```

Update `src/shared/ui/Form/index.ts`:

```ts
export { Button } from "./Button";
export { Field } from "./Field";
export { SelectField } from "./SelectField";
export type { SelectFieldOption } from "./SelectField";
export { SwitchField } from "./SwitchField";
```

Update `src/shared/ui/Feedback/index.ts`:

```ts
export { ConfirmDialog } from "./ConfirmDialog";
export { EmptyState } from "./EmptyState";
export { ErrorState } from "./ErrorState";
export { LoadingState } from "./LoadingState";
export { Toast } from "./Toast";
```

- [ ] **Step 4: Keep route baseline on the five target URLs**

Inspect `src/app/router/routeTree.tsx`. It should continue to register only the target business URLs plus root:

```tsx
const opsClientListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client",
  component: ClientListRoute,
});
const opsClientDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId",
  component: ClientDetailRoute,
});
const opsPlanDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId/plan/$planId",
  component: PlanDetailRoute,
});
const opsPlanSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId/plan/$planId/setting",
  component: PlanSettingsRoute,
});
const opsClientOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId/plan/$planId/order/$orderParams",
  component: ClientOrderRoute,
});
```

If `/ops/client-next` or source `system`/`dev` routes appear, remove those registrations.

- [ ] **Step 5: Run task verification**

Run:

```bash
pnpm test src/shared/ui/List/ListRow.test.tsx src/shared/ui/Form/SwitchField.test.tsx src/app/router/router.test.ts
pnpm lint
pnpm format:check
```

Expected: all commands PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/shared/ui src/shared/assets/icons src/app/router/routeTree.tsx
git commit -m "feat: add migration foundation primitives"
```

Expected: one commit containing only foundation shared UI and route baseline changes.

---

### Task 2: Client List Vertical Slice

**Files:**
- Modify: `src/domain/client/Client.ts`
- Modify: `src/domain/client/ClientRepository.ts`
- Modify: `src/domain/client/clientRules.ts`
- Modify: `src/application/client/getClientList.ts`
- Modify: `src/infrastructure/mock/clientMockData.ts`
- Modify: `src/infrastructure/repositories/client/clientRepository.mock.ts`
- Modify: `src/infrastructure/repositories/client/index.ts`
- Modify: `src/infrastructure/query/queryKeys.ts`
- Modify: `src/features/client/queries/useClientListQuery.ts`
- Modify: `src/features/client/store/clientListStore.ts`
- Modify: `src/features/client/components/ClientCard.tsx`
- Modify: `src/features/client/views/ClientListView.tsx`
- Modify: `src/pages/client/ClientListRoute.tsx`
- Test: `src/domain/client/clientRules.test.ts`
- Test: `src/application/client/clientUseCases.test.ts`
- Test: `src/infrastructure/repositories/client/clientRepository.mock.test.ts`
- Test: `src/features/client/views/ClientListView.test.tsx`
- Test: `e2e/client-list.spec.ts`

**Interfaces:**
- Consumes:
  - `ListRow` and `ListSection` from `@/shared/ui/List`.
  - `Page`, `Button`, `Field`, `EmptyState`, `ErrorState`, `LoadingState`.
- Produces:
  - `ClientSummary` fields: `id`, `name`, `phone`, `updatedAt`, `isDeveloperTest`, `status`, `ownerName`, `settingCompletionText`.
  - `ClientListParams`: `{ keyword?: string; status?: ClientStatus | "all" }`.
  - `clientRepository.listClients(params: ClientListParams): Promise<ClientSummary[]>`.
  - `formatClientStatus(status: ClientStatus): string`.
  - `useClientListQuery(params: ClientListParams)`.
  - `ClientListView(props: { onOpenClient: (clientId: string) => void })`.

- [ ] **Step 1: Write failing domain and repository tests**

Update `src/domain/client/clientRules.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { formatClientStatus, matchesClientKeyword } from "./clientRules";
import type { ClientSummary } from "./Client";

const client: ClientSummary = {
  id: "client-1",
  name: "美餐测试客户",
  phone: "13800000000",
  status: "enabled",
  ownerName: "张三",
  settingCompletionText: "配置完整",
};

describe("clientRules", () => {
  it("formats client status labels", () => {
    expect(formatClientStatus("enabled")).toBe("启用");
    expect(formatClientStatus("disabled")).toBe("停用");
    expect(formatClientStatus("archived")).toBe("归档");
  });

  it("matches keyword by name, phone, and owner", () => {
    expect(matchesClientKeyword(client, "美餐")).toBe(true);
    expect(matchesClientKeyword(client, "138")).toBe(true);
    expect(matchesClientKeyword(client, "张三")).toBe(true);
    expect(matchesClientKeyword(client, "不存在")).toBe(false);
  });
});
```

Update `src/infrastructure/repositories/client/clientRepository.mock.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { clientRepositoryMock } from "./clientRepository.mock";

describe("clientRepositoryMock.listClients", () => {
  it("filters clients by keyword and status", async () => {
    const clients = await clientRepositoryMock.listClients({ keyword: "美餐", status: "enabled" });

    expect(clients.length).toBeGreaterThan(0);
    expect(clients.every((client) => client.status === "enabled")).toBe(true);
    expect(clients.some((client) => client.name.includes("美餐"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test src/domain/client/clientRules.test.ts src/infrastructure/repositories/client/clientRepository.mock.test.ts
```

Expected: FAIL because `ClientStatus`, `formatClientStatus`, and `matchesClientKeyword` are missing or incomplete.

- [ ] **Step 3: Extend client domain types and rules**

Update `src/domain/client/Client.ts` to include these additions without removing existing setting types:

```ts
export type ClientStatus = "enabled" | "disabled" | "archived";

export type ClientSummary = {
  id: string;
  name: string;
  phone?: string;
  updatedAt?: string;
  isDeveloperTest?: boolean;
  status: ClientStatus;
  ownerName: string;
  settingCompletionText: string;
};

export type ClientListParams = {
  keyword?: string;
  status?: ClientStatus | "all";
};
```

Update `src/domain/client/clientRules.ts`:

```ts
import type { ClientStatus, ClientSummary } from "./Client";

const clientStatusLabel: Record<ClientStatus, string> = {
  enabled: "启用",
  disabled: "停用",
  archived: "归档",
};

export function formatClientStatus(status: ClientStatus) {
  return clientStatusLabel[status];
}

export function matchesClientKeyword(client: ClientSummary, keyword = "") {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return true;

  return [client.name, client.phone, client.ownerName]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalizedKeyword));
}
```

- [ ] **Step 4: Implement deterministic client mock filtering**

Update `src/infrastructure/mock/clientMockData.ts` so each `ClientSummary` has `status`, `ownerName`, and `settingCompletionText`. Include at least these three clients:

```ts
export const clientMockData = [
  {
    id: "client-meican",
    name: "美餐科技",
    phone: "13800000000",
    updatedAt: "2026-06-01 10:00",
    isDeveloperTest: false,
    status: "enabled",
    ownerName: "张三",
    settingCompletionText: "配置完整",
  },
  {
    id: "client-demo",
    name: "演示测试客户",
    phone: "13900000000",
    updatedAt: "2026-06-02 11:00",
    isDeveloperTest: true,
    status: "enabled",
    ownerName: "李四",
    settingCompletionText: "部分配置",
  },
  {
    id: "client-archived",
    name: "历史归档客户",
    phone: "13700000000",
    updatedAt: "2026-05-20 09:30",
    isDeveloperTest: false,
    status: "archived",
    ownerName: "王五",
    settingCompletionText: "配置冻结",
  },
] satisfies ClientDetail[];
```

Update `src/infrastructure/repositories/client/clientRepository.mock.ts` list logic:

```ts
import { matchesClientKeyword } from "@/domain/client/clientRules";

async function listClients(params: ClientListParams) {
  return clientMockData.filter((client) => {
    const statusMatched = !params.status || params.status === "all" || client.status === params.status;
    return statusMatched && matchesClientKeyword(client, params.keyword);
  });
}
```

- [ ] **Step 5: Update client list UI**

Update `src/features/client/components/ClientCard.tsx` to render status, owner, and setting completion:

```tsx
import type { ClientSummary } from "@/domain/client/Client";
import { formatClientStatus } from "@/domain/client/clientRules";

export function ClientCard({ client, onClick }: { client: ClientSummary; onClick: () => void }) {
  return (
    <button
      type="button"
      className="w-full rounded-md border border-border-solid-line-2 bg-background-primary-container p-4 text-left shadow-card"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-text-primary">{client.name}</h2>
          <p className="mt-1 text-xs text-text-secondary">负责人：{client.ownerName}</p>
        </div>
        <span className="shrink-0 rounded-full bg-background-components px-2 py-1 text-xs text-text-secondary">
          {formatClientStatus(client.status)}
        </span>
      </div>
      <div className="mt-3 space-y-1 text-xs text-text-secondary">
        {client.phone ? <p>电话：{client.phone}</p> : null}
        <p>{client.settingCompletionText}</p>
        {client.isDeveloperTest ? <p className="text-functional-warning-foreground">测试客户</p> : null}
      </div>
    </button>
  );
}
```

Update `src/features/client/views/ClientListView.tsx` so it owns keyword/status UI and calls `onOpenClient(client.id)`.

- [ ] **Step 6: Add list view test**

Update `src/features/client/views/ClientListView.test.tsx` with:

```tsx
it("opens a client from the filtered list", async () => {
  const onOpenClient = vi.fn();
  renderWithProviders(<ClientListView onOpenClient={onOpenClient} />);

  await userEvent.type(screen.getByLabelText("搜索客户"), "美餐");
  await userEvent.click(await screen.findByRole("button", { name: /美餐科技/ }));

  expect(onOpenClient).toHaveBeenCalledWith("client-meican");
});
```

- [ ] **Step 7: Run task verification**

Run:

```bash
pnpm test src/domain/client/clientRules.test.ts src/application/client/clientUseCases.test.ts src/infrastructure/repositories/client/clientRepository.mock.test.ts src/features/client/views/ClientListView.test.tsx
pnpm e2e e2e/client-list.spec.ts
pnpm lint
pnpm format:check
```

Expected: all commands PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/domain/client src/application/client src/infrastructure/mock/clientMockData.ts src/infrastructure/repositories/client src/infrastructure/query/queryKeys.ts src/features/client src/pages/client/ClientListRoute.tsx e2e/client-list.spec.ts
git commit -m "feat: migrate client list mock flow"
```

Expected: one commit for the client list vertical slice.

---

### Task 3: Client Detail And Settings Route Modes

**Files:**
- Modify: `src/domain/client/Client.ts`
- Modify: `src/domain/client/ClientRepository.ts`
- Modify: `src/domain/client/clientRules.ts`
- Modify: `src/application/client/getClientDetail.ts`
- Modify: `src/application/client/updateClient.ts`
- Modify: `src/infrastructure/mock/clientMockData.ts`
- Modify: `src/infrastructure/repositories/client/clientRepository.mock.ts`
- Modify: `src/features/client/queries/useClientDetailQuery.ts`
- Modify: `src/features/client/mutations/useUpdateClientMutation.ts`
- Modify: `src/features/client/store/clientDetailUiStore.ts`
- Modify: `src/features/client/views/ClientDetailView.tsx`
- Modify: `src/features/client/views/ClientSettingsView.tsx`
- Modify: `src/features/client/views/ClientNameAndRemarkView.tsx`
- Modify: `src/features/client/views/ClientSupportSettingsView.tsx`
- Modify: `src/features/client/views/ClientLoginSettingsView.tsx`
- Modify: `src/features/client/views/ClientPasswordSettingsView.tsx`
- Modify: `src/features/client/views/ClientNotificationSettingsView.tsx`
- Modify: `src/features/client/views/ClientAppVersionSettingsView.tsx`
- Modify: `src/features/client/views/ClientManagerSettingsView.tsx`
- Modify: `src/features/client/views/ClientDepartmentSettingsView.tsx`
- Modify: `src/features/client/views/ClientCostCenterSettingsView.tsx`
- Modify: `src/features/client/views/ClientFieldSettingsView.tsx`
- Modify: `src/features/client/views/ClientMealSettingsView.tsx`
- Modify: `src/pages/client/ClientDetailRoute.tsx`
- Test: `src/pages/client/ClientDetailRoute.test.tsx`
- Test: `src/features/client/queries/useClientDetailQuery.test.tsx`
- Test: `src/features/client/views/ClientSettingsView.test.tsx`
- Test: `src/infrastructure/repositories/client/clientRepository.mock.test.ts`
- Test: `e2e/client-settings.spec.ts`

**Interfaces:**
- Consumes:
  - `routeModeState(mode)` and `RouteModeSwitch`.
  - `useUpdateClientMutation`.
  - `ListRow`, `ListSection`, `SwitchField`, `SelectField`, `Toast`.
- Produces:
  - `clientRepository.getClientDetail(clientId: string): Promise<ClientDetail | undefined>`.
  - `clientRepository.updateClient(input: UpdateClientInput): Promise<ClientDetail>`.
  - `useClientDetailQuery(clientId: string)`.
  - `useUpdateClientMutation()`.
  - Route modes: `setting`, `nameAndRemark`, `nameAndRemarkEdit`, `support`, `loginSetting`, `passwordSetting`, `notification`, `appVersion`, `manager`, `department`, `costCenter`, `fieldSetting`, `mealPoint`, `mealType`, `mealGroup`.

- [ ] **Step 1: Write failing route-mode test**

Update `src/pages/client/ClientDetailRoute.test.tsx`:

```tsx
it("dispatches customer settings route modes without adding paths", async () => {
  renderRoute("/ops/client/client-meican");

  await userEvent.click(await screen.findByRole("button", { name: "客户设置" }));
  expect(await screen.findByRole("heading", { name: "客户设置" })).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: /名称与备注/ }));
  expect(await screen.findByRole("heading", { name: "名称与备注" })).toBeInTheDocument();
  expect(window.location.pathname).toBe("/ops/client/client-meican");
});
```

- [ ] **Step 2: Write failing repository mutation test**

Extend `src/infrastructure/repositories/client/clientRepository.mock.test.ts`:

```ts
it("updates client support settings and returns the updated detail", async () => {
  const updated = await clientRepositoryMock.updateClient({
    clientId: "client-meican",
    values: {
      support: {
        contactName: "赵六",
        contactPhone: "13600000000",
      },
    },
  });

  expect(updated.settingDetails?.support).toEqual({
    contactName: "赵六",
    contactPhone: "13600000000",
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
pnpm test src/pages/client/ClientDetailRoute.test.tsx src/infrastructure/repositories/client/clientRepository.mock.test.ts
```

Expected: FAIL until route modes and mutation behavior are complete.

- [ ] **Step 4: Implement mutable mock detail update**

In `src/infrastructure/repositories/client/clientRepository.mock.ts`, store mock data in a local mutable array and implement update by merging `values` into `ClientDetail`:

```ts
let clients = clientMockData.map((client) => structuredClone(client));

async function updateClient(input: UpdateClientInput) {
  const index = clients.findIndex((client) => client.id === input.clientId);
  if (index < 0) throw new Error("客户不存在");

  const current = clients[index];
  const next: ClientDetail = {
    ...current,
    name: input.values.name ?? current.name,
    remark: input.values.remark ?? current.remark,
    settingDetails: {
      ...current.settingDetails,
      support: input.values.support ?? current.settingDetails?.support,
      login: input.values.login ?? current.settingDetails?.login,
      passwordSetting: input.values.passwordSetting ?? current.settingDetails?.passwordSetting,
      notification: input.values.notification ?? current.settingDetails?.notification,
      appVersion: input.values.appVersion ?? current.settingDetails?.appVersion,
      managers: input.values.managers ?? current.settingDetails?.managers ?? [],
      departments: input.values.departments ?? current.settingDetails?.departments ?? [],
      costCenters: input.values.costCenters ?? current.settingDetails?.costCenters ?? [],
      fieldSettings: input.values.fieldSettings ?? current.settingDetails?.fieldSettings,
      mealPoint: input.values.mealPoint ?? current.settingDetails?.mealPoint,
      mealType: input.values.mealType ?? current.settingDetails?.mealType,
      mealGroup: input.values.mealGroup ?? current.settingDetails?.mealGroup,
    },
  };

  clients[index] = next;
  return structuredClone(next);
}
```

- [ ] **Step 5: Wire route modes in `ClientDetailRoute`**

Update `src/pages/client/ClientDetailRoute.tsx` so all modes are present:

```tsx
return (
  <RouteModeSwitch
    defaultPage={
      <ClientDetailView
        client={query.data}
        onBack={back}
        onOpenMealPlans={() => enterMode("plan")}
        onOpenSettings={() => enterMode("setting")}
      />
    }
    modes={{
      plan: <ClientMealPlansView client={query.data} onBack={back} onOpenPlan={openPlan} />,
      setting: <ClientSettingsView client={query.data} onBack={back} onOpenMode={enterMode} />,
      nameAndRemark: <ClientNameAndRemarkView client={query.data} onBack={back} onEdit={() => enterMode("nameAndRemarkEdit")} />,
      nameAndRemarkEdit: <ClientDetailEditView client={query.data} onClose={back} />,
      support: <ClientSupportSettingsView client={query.data} onBack={back} />,
      loginSetting: <ClientLoginSettingsView client={query.data} onBack={back} />,
      passwordSetting: <ClientPasswordSettingsView client={query.data} onBack={back} />,
      notification: <ClientNotificationSettingsView client={query.data} onBack={back} />,
      appVersion: <ClientAppVersionSettingsView client={query.data} onBack={back} />,
      manager: <ClientManagerSettingsView client={query.data} onBack={back} />,
      department: <ClientDepartmentSettingsView client={query.data} onBack={back} />,
      costCenter: <ClientCostCenterSettingsView client={query.data} onBack={back} />,
      fieldSetting: <ClientFieldSettingsView client={query.data} onBack={back} />,
      mealPoint: <ClientMealSettingsView client={query.data} kind="mealPoint" onBack={back} />,
      mealType: <ClientMealSettingsView client={query.data} kind="mealType" onBack={back} />,
      mealGroup: <ClientMealSettingsView client={query.data} kind="mealGroup" onBack={back} />,
    }}
  />
);
```

- [ ] **Step 6: Replace placeholder setting views with real mock-backed forms**

For each settings view, use the same pattern:

```tsx
const mutation = useUpdateClientMutation();
const support = client.settingDetails?.support;

return (
  <Page title="支持设置" onBack={onBack}>
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit((values) =>
        mutation.mutate({ clientId: client.id, values: { support: values } }),
      )}
    >
      <Field label="联系人" {...form.register("contactName")} />
      <Field label="联系电话" {...form.register("contactPhone")} />
      <Button className="w-full" type="submit" disabled={mutation.isPending}>
        保存
      </Button>
      {mutation.isSuccess ? <Toast tone="success">已保存</Toast> : null}
    </form>
  </Page>
);
```

Use `SwitchField` for boolean settings, `SelectField` for single-choice settings, and `ListRow` for manager/department/cost center/meal option rows.

- [ ] **Step 7: Run task verification**

Run:

```bash
pnpm test src/pages/client/ClientDetailRoute.test.tsx src/features/client/queries/useClientDetailQuery.test.tsx src/features/client/views/ClientSettingsView.test.tsx src/infrastructure/repositories/client/clientRepository.mock.test.ts
pnpm e2e e2e/client-settings.spec.ts
pnpm lint
pnpm format:check
```

Expected: all commands PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/domain/client src/application/client src/infrastructure/mock/clientMockData.ts src/infrastructure/repositories/client src/features/client src/pages/client/ClientDetailRoute.tsx e2e/client-settings.spec.ts
git commit -m "feat: migrate client detail settings modes"
```

Expected: one commit for client detail and settings route modes.

---

### Task 4: Plan List And Plan Detail Vertical Slice

**Files:**
- Modify: `src/domain/client/Client.ts`
- Modify: `src/domain/plan/Plan.ts`
- Modify: `src/domain/plan/PlanRepository.ts`
- Modify: `src/domain/plan/planRules.ts`
- Modify: `src/application/plan/getPlanDetail.ts`
- Modify: `src/infrastructure/mock/clientMockData.ts`
- Modify: `src/infrastructure/mock/planMockData.ts`
- Modify: `src/infrastructure/repositories/plan/planRepository.mock.ts`
- Modify: `src/features/client/views/ClientMealPlansView.tsx`
- Modify: `src/features/plan/queries/usePlanDetailQuery.ts`
- Modify: `src/features/plan/views/PlanDetailView.tsx`
- Modify: `src/pages/plan/PlanDetailRoute.tsx`
- Test: `src/domain/plan/planRules.test.ts`
- Test: `src/application/plan/planUseCases.test.ts`
- Test: `src/infrastructure/repositories/plan/planRepository.mock.test.ts`
- Test: `src/features/plan/views/PlanDetailView.test.tsx`

**Interfaces:**
- Consumes:
  - `ClientDetail.mealPlans`.
  - `usePlanDetailQuery(clientId, planId)`.
  - `ListRow`, `ListSection`.
- Produces:
  - `formatBusinessType(type: ClientMealPlanSummary["businessType"]): string`.
  - `formatPlanRuleValue(rule: PlanRule): string`.
  - `planRepository.getPlanDetail(clientId: string, planId: string): Promise<PlanDetail | undefined>`.
  - `PlanDetailView(props: { clientId: string; planId: string; onBack: () => void; onOpenSettings: () => void; onOpenOrder: (orderParams: string) => void })`.

- [ ] **Step 1: Write failing plan rule and repository tests**

Update `src/domain/plan/planRules.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { formatBusinessType, formatPlanRuleValue } from "./planRules";

describe("planRules", () => {
  it("formats business type labels", () => {
    expect(formatBusinessType("groupDelivery")).toBe("团餐配送");
    expect(formatBusinessType("dineIn")).toBe("到店用餐");
  });

  it("formats open time rules", () => {
    expect(
      formatPlanRuleValue({
        id: "open-times",
        label: "开放时间",
        values: { breakfast: "08:00-10:00", lunch: "11:00-13:00" },
      }),
    ).toBe("早餐 08:00-10:00；午餐 11:00-13:00");
  });
});
```

Create or update `src/infrastructure/repositories/plan/planRepository.mock.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { planRepositoryMock } from "./planRepository.mock";

describe("planRepositoryMock.getPlanDetail", () => {
  it("returns a mock plan detail with displayable rules", async () => {
    const plan = await planRepositoryMock.getPlanDetail("client-meican", "plan-delivery");

    expect(plan?.name).toBe("工作日午餐");
    expect(plan?.rules.some((rule) => rule.id === "open-times")).toBe(true);
    expect(plan?.settings.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test src/domain/plan/planRules.test.ts src/infrastructure/repositories/plan/planRepository.mock.test.ts
```

Expected: FAIL until plan rule formatters and mock plan detail are complete.

- [ ] **Step 3: Implement plan rules**

Update `src/domain/plan/planRules.ts`:

```ts
import type { ClientMealPlanSummary } from "@/domain/client/Client";
import type { PlanRule } from "./Plan";

const businessTypeLabel: Record<ClientMealPlanSummary["businessType"], string> = {
  groupDelivery: "团餐配送",
  dineIn: "到店用餐",
};

const mealLabel: Record<string, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
};

export function formatBusinessType(type: ClientMealPlanSummary["businessType"]) {
  return businessTypeLabel[type];
}

export function formatPlanRuleValue(rule: PlanRule) {
  if (rule.id === "open-times") {
    return Object.entries(rule.values)
      .map(([key, value]) => `${mealLabel[key] ?? key} ${value}`)
      .join("；");
  }

  return Object.values(rule.values).filter(Boolean).join("；");
}
```

- [ ] **Step 4: Build mock plan detail**

Update `src/infrastructure/mock/planMockData.ts` with at least two plans:

```ts
export const planMockData = [
  {
    id: "plan-delivery",
    clientId: "client-meican",
    name: "工作日午餐",
    fields: {
      owner: "张三",
      businessType: "团餐配送",
      menuStyle: "图文菜单",
    },
    settings: [
      { id: "base-info", title: "基础信息", group: "basic", value: "工作日午餐", editable: "structured" },
      { id: "open-times", title: "开放时间", group: "order", value: "午餐 11:00-13:00", editable: "structured" },
      { id: "hide-price", title: "隐藏价格", group: "menu", value: "否", editable: "simple" },
    ],
    rules: [
      { id: "open-times", label: "开放时间", values: { lunch: "11:00-13:00" } },
      { id: "operation-day", label: "运营日", values: { weekdays: "周一至周五" } },
    ],
    updatedAt: "2026-06-01 10:00",
  },
] satisfies PlanDetail[];
```

- [ ] **Step 5: Update plan detail view**

Update `src/features/plan/views/PlanDetailView.tsx` to render:

```tsx
<Page
  title={query.data.name}
  onBack={onBack}
  navigationRight={<Button variant="ghost" onClick={onOpenSettings}>设置</Button>}
>
  <div className="space-y-4">
    <ListSection title="基础信息">
      {Object.entries(query.data.fields).map(([key, value]) => (
        <ListRow key={key} title={key} value={value} />
      ))}
    </ListSection>
    <ListSection title="规则">
      {query.data.rules.map((rule) => (
        <ListRow key={rule.id} title={rule.label} value={formatPlanRuleValue(rule)} />
      ))}
    </ListSection>
    <Button className="w-full" onClick={() => onOpenOrder(`${Date.now()}`)}>
      查看订单
    </Button>
  </div>
</Page>
```

- [ ] **Step 6: Run task verification**

Run:

```bash
pnpm test src/domain/plan/planRules.test.ts src/application/plan/planUseCases.test.ts src/infrastructure/repositories/plan/planRepository.mock.test.ts src/features/plan/views/PlanDetailView.test.tsx
pnpm lint
pnpm format:check
```

Expected: all commands PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/domain/plan src/application/plan src/infrastructure/mock/planMockData.ts src/infrastructure/repositories/plan src/features/client/views/ClientMealPlansView.tsx src/features/plan src/pages/plan/PlanDetailRoute.tsx
git commit -m "feat: migrate plan detail mock flow"
```

Expected: one commit for plan list and detail.

---

### Task 5: Plan Settings Route Modes And Save Flow

**Files:**
- Modify: `src/domain/plan/Plan.ts`
- Modify: `src/domain/plan/PlanRepository.ts`
- Modify: `src/domain/plan/planRules.ts`
- Modify: `src/application/plan/savePlanSettings.ts`
- Modify: `src/infrastructure/mock/planMockData.ts`
- Modify: `src/infrastructure/repositories/plan/planRepository.mock.ts`
- Modify: `src/features/plan/mutations/useSavePlanSettingsMutation.ts`
- Modify: `src/features/plan/store/planDraftStore.ts`
- Modify: `src/features/plan/views/PlanSettingsView.tsx`
- Create: `src/features/plan/views/PlanSettingModeView.tsx`
- Create: `src/features/plan/components/PlanBaseInfoEditor.tsx`
- Create: `src/features/plan/components/PlanOpenTimesEditor.tsx`
- Create: `src/features/plan/components/PlanSimpleSettingEditor.tsx`
- Modify: `src/pages/plan/PlanSettingsRoute.tsx`
- Test: `src/domain/plan/planRules.test.ts`
- Test: `src/infrastructure/repositories/plan/planRepository.mock.test.ts`
- Test: `src/pages/plan/PlanSettingsRoute.test.tsx`
- Test: `src/features/plan/views/PlanSettingsView.test.tsx`
- Test: `e2e/plan-settings.spec.ts`

**Interfaces:**
- Consumes:
  - `PlanDetail.settings`.
  - `SavePlanSettingsInput`.
  - `routeModeState(mode)` and `RouteModeSwitch`.
- Produces:
  - `planRepository.savePlanSettings(input: SavePlanSettingsInput): Promise<PlanDetail>`.
  - Route modes: `baseInfo`, `openTimes`, `operationDay`, `occupationTime`, `restriction`, `orderRule`, `orderTransfer`, `manualConfirmOrder`, `pickupSetting`, `locationSetting`, `menuStyle`, `financeConfig`, `maximumOrderAmount`, `merchantOrderVerification`, `hiddenAccountTypes`, `disableAppendDish`.

- [ ] **Step 1: Write failing route-mode and save tests**

Create `src/pages/plan/PlanSettingsRoute.test.tsx`:

```tsx
it("opens a plan setting mode on the same URL", async () => {
  renderRoute("/ops/client/client-meican/plan/plan-delivery/setting");

  await userEvent.click(await screen.findByRole("button", { name: /基础信息/ }));

  expect(await screen.findByRole("heading", { name: "基础信息" })).toBeInTheDocument();
  expect(window.location.pathname).toBe("/ops/client/client-meican/plan/plan-delivery/setting");
});
```

Extend `src/infrastructure/repositories/plan/planRepository.mock.test.ts`:

```ts
it("saves plan settings and returns the updated plan", async () => {
  const updated = await planRepositoryMock.savePlanSettings({
    clientId: "client-meican",
    planId: "plan-delivery",
    name: "工作日午餐更新",
    fields: { owner: "李四", businessType: "团餐配送" },
    rules: [{ id: "open-times", label: "开放时间", values: { lunch: "11:30-13:30" } }],
  });

  expect(updated.name).toBe("工作日午餐更新");
  expect(updated.fields.owner).toBe("李四");
  expect(updated.rules[0]?.values.lunch).toBe("11:30-13:30");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test src/pages/plan/PlanSettingsRoute.test.tsx src/infrastructure/repositories/plan/planRepository.mock.test.ts
```

Expected: FAIL until route mode and save behavior are complete.

- [ ] **Step 3: Implement plan settings save in mock repository**

Update `src/infrastructure/repositories/plan/planRepository.mock.ts`:

```ts
let plans = planMockData.map((plan) => structuredClone(plan));

async function savePlanSettings(input: SavePlanSettingsInput) {
  const index = plans.findIndex(
    (plan) => plan.clientId === input.clientId && plan.id === input.planId,
  );
  if (index < 0) throw new Error("方案不存在");

  const current = plans[index];
  const next: PlanDetail = {
    ...current,
    name: input.name,
    fields: input.fields,
    rules: input.rules,
    updatedAt: "2026-06-24 12:00",
  };

  plans[index] = next;
  return structuredClone(next);
}
```

- [ ] **Step 4: Implement settings route mode dispatch**

Update `src/pages/plan/PlanSettingsRoute.tsx`:

```tsx
export function PlanSettingsRoute() {
  const params = useParams({ strict: false, shouldThrow: false });
  const navigate = useNavigate();
  const router = useRouter();
  const clientId = params?.clientId ?? "";
  const planId = params?.planId ?? "";
  const back = () => router.history.back();
  const enterMode = (mode: string) => {
    void navigate({
      to: "/ops/client/$clientId/plan/$planId/setting",
      params: { clientId, planId },
      state: (state) => ({ ...state, ...routeModeState(mode) }),
    });
  };

  return (
    <RouteModeSwitch
      defaultPage={<PlanSettingsView clientId={clientId} planId={planId} onBack={back} onOpenMode={enterMode} />}
      modes={{
        baseInfo: <PlanSettingModeView clientId={clientId} planId={planId} mode="baseInfo" onBack={back} />,
        openTimes: <PlanSettingModeView clientId={clientId} planId={planId} mode="openTimes" onBack={back} />,
        menuStyle: <PlanSettingModeView clientId={clientId} planId={planId} mode="menuStyle" onBack={back} />,
        financeConfig: <PlanSettingModeView clientId={clientId} planId={planId} mode="financeConfig" onBack={back} />,
      }}
    />
  );
}
```

Add the remaining modes from the Interfaces block before the task is complete.

- [ ] **Step 5: Implement mode editor components**

Create `src/features/plan/views/PlanSettingModeView.tsx`:

```tsx
import { usePlanDetailQuery } from "@/features/plan/queries/usePlanDetailQuery";
import { ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Page } from "@/shared/ui/Page";

import { PlanBaseInfoEditor } from "../components/PlanBaseInfoEditor";
import { PlanOpenTimesEditor } from "../components/PlanOpenTimesEditor";
import { PlanSimpleSettingEditor } from "../components/PlanSimpleSettingEditor";

export function PlanSettingModeView({
  clientId,
  planId,
  mode,
  onBack,
}: {
  clientId: string;
  planId: string;
  mode: string;
  onBack: () => void;
}) {
  const query = usePlanDetailQuery(clientId, planId);

  if (query.isLoading) return <Page title="方案设置" onBack={onBack}><LoadingState /></Page>;
  if (query.isError || !query.data) return <Page title="方案设置" onBack={onBack}><ErrorState title="加载失败" onRetry={() => query.refetch()} /></Page>;

  if (mode === "baseInfo") return <PlanBaseInfoEditor plan={query.data} onBack={onBack} />;
  if (mode === "openTimes") return <PlanOpenTimesEditor plan={query.data} onBack={onBack} />;

  return <PlanSimpleSettingEditor plan={query.data} settingId={mode} onBack={onBack} />;
}
```

- [ ] **Step 6: Run task verification**

Run:

```bash
pnpm test src/domain/plan/planRules.test.ts src/infrastructure/repositories/plan/planRepository.mock.test.ts src/pages/plan/PlanSettingsRoute.test.tsx src/features/plan/views/PlanSettingsView.test.tsx
pnpm e2e e2e/plan-settings.spec.ts
pnpm lint
pnpm format:check
```

Expected: all commands PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/domain/plan src/application/plan src/infrastructure/mock/planMockData.ts src/infrastructure/repositories/plan src/features/plan src/pages/plan/PlanSettingsRoute.tsx e2e/plan-settings.spec.ts
git commit -m "feat: migrate plan settings mock flow"
```

Expected: one commit for plan settings route modes and save.

---

### Task 6: Client Order Detail And Member Order List

**Files:**
- Modify: `src/domain/order/Order.ts`
- Modify: `src/domain/order/OrderRepository.ts`
- Modify: `src/domain/order/orderRules.ts`
- Modify: `src/application/order/getClientOrderDetail.ts`
- Modify: `src/application/order/listClientMemberOrders.ts`
- Modify: `src/infrastructure/mock/orderMockData.ts`
- Modify: `src/infrastructure/repositories/order/orderRepository.mock.ts`
- Modify: `src/features/order/queries/useClientOrderDetailQuery.ts`
- Modify: `src/features/order/queries/useClientMemberOrderListQuery.ts`
- Modify: `src/features/order/views/ClientOrderDetailView.tsx`
- Modify: `src/features/order/views/ClientMemberOrderListView.tsx`
- Modify: `src/pages/order/ClientOrderRoute.tsx`
- Test: `src/domain/order/orderRules.test.ts`
- Test: `src/application/order/orderUseCases.test.ts`
- Test: `src/infrastructure/repositories/order/orderRepository.mock.test.ts`
- Test: `src/features/order/queries/useClientOrderDetailQuery.test.tsx`
- Test: `src/pages/order/ClientOrderRoute.test.tsx`
- Test: `e2e/client-order.spec.ts`

**Interfaces:**
- Consumes:
  - `parseOrderParams(raw: string): OrderParamsParseResult`.
  - `formatOrderStatus(status: OrderStatus): string`.
  - `formatMoneyFromCents(cents: number): string`.
- Produces:
  - `orderRepository.getClientOrderDetail(query: ClientOrderQuery): Promise<ClientOrderDetail | undefined>`.
  - `orderRepository.listClientMemberOrders(query: ClientOrderQuery): Promise<ClientMemberOrderItem[]>`.
  - `ClientOrderRoute` that reads `clientId`, `planId`, and `orderParams` with `useParams({ strict: false, shouldThrow: false })`.

- [ ] **Step 1: Write failing order rule tests**

Update `src/domain/order/orderRules.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { formatMoneyFromCents, formatOrderStatus, parseOrderParams } from "./orderRules";

describe("orderRules", () => {
  it("parses timestamp order params", () => {
    expect(parseOrderParams("1719200000000")).toEqual({
      ok: true,
      value: { raw: "1719200000000", time: 1719200000000 },
    });
  });

  it("parses timestamp and order number params", () => {
    expect(parseOrderParams("1719200000000:ORDER-1")).toEqual({
      ok: true,
      value: { raw: "1719200000000:ORDER-1", time: 1719200000000, orderNo: "ORDER-1" },
    });
  });

  it("formats order display values", () => {
    expect(formatOrderStatus("submitted")).toBe("已提交");
    expect(formatOrderStatus("delivering")).toBe("配送中");
    expect(formatMoneyFromCents(1234)).toBe("¥12.34");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test src/domain/order/orderRules.test.ts
```

Expected: FAIL until parse and format helpers satisfy the cases.

- [ ] **Step 3: Implement order rules**

Update `src/domain/order/orderRules.ts`:

```ts
import type { OrderParamsParseResult, OrderStatus } from "./Order";

const orderStatusLabel: Record<OrderStatus, string> = {
  submitted: "已提交",
  accepted: "已接单",
  making: "制作中",
  delivering: "配送中",
  arrived: "已送达",
  refunded: "已退款",
};

export function parseOrderParams(raw: string): OrderParamsParseResult {
  const [timeText, orderNo] = raw.split(":");
  const time = Number(timeText);

  if (!Number.isFinite(time) || time <= 0) {
    return { ok: false, error: "订单参数无效" };
  }

  return {
    ok: true,
    value: orderNo ? { raw, time, orderNo } : { raw, time },
  };
}

export function formatOrderStatus(status: OrderStatus) {
  return orderStatusLabel[status];
}

export function formatMoneyFromCents(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}
```

- [ ] **Step 4: Implement order mock repository**

Update `src/infrastructure/mock/orderMockData.ts` with at least:

```ts
export const orderDetailMockData = [
  {
    id: "order-1",
    clientId: "client-meican",
    planId: "plan-delivery",
    orderNo: "ORDER-1",
    orderDate: "2026-06-24",
    status: "delivering",
    scheduleNodes: [
      {
        id: "lunch",
        orderDeadline: "10:30",
        mealTime: "12:00",
        merchants: [{ id: "merchant-1", name: "美餐餐厅" }],
      },
    ],
    defaultScheduleNodes: [],
    priceSummary: {
      totalAmountCents: 123400,
      refundAmountCents: 0,
    },
    productCount: 120,
    memberCount: 100,
    merchantSummaries: [
      {
        merchantId: "merchant-1",
        merchantName: "美餐餐厅",
        status: "delivering",
        productCount: 120,
        amountCents: 123400,
      },
    ],
  },
] satisfies ClientOrderDetail[];
```

Implement repository lookup by `clientId`, `planId`, and optional `orderNo`.

- [ ] **Step 5: Wire route parse and error handling**

Update `src/pages/order/ClientOrderRoute.tsx`:

```tsx
const parsed = parseOrderParams(params?.orderParams ?? "");

if (!parsed.ok) {
  return (
    <Page title="订单详情" onBack={back}>
      <ErrorState title={parsed.error} />
    </Page>
  );
}

return (
  <ClientOrderDetailView
    clientId={params?.clientId ?? ""}
    planId={params?.planId ?? ""}
    orderParams={parsed.value}
    onBack={back}
  />
);
```

- [ ] **Step 6: Run task verification**

Run:

```bash
pnpm test src/domain/order/orderRules.test.ts src/application/order/orderUseCases.test.ts src/infrastructure/repositories/order/orderRepository.mock.test.ts src/features/order/queries/useClientOrderDetailQuery.test.tsx src/pages/order/ClientOrderRoute.test.tsx
pnpm e2e e2e/client-order.spec.ts
pnpm lint
pnpm format:check
```

Expected: all commands PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/domain/order src/application/order src/infrastructure/mock/orderMockData.ts src/infrastructure/repositories/order src/features/order src/pages/order/ClientOrderRoute.tsx e2e/client-order.spec.ts
git commit -m "feat: migrate client order mock flow"
```

Expected: one commit for order detail and member order list.

---

### Task 7: Shared Business Capabilities Used By Migrated Pages

**Files:**
- Create: `src/domain/payment/Payment.ts`
- Create: `src/domain/payment/PaymentRepository.ts`
- Create: `src/application/payment/listPaymentMethods.ts`
- Create: `src/infrastructure/mock/paymentMockData.ts`
- Create: `src/infrastructure/repositories/payment/paymentRepository.mock.ts`
- Create: `src/infrastructure/repositories/payment/index.ts`
- Create: `src/features/payment/queries/usePaymentMethodsQuery.ts`
- Create: `src/features/payment/components/PaymentMethodList.tsx`
- Modify: `src/domain/mc-staff/McStaff.ts`
- Modify: `src/infrastructure/mock/mcStaffMockData.ts`
- Modify: `src/features/mc-staff/components/SelectMcStaff.tsx`
- Modify: `src/domain/merchant/Merchant.ts`
- Modify: `src/infrastructure/mock/merchantMockData.ts`
- Create: `src/features/merchant/components/SelectMerchant.tsx`
- Modify: `src/infrastructure/query/queryKeys.ts`
- Test: `src/application/payment/paymentUseCases.test.ts`
- Test: `src/infrastructure/repositories/payment/paymentRepository.mock.test.ts`
- Test: `src/features/payment/components/PaymentMethodList.test.tsx`
- Test: `src/features/mc-staff/components/SelectMcStaff.test.tsx`
- Test: `src/features/merchant/components/SelectMerchant.test.tsx`

**Interfaces:**
- Consumes:
  - Existing merchant and staff repositories.
  - Shared `ListRow`, `ListSection`, `Field`.
- Produces:
  - `PaymentMethod`: `{ id: string; name: string; type: "meican" | "external"; enabled: boolean; description?: string }`.
  - `paymentRepository.listPaymentMethods(clientId: string): Promise<PaymentMethod[]>`.
  - `usePaymentMethodsQuery(clientId: string)`.
  - `PaymentMethodList(props: { clientId: string; selectedIds: string[]; onChange: (ids: string[]) => void })`.
  - `SelectMcStaff(props: { selectedIds: string[]; onChange: (ids: string[]) => void })`.
  - `SelectMerchant(props: { selectedIds: string[]; onChange: (ids: string[]) => void })`.

- [ ] **Step 1: Write failing payment repository test**

Create `src/infrastructure/repositories/payment/paymentRepository.mock.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { paymentRepositoryMock } from "./paymentRepository.mock";

describe("paymentRepositoryMock", () => {
  it("lists enabled and disabled payment methods for a client", async () => {
    const methods = await paymentRepositoryMock.listPaymentMethods("client-meican");

    expect(methods.map((method) => method.id)).toEqual(["meican-card", "external-card"]);
    expect(methods.some((method) => method.enabled)).toBe(true);
    expect(methods.some((method) => !method.enabled)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test src/infrastructure/repositories/payment/paymentRepository.mock.test.ts
```

Expected: FAIL because the payment module does not exist.

- [ ] **Step 3: Implement payment domain, use case, and repository**

Create `src/domain/payment/Payment.ts`:

```ts
export type PaymentMethod = {
  id: string;
  name: string;
  type: "meican" | "external";
  enabled: boolean;
  description?: string;
};
```

Create `src/domain/payment/PaymentRepository.ts`:

```ts
import type { PaymentMethod } from "./Payment";

export type PaymentRepository = {
  listPaymentMethods(clientId: string): Promise<PaymentMethod[]>;
};
```

Create `src/application/payment/listPaymentMethods.ts`:

```ts
import type { PaymentRepository } from "@/domain/payment/PaymentRepository";

export function listPaymentMethods(repository: PaymentRepository, clientId: string) {
  return repository.listPaymentMethods(clientId);
}
```

Create `src/infrastructure/mock/paymentMockData.ts`:

```ts
import type { PaymentMethod } from "@/domain/payment/Payment";

export const paymentMockData: Record<string, PaymentMethod[]> = {
  "client-meican": [
    { id: "meican-card", name: "美餐卡", type: "meican", enabled: true, description: "企业默认支付方式" },
    { id: "external-card", name: "外部支付", type: "external", enabled: false, description: "需开通后使用" },
  ],
};
```

Create `src/infrastructure/repositories/payment/paymentRepository.mock.ts`:

```ts
import type { PaymentRepository } from "@/domain/payment/PaymentRepository";
import { paymentMockData } from "@/infrastructure/mock/paymentMockData";

export const paymentRepositoryMock: PaymentRepository = {
  async listPaymentMethods(clientId) {
    return structuredClone(paymentMockData[clientId] ?? []);
  },
};
```

Create `src/infrastructure/repositories/payment/index.ts`:

```ts
export { paymentRepositoryMock as paymentRepository } from "./paymentRepository.mock";
```

- [ ] **Step 4: Add payment query key and hook**

Update `src/infrastructure/query/queryKeys.ts`:

```ts
payment: {
  all: ["payment"] as const,
  methods: (clientId: string) => ["payment", "methods", clientId] as const,
},
```

Create `src/features/payment/queries/usePaymentMethodsQuery.ts`:

```ts
import { useQuery } from "@tanstack/react-query";

import { listPaymentMethods } from "@/application/payment/listPaymentMethods";
import { queryKeys } from "@/infrastructure/query/queryKeys";
import { paymentRepository } from "@/infrastructure/repositories/payment";

export function usePaymentMethodsQuery(clientId: string) {
  return useQuery({
    queryKey: queryKeys.payment.methods(clientId),
    queryFn: () => listPaymentMethods(paymentRepository, clientId),
    enabled: clientId.length > 0,
  });
}
```

- [ ] **Step 5: Implement selectors only where migrated pages consume them**

Use this component shape for payment:

```tsx
export function PaymentMethodList({
  clientId,
  selectedIds,
  onChange,
}: {
  clientId: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const query = usePaymentMethodsQuery(clientId);
  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState title="支付方式加载失败" onRetry={() => query.refetch()} />;

  return (
    <ListSection title="支付方式">
      {(query.data ?? []).map((method) => (
        <ListRow
          key={method.id}
          title={method.name}
          description={method.description}
          value={selectedIds.includes(method.id) ? "已选择" : method.enabled ? "可选" : "未开通"}
          disabled={!method.enabled}
          onClick={() => {
            if (!method.enabled) return;
            onChange(
              selectedIds.includes(method.id)
                ? selectedIds.filter((id) => id !== method.id)
                : [...selectedIds, method.id],
            );
          }}
        />
      ))}
    </ListSection>
  );
}
```

Use the same pattern for `SelectMcStaff` and `SelectMerchant`: render mock-backed rows, allow toggling selected IDs, and do not add behavior that no migrated page uses.

- [ ] **Step 6: Run task verification**

Run:

```bash
pnpm test src/application/payment/paymentUseCases.test.ts src/infrastructure/repositories/payment/paymentRepository.mock.test.ts src/features/payment/components/PaymentMethodList.test.tsx src/features/mc-staff/components/SelectMcStaff.test.tsx src/features/merchant/components/SelectMerchant.test.tsx
pnpm lint
pnpm format:check
```

Expected: all commands PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/domain/payment src/application/payment src/infrastructure/mock/paymentMockData.ts src/infrastructure/repositories/payment src/features/payment src/domain/mc-staff src/infrastructure/mock/mcStaffMockData.ts src/features/mc-staff src/domain/merchant src/infrastructure/mock/merchantMockData.ts src/features/merchant src/infrastructure/query/queryKeys.ts
git commit -m "feat: add migrated shared business capabilities"
```

Expected: one commit for shared business capabilities used by migrated pages.

---

### Task 8: Final Migration Sweep And Regression Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/architecture-design.md`
- Modify: `src/shared/assets/icons/index.ts`
- Test: `e2e/client-list.spec.ts`
- Test: `e2e/client-settings.spec.ts`
- Test: `e2e/plan-settings.spec.ts`
- Test: `e2e/client-order.spec.ts`

**Interfaces:**
- Consumes: all migrated slices from Tasks 1-7.
- Produces: final verification that migration scope is complete and excluded runtime areas remain excluded.

- [ ] **Step 1: Scan for excluded imports and old route paths**

Run:

```bash
rg -n "client-next|react-router-dom|hybrid|sso|interceptor|apis-gen|apps/system|apps/dev" src
```

Expected: no matches for migrated source code. If a match appears inside a deliberate comment or test fixture, remove the reference or rewrite it to avoid normalizing excluded concepts in the new code.

- [ ] **Step 2: Scan for final migration placeholders**

Run:

```bash
rg -n "待迁移|暂未实现|未完成迁移|placeholder" src
```

Expected: no user-facing final behavior placeholders. If `editable: "placeholder"` remains in domain data, replace it with a real setting mode or mark the setting disabled with a concrete business label such as `暂不可编辑`.

- [ ] **Step 3: Scan for `Icons.XXX` references**

Run:

```bash
rg -n "Icons\\." src /Users/yxc/code/planet-h5/src/apps/client /Users/yxc/code/planet-h5/src/biz
```

Expected: no `Icons.XXX` references in this project. For old-project matches that were used by migrated pages, verify each corresponding SVG exists under `src/shared/assets/icons` and is exported from `src/shared/assets/icons/index.ts` with `?react`.

- [ ] **Step 4: Update docs for migration scope**

Update `README.md` project scope paragraph to mention that the current app uses mock-backed migrated client flows:

```md
Planet H5 Next is a mobile H5 business frontend. The current business scope covers mock-backed migrated client business flows: client list, client detail and settings, plan detail, plan setting, and client order pages.
```

Update `docs/architecture-design.md` Explicit Decisions with:

```md
- Migrated business flows are mock-backed until a separate real API integration design is approved.
- Old `planet-h5` hybrid, SSO, interceptors, Orval generation, system pages, and dev pages are outside the migration boundary.
```

- [ ] **Step 5: Run full verification**

Run:

```bash
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm e2e
```

Expected: all commands PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add README.md docs/architecture-design.md src e2e
git commit -m "chore: verify migrated mock business flows"
```

Expected: final migration verification commit.
