# Business Migration Tracker

Use this file to track migration task status, pending work, route-mode coverage, and evidence
produced while executing `docs/migration/plan.md`.

Allowed status values: `Not started`, `In progress`, `Completed`, `Blocked`, `Skipped`.

## Status Summary

| Task | Status      | Updated    | Notes                                                   |
| ---- | ----------- | ---------- | ------------------------------------------------------- |
| 1    | Completed   | 2026-06-23 | Tracker skeleton created.                               |
| 2    | Completed   | 2026-06-23 | Locked the `/ops/client...` route contract.             |
| 3    | Completed   | 2026-06-23 | Migrated client list with deterministic mock data.      |
| 4    | Completed   | 2026-06-23 | Migrated client detail default page.                    |
| 5    | Not started | N/A        | Migrate one client detail route mode.                   |
| 6    | Not started | N/A        | Migrate plan detail default page.                       |
| 7    | Not started | N/A        | Migrate plan settings route and first editor.           |
| 8    | Not started | N/A        | Migrate one plan settings route mode.                   |
| 9    | Not started | N/A        | Migrate client order detail default page.               |
| 10   | Not started | N/A        | Migrate client order member list route mode.            |
| 11   | Not started | N/A        | Migrate shared business capabilities on demand.         |
| 12   | Not started | N/A        | Migrate shared UI primitives and assets on demand.      |
| 13   | Not started | N/A        | Run final migration audit and record completion status. |

## Route Mode Status

| Area          | Route mode                               | Target                                      | Status      | Updated    | Notes                                                                                            |
| ------------- | ---------------------------------------- | ------------------------------------------- | ----------- | ---------- | ------------------------------------------------------------------------------------------------ |
| Client detail | `plan`                                   | `ClientMealPlansView`                       | Not started | 2026-06-23 | Reachable from default detail via 用餐计划; full route-mode migration pending a later task.      |
| Client detail | `setting`                                | `ClientSettingsView`                        | Not started | 2026-06-23 | Reachable from default detail navigation action; full route-mode migration pending a later task. |
| Client detail | `nameAndRemark`                          | `ClientNameAndRemarkView`                   | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `nameAndRemarkEdit`                      | `ClientDetailEditView` or focused edit view | Not started | 2026-06-23 | Reachable from `nameAndRemark`.                                                                  |
| Client detail | `notification`                           | `ClientNotificationSettingsView`            | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `paymentMethod`                          | `features/payment-method` capability        | Not started | 2026-06-23 | Reachable from client settings in legacy; current default slice does not implement this mode.    |
| Client detail | `mealType`                               | Meal type view                              | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `mealTypeSetting`                        | Meal type setting view                      | Not started | 2026-06-23 | Reachable from `mealType`.                                                                       |
| Client detail | `mealGroup`                              | Meal group view                             | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `mealPoint`                              | Meal point view                             | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `manager`                                | Manager view                                | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `support`                                | Support view                                | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `supportEdit`                            | Support edit view                           | Not started | 2026-06-23 | Reachable from `support`.                                                                        |
| Client detail | `department`                             | Department view                             | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `departmentEdit`                         | Department edit view                        | Not started | 2026-06-23 | Reachable from `department`.                                                                     |
| Client detail | `costCenter`                             | Cost center view                            | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `costCenterEdit`                         | Cost center edit view                       | Not started | 2026-06-23 | Reachable from `costCenter`.                                                                     |
| Client detail | `appVersion`                             | App version view                            | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `meicanCard`                             | `features/card-setting` capability          | Not started | 2026-06-23 | Reachable from client settings in legacy; current default slice does not implement this mode.    |
| Client detail | `externalCard`                           | `features/card-setting` capability          | Not started | 2026-06-23 | Reachable from client settings in legacy; current default slice does not implement this mode.    |
| Client detail | `fieldSetting`                           | Field setting view                          | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `fieldSettingDetail`                     | Field setting detail view                   | Not started | 2026-06-23 | Reachable from `fieldSetting`.                                                                   |
| Client detail | `loginSetting`                           | Login setting view                          | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `loginSettingEmployeeNumber`             | Employee-number login view                  | Not started | 2026-06-23 | Reachable from `loginSetting`.                                                                   |
| Client detail | `loginSettingThirdParty`                 | Third-party login view                      | Not started | 2026-06-23 | Reachable from `loginSetting`.                                                                   |
| Client detail | `loginSettingThirdPartyDetail`           | Third-party login detail view               | Not started | 2026-06-23 | Reachable from `loginSettingThirdParty`.                                                         |
| Client detail | `loginSettingThirdPartyAssociateSetting` | Third-party associate setting view          | Not started | 2026-06-23 | Reachable from `loginSettingThirdPartyDetail`.                                                   |
| Client detail | `loginSettingThirdPartyMealplanSetting`  | Third-party meal-plan setting view          | Not started | 2026-06-23 | Reachable from `loginSettingThirdPartyDetail`.                                                   |
| Client detail | `passwordSetting`                        | Password setting view                       | Not started | 2026-06-23 | Reachable from client settings.                                                                  |
| Client detail | `passwordComplexitySetting`              | Password complexity view                    | Not started | 2026-06-23 | Reachable from `passwordSetting`.                                                                |
| Client detail | `passwordPeriodSetting`                  | Password period view                        | Not started | 2026-06-23 | Reachable from `passwordSetting`.                                                                |

