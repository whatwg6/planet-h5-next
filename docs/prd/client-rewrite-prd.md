# PRD: Rewrite Client Business Line With Legacy Behavior Parity

## Problem Statement

The current `planet-h5-next` client implementation is not a complete replacement for the legacy client business line. It follows the intended layered architecture, but important client behavior has been simplified or diverges from the legacy experience. The clearest example is department settings: the legacy implementation manages manual and third-party synchronized departments as trees, while the current implementation treats departments as a flat editable list.

From the user's perspective, the rewrite needs to stop being an architecture demo and become a complete, behaviorally faithful client business line. The implementation should preserve the current project's architecture, routes, and `routeMode` model while matching the legacy client UI and interaction behavior closely enough for real use.

## Solution

Rewrite the client business line inside `planet-h5-next`, using the legacy `planet-h5/src/apps/client` implementation only as the UI and behavior reference. The current project remains the implementation target.

The rewrite will use mock repositories only. These mocks must be mutable so writes such as creating a department, editing settings, deleting data, toggling settings, and save failures can be exercised through real application flows. No real API, Orval, hybrid integration, SSO, global interceptors, system pages, or dev pages are part of this PRD.

The solution should keep the current client route chain and use `routeMode` for child pages, setting details, and edit modes. The rewrite should rebuild the H5 UI base layer where needed, rebuild the client domain model, implement mutable mock repositories, then rewrite client settings, plan settings, and order flows in that order.

## User Stories