## Evidence Template

- Task:
- Status:
- Legacy source inspected:
- Tests added or updated:
- Behavior covered:
- Commands run:
- Result:
- Playwright coverage:
- Skipped or N/A items:

## Entries

### Task 1: Create Tracker And Baseline Guardrails

- Task: 1
- Status: Completed
- Legacy source inspected: N/A; documentation guardrail task only.
- Tests added or updated: N/A; no runtime behavior changed.
- Behavior covered: Created the migration tracker skeleton, added status tracking, added route mode status tracking, and kept `docs/migration/plan.md` aligned with `tracker.md`.
- Commands run:
  - `pnpm format:check docs/migration/plan.md docs/migration/tracker.md`
- Result: PASS
- Playwright coverage: N/A; no browser-level route flow changed.
- Skipped or N/A items: Runtime tests, build, and e2e are N/A for this documentation-only baseline task.

### Task 2: Lock The `/ops/client...` Route Contract

- Task: 2
- Status: Completed
- Legacy source inspected: `docs/migration/specs.md` route inventory; no legacy runtime source required for this route-contract guard task.
- Tests added or updated: `src/app/router/router.test.ts`, `src/app/router/RouteStack.test.tsx`, `e2e/client-list.spec.ts`.
- Behavior covered: All five `/ops/client...` routes match the TanStack route tree, migrated client/plan/order compatibility routes outside `/ops/client...` are absent, root route is bound to `RouteStack`, and `/ops/client` renders through Vite in the mobile Playwright project.
- Commands run:
  - `pnpm test src/app/router/router.test.ts src/app/router/RouteStack.test.tsx src/domain/client/clientRules.test.ts src/application/client/clientUseCases.test.ts src/infrastructure/repositories/client/clientRepository.mock.test.ts src/features/client/queries/useClientListQuery.test.tsx src/features/client/views`
  - `pnpm e2e e2e/client-list.spec.ts`
  - `pnpm build`
- Result: PASS. `pnpm build` emitted the existing Vite chunk-size warning after successful build.
- Playwright coverage: `/ops/client` smoke in mobile Chrome.
- Skipped or N/A items: No route implementation changes were needed beyond tests because the route entries already rendered through `RouteModeSwitch` and param routes already used `useParams({ strict: false, shouldThrow: false })`.

### Task 3: Migrate Client List

- Task: 3
- Status: Completed
- Legacy source inspected: `/Users/yxc/code/planet-h5/src/apps/client/client-list/index.tsx`, `/Users/yxc/code/planet-h5/src/apps/client/client-list/Detail.tsx`, `/Users/yxc/code/planet-h5/src/apps/client/client-list/comps/Card.tsx`, `/Users/yxc/code/planet-h5/src/apps/client/client-list/hooks/useClientList.tsx`, `/Users/yxc/code/planet-h5/src/apps/client/client-list/helper/normalize.ts`, `/Users/yxc/code/planet-h5/src/apps/client/client-list/types.ts`, `/Users/yxc/code/planet-h5/src/apps/client/client-list/constants/index.ts`.
- Tests added or updated: `src/domain/client/clientRules.test.ts`, `src/application/client/clientUseCases.test.ts`, `src/infrastructure/repositories/client/clientRepository.mock.test.ts`, `src/features/client/queries/useClientListQuery.test.tsx`, `src/features/client/views/ClientListView.test.tsx`, `e2e/client-list.spec.ts`.
- Behavior covered: Keyword filtering by name and phone, unmatched empty results, missing or blank params normalization, deterministic newest-first ordering, developer-test tag data, query keys using committed params only, loading/empty/error/populated list states, search submit behavior, client card detail link, and browser navigation from `/ops/client` to `/ops/client/c1` and back.
- Commands run:
  - `pnpm test src/app/router/router.test.ts src/app/router/RouteStack.test.tsx src/domain/client/clientRules.test.ts src/application/client/clientUseCases.test.ts src/infrastructure/repositories/client/clientRepository.mock.test.ts src/features/client/queries/useClientListQuery.test.tsx src/features/client/views`
  - `pnpm e2e e2e/client-list.spec.ts`
  - `pnpm build`
- Result: PASS. `pnpm build` emitted the existing Vite chunk-size warning after successful build.
- Playwright coverage: Mobile Chrome opens `/ops/client`, taps 客户 A, verifies `/ops/client/c1`, then browser back returns to `/ops/client`.
- Skipped or N/A items: Infinite loading and create-client popup from the legacy H5 page are not part of the deterministic mock-backed Task 3 slice.

### Task 4: Migrate Client Detail Default Page

- Task: 4
- Status: Completed
- Legacy source inspected: `/Users/yxc/code/planet-h5/src/apps/client/client-detail/index.tsx`, `/Users/yxc/code/planet-h5/src/apps/client/client-detail/Detail.tsx`, `/Users/yxc/code/planet-h5/src/apps/client/client-detail/constants/index.ts`, `/Users/yxc/code/planet-h5/src/apps/client/client-detail/hooks/index.tsx`, `/Users/yxc/code/planet-h5/src/apps/client/client-detail/helpers/normalize.ts`, `/Users/yxc/code/planet-h5/src/apps/client/client-detail/types/index.ts`, and route-mode references under `/Users/yxc/code/planet-h5/src/apps/client/client-detail`.
- Tests added or updated: `src/pages/client/ClientDetailRoute.test.tsx`, `src/application/client/clientUseCases.test.ts`, `src/infrastructure/repositories/client/clientRepository.mock.test.ts`, `src/features/client/queries/useClientDetailQuery.test.tsx`, `e2e/client-list.spec.ts`.
- Behavior covered: Default client detail loading/error/success path, route params passed into detail query, unknown route-mode fallback, settings route-mode dispatch from navigation, old default entries for 用餐计划 and 目的地, web fallback copy for 目的地, deterministic detail fixture with developer-test marker, meal-plan data, setting summaries, missing-client error, query key scoped by `clientId`, and browser navigation from `/ops/client/c1` through 用餐计划 to `/ops/client/c1/plan/p1`.
- Commands run:
  - `pnpm test src/pages/client/ClientDetailRoute.test.tsx src/application/client/clientUseCases.test.ts src/infrastructure/repositories/client/clientRepository.mock.test.ts src/features/client/queries/useClientDetailQuery.test.tsx src/features/client/views`
  - `pnpm lint`
  - `pnpm format:check`
  - `pnpm test`
  - `pnpm e2e`
- Result: PASS.
- Playwright coverage: Mobile Chrome opens `/#/ops/client/c1`, enters 用餐计划, taps 方案 A, and verifies `/ops/client/c1/plan/p1`.
- Skipped or N/A items: Full migration of client detail route modes is deferred to Task 5 and later route-mode tasks. Hybrid destination navigation is out of scope; the migrated web fallback preserves the legacy non-hybrid user message.