1. As an operations user, I want to open the client list, so that I can find enterprise customers from the H5 client workflow.
2. As an operations user, I want to search clients by keyword, so that I can quickly locate the customer I need.
3. As an operations user, I want client list loading, empty, and error states, so that I understand whether data is loading, absent, or failed.
4. As an operations user, I want client cards to match the legacy visual structure, so that the rewritten app feels consistent with the existing workflow.
5. As an operations user, I want to open a client detail page, so that I can inspect the customer's business information.
6. As an operations user, I want the client detail page to expose meal plans and settings, so that I can enter the same business flows available in the legacy client.
7. As an operations user, I want client child pages to use same-URL `routeMode` navigation, so that detail and edit modes behave like H5 page modes without adding extra paths.
8. As an operations user, I want to open the client settings catalog, so that I can see all settings grouped like the legacy implementation.
9. As an operations user, I want setting rows to support action rows, switch rows, readonly rows, descriptions, values, disabled states, and unsupported behavior, so that settings behave like the legacy client.
10. As an operations user, I want unsupported settings to remain unsupported where the legacy app does, so that the rewrite does not invent unapproved functionality.
11. As an operations user, I want switch settings to show the same confirmation behavior as the legacy app, so that accidental changes are prevented.
12. As an operations user, I want failed switch or save actions to show toast feedback and leave me on the current page, so that I can correct or retry the action.
13. As an operations user, I want successful form saves to navigate back or close the sheet/modal, so that the completion behavior matches the legacy client.
14. As an operations user, I want unsaved edits to trigger a confirmation before leaving, so that I do not lose changes accidentally.
15. As an operations user, I want duplicate submissions to be prevented while saving, so that repeated taps do not create inconsistent data.
16. As an operations user, I want to edit a client's name and remark, so that customer display information can be maintained.
17. As an operations user, I want to view and edit customer notification settings, so that enterprise announcements can be managed.
18. As an operations user, I want to view and configure customer payment methods, so that customer payment behavior can be inspected and adjusted.
19. As an operations user, I want to manage meal type settings, so that dining time or meal card behavior matches the customer's business configuration.
20. As an operations user, I want to manage meal groups, so that customer meal grouping can be reviewed and configured.
21. As an operations user, I want to manage customer managers, so that management permission assignments can be maintained.
22. As an operations user, I want to view and edit customer support settings, so that support contact information is correct.
23. As an operations user, I want department settings to show manual departments as a tree, so that nested departments are represented accurately.
24. As an operations user, I want department settings to show third-party synchronized departments separately as a tree, so that I can distinguish editable and readonly structures.
25. As an operations user, I want to expand and collapse department nodes, so that I can inspect large department trees efficiently.
26. As an operations user, I want to create a manual department, so that a customer can add organization nodes not synchronized from third-party systems.
27. As an operations user, I want to edit a manual department, so that its name or parent can be corrected.
28. As an operations user, I want to delete a manual department with confirmation, so that obsolete departments can be removed deliberately.
29. As an operations user, I want to select a parent department from a tree, so that department hierarchy can be configured naturally.
30. As an operations user, I want the app to reject selecting a department itself or one of its descendants as its parent, so that the tree cannot become cyclic.
31. As an operations user, I want third-party synchronized departments to be readonly, so that synced data is not edited from the wrong system.
32. As an operations user, I want department changes to survive refetching in the mock-backed app, so that the rewrite can be tested like a real workflow.
33. As an operations user, I want to manage cost centers, so that customer accounting configuration can be maintained.
34. As an operations user, I want to manage app version settings, so that minimum client version behavior can be configured.
35. As an operations user, I want to view meican card and external card entry behavior, so that card-related flows remain consistent with legacy behavior.
36. As an operations user, I want to configure meal point usage behavior, so that points settings match the customer's business needs.
37. As an operations user, I want to manage field settings, so that required and optional profile fields are controlled correctly.
38. As an operations user, I want field setting details to preserve the legacy editing behavior, so that per-field configuration remains accurate.
39. As an operations user, I want to manage login settings, so that customer account access methods are configured correctly.
40. As an operations user, I want employee-number login settings to be represented, so that enterprise custom login behavior is preserved.
41. As an operations user, I want third-party login configuration pages to be represented, so that synced platform login behavior is preserved.
42. As an operations user, I want third-party login detail pages to work through `routeMode`, so that the same route can host nested configuration modes.
43. As an operations user, I want third-party login association settings, so that linked field behavior can be configured.
44. As an operations user, I want third-party login meal-plan joining settings, so that imported users can be assigned to meal plans consistently.
45. As an operations user, I want to manage password policy settings, so that required password, complexity, and periodic-change behavior can be configured.
46. As an operations user, I want password complexity settings to be editable, so that password composition rules can match customer requirements.
47. As an operations user, I want periodic password-change settings to be editable, so that password age policy can be configured.
48. As an operations user, I want to open a client's meal plan list, so that I can manage food-service configurations under the client.
49. As an operations user, I want to open a meal plan detail page, so that I can inspect plan information and order-related data.
50. As an operations user, I want plan detail UI and behavior to match the legacy plan detail flow, so that the rewrite is usable for existing workflows.
51. As an operations user, I want to open the plan settings catalog, so that I can see plan settings grouped like the legacy implementation.
52. As an operations user, I want group delivery and dine-in meal plans to show different settings where the legacy app does, so that business-type-specific behavior is preserved.
53. As an operations user, I want mock data to include both group delivery and dine-in plans, so that both branches can be exercised.
54. As an operations user, I want to edit plan base information, so that plan name and remark can be maintained.
55. As an operations user, I want to configure operation days, so that serving-day rules are represented.
56. As an operations user, I want to configure merchant restrictions, so that plan merchant rules match the customer business.
57. As an operations user, I want to view member count and member list flows, so that plan participant behavior is represented.
58. As an operations user, I want group delivery open-time settings, so that ordering windows can be configured.
59. As an operations user, I want dine-in open-time settings, so that dine-in meal periods can be configured.
60. As an operations user, I want maximum order amount settings, so that order limits can be configured.
61. As an operations user, I want hidden price and hidden meal point settings, so that customer display rules can be configured.
62. As an operations user, I want disable-append-dish settings, so that post-order dish changes can be controlled.
63. As an operations user, I want hidden account type settings, so that payment account visibility can be configured.
64. As an operations user, I want dish remark and delivery remark settings, so that customer order remark behavior can be configured.
65. As an operations user, I want order rule text settings, so that the customer's ordering copy can be maintained.
66. As an operations user, I want plan payment method settings, so that plan-level payment behavior can be configured.
67. As an operations user, I want manual order confirmation settings, so that orders can require customer-admin confirmation where needed.
68. As an operations user, I want occupation time settings, so that destination time occupation behavior can be configured.
69. As an operations user, I want order transfer settings, so that transfer permissions can be configured.
70. As an operations user, I want merchant order verification settings, so that merchant verification behavior can be configured.
71. As an operations user, I want pickup settings and pickup-code rule settings, so that pickup behavior is represented.
72. As an operations user, I want menu style settings, so that client menu presentation rules are represented.
73. As an operations user, I want finance configuration settings, so that finance-related plan fields can be maintained.
74. As an operations user, I want finance amount and meal type sub-settings, so that finance configuration can be edited at the same granularity as the legacy app.
75. As an operations user, I want location settings, so that dine-in or destination-related behavior remains represented.
76. As an operations user, I want to open client order flows from the plan route chain, so that order inspection remains available.
77. As an operations user, I want client member order list behavior, so that I can inspect member orders under a plan.
78. As an operations user, I want client order detail behavior, so that I can inspect order contents and status.
79. As an operations user, I want price summaries in order detail, so that payment totals are clear.
80. As an operations user, I want merchant schedule information in order detail, so that supply timing remains visible.
81. As a developer, I want the rewrite to use the current clean architecture dependency direction, so that business behavior stays testable and maintainable.
82. As a developer, I want route components to stay thin, so that page composition remains in feature views.
83. As a developer, I want feature views to avoid direct mock or HTTP imports, so that data access stays behind use cases and repositories.
84. As a developer, I want repository contracts to live in the domain layer, so that infrastructure details do not leak into the application.
85. As a developer, I want mock repository implementations to return domain entities, so that feature code does not depend on backend response shapes.
86. As a developer, I want query keys to stay centralized, so that cache invalidation remains predictable.
87. As a developer, I want business-specific components to stay out of shared UI, so that the base component layer remains business-agnostic.
88. As a developer, I want reusable business capability components to live in focused feature modules, so that shared business behavior does not become global UI.
89. As a developer, I want behavior tests at the route and feature seams, so that future rewrites do not silently simplify business behavior again.
90. As a developer, I want this PRD to be split into independently implementable issues, so that each implementation session can stay small and reviewable.

## Implementation Decisions

- The implementation target is the current project, not the legacy project.
- The legacy client implementation is the behavior and UI reference.
- The current partial rewrite may be replaced where it diverges from the desired behavior.
- Keep the current client route paths.
- Use `routeMode` for same-URL child pages, details, and edit modes.
- Do not introduce extra routes for setting details or edit pages.
- Include client, plan, and order because they are part of the current client route chain.
- Implement client settings before plan and order flows.
- Exclude hybrid integration, SSO, global interceptors, Orval, system pages, and dev pages.
- Use mock repositories only.
- Mock repositories must be mutable and reflect writes in later reads.
- Mock repositories should return domain entities, not backend response shapes.
- Define only the business types needed for this rewrite.
- Preserve the clean architecture dependency direction used by the current project.
- Route entries remain thin and dispatch modes through route helpers.
- Feature views own page composition and interactions.
- Application use cases coordinate business actions.
- Domain models define business entities, repository contracts, and pure rules.
- Infrastructure repositories hide mock implementation details.
- Query hooks call application use cases and selected repository facades.
- Shared UI remains business-agnostic.
- Client, plan, order, payment, merchant, and staff semantics belong under feature/domain/application modules, not shared UI.
- A focused settings capability module may be introduced for reusable business setting patterns if it stays independent of owning page save flows.
- H5 UI base components may be extended or rebuilt to support legacy-like behavior.
- Do not force the new component API to mimic the legacy component API.
- Prefer setting components that express intent directly, such as action rows, switch rows, readonly rows, and sections.
- Keep legacy unsupported behaviors unsupported.
- Apply consistent form-save behavior: success navigates back or closes, failure shows toast and stays, unsaved back confirms, saving blocks duplicate submit.
- The department model must support manual and third-party synchronized trees.
- Department editing must prevent cyclic parent selection.
- Department writes must be observable after refetch through the mutable mock repository.
- Mock data must include group delivery and dine-in meal plans.
- Mock data must include different payment configurations, order states, successful saves, and failed saves.
- The first recommended vertical slice is customer settings > departments because it validates tree domain modeling, mutable mock writes, routeMode, UI base components, save failure, and unsaved-change behavior together.

## Testing Decisions

- Tests should validate external behavior, not implementation details.
- The highest-level acceptance seam is route-level page behavior using route entries and `RouteModeSwitch`.
- Route tests should verify that major client modes can open the intended page and that same-path mode dispatch works.
- Application use case plus mutable mock repository tests should verify business outcomes such as create, edit, delete, update, failure, and refetch persistence.
- Feature view tests should cover complex interactions: department tree, settings catalog, switch confirmation, form save, parent selection, illegal parent rejection, toast-on-failure, and unsaved-change confirmation.
- End-to-end coverage should be limited to critical flows: client list to detail, detail to settings, full department tree CRUD, plan settings for group delivery, and plan settings for dine-in.
- Do not add screenshot baseline tests for this PRD.
- Do not over-test shared UI internals. Test shared UI only where it has meaningful standalone behavior, such as Tree expand/collapse or Dialog confirm/cancel.
- Use the existing test placement conventions: domain rules near domain code, use cases under application modules, repository implementation tests under infrastructure repositories, feature view tests under feature folders, route tests under the router/pages area, and Playwright for browser-level route flows.
- Before handoff for implementation issues, run the narrowest useful tests for the changed slice. Larger slices should also run lint, format check, unit tests, build, and e2e where relevant.

## Out of Scope

- Rewriting the legacy `planet-h5` project.
- Real API integration.
- Orval generation or generated API client integration.
- Hybrid bridge integration.
- SSO or login callback work.
- Global Axios interceptor redesign.
- System pages.
- Dev pages.
- Screenshot baseline testing.
- PC/admin responsive behavior outside the H5 scope.
- Inventing new functionality where the legacy client intentionally shows unsupported behavior.
- Broad repository reformatting or unrelated architecture cleanup.

## Further Notes

This PRD follows the accepted ADRs for client rewrite scope, UI and behavior parity, and mock-backed domain behavior.

The work should be split into independently implementable issues before coding. Suggested issue boundaries include H5 UI base components, mutable client mock repository, the department tree vertical slice, client settings catalog, grouped client setting details, plan settings group-delivery branch, plan settings dine-in branch, and client order flows.

The department vertical slice should be implemented early because it exposes the main risks: tree modeling, routeMode child pages, mutable mock persistence, UI parity, unsaved-change confirmation, save failure behavior, and business-specific component boundaries.
