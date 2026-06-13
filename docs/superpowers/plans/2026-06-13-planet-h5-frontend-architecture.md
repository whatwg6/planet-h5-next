# Planet H5 Frontend Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the initial mobile H5 React frontend architecture for client, merchant, and plan pages without inventing business rules not present in the spec.

**Architecture:** Use the spec's lightweight Clean Architecture: pages render route entries, features own React views and local interaction state, application use cases coordinate repository calls, domain defines entities and repository contracts, and infrastructure implements mock/http repositories plus DTO mappers. Domain rule files are created as explicit boundary modules, but they only expose neutral helpers until real business rules are specified.

**Tech Stack:** pnpm, Vite, React 19, TypeScript, TanStack Router, TanStack Query, Zustand, React Hook Form, Zod, Axios, Tailwind CSS, Vitest, React Testing Library, MSW.

---

## File Structure

- `package.json`, `pnpm-lock.yaml`: package scripts and dependencies.
- `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`: Vite entry, React shell, and H5 global styles.
- `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`: build, test, TypeScript, and Tailwind configuration.
- `src/app/router/*`: route tree, router instance, and route metadata.
- `src/app/providers/AppProviders.tsx`: QueryClient and Router providers.
- `src/app/bootstrap/*`: query client, repository selection, and use case composition.
- `src/domain/{client,merchant,plan}/*`: entity types, repository contracts, and neutral rule-boundary helpers.
- `src/application/{client,merchant,plan}/*`: use cases that validate required identifiers and delegate to repositories.
- `src/infrastructure/http/*`: Axios client and HTTP error normalization.
- `src/infrastructure/repositories/*`: DTOs, mappers, mock repositories, and HTTP repositories.
- `src/infrastructure/mock/*`: deterministic mock data for smoke tests only.
- `src/infrastructure/query/queryKeys.ts`: typed TanStack Query keys.
- `src/shared/ui/*`: generic H5 UI primitives with no client, merchant, or plan business meaning.
- `src/features/client/*`: client list/detail views, query/mutation hooks, client edit UI state, and client-specific display components.
- `src/features/merchant/*`: merchant list/detail views, query hooks, local list state, and merchant-specific display components.
- `src/features/plan/*`: plan detail/settings views, query/mutation hooks, draft-save feedback state, and plan-specific display components.
- `src/features/setting-rule/*`: reusable business-capability shell for setting-rule form fragments; it does not decide how client or plan data is saved.
- `src/pages/*`: TanStack Router route entry components only.
- `src/test/*`: test setup and MSW server.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `src/vite-env.d.ts`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Create package manifest**

Write `package.json`:

```json
{
  "name": "planet-h5-next",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc -b --noEmit"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@tanstack/react-query": "^5.80.0",
    "@tanstack/react-router": "^1.120.0",
    "axios": "^1.9.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.24.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "msw": "^2.7.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
pnpm install
```

Expected: command exits `0` and creates `pnpm-lock.yaml`.

- [ ] **Step 3: Add Vite, TypeScript, Tailwind, and test setup**

Write `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Planet H5</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Write `vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
```

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "vite.config.ts", "tailwind.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Write `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "tailwind.config.ts"]
}
```

Write `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#F7F8FA",
        ink: "#17202A",
        muted: "#6B7280",
        line: "#E5E7EB",
        brand: "#1D8F72",
        danger: "#C2410C",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

Write `postcss.config.js`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Write `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

Write `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Write `src/styles.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color: #17202a;
  background: #f7f8fa;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}
```

Write `src/App.tsx`:

```tsx
export function App() {
  return <div className="min-h-screen bg-surface text-ink">Planet H5</div>;
}
```

Write `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 4: Verify scaffold**

Run:

```bash
pnpm build
pnpm test
```

Expected: `pnpm build` exits `0`; `pnpm test` exits `0` or reports no test files.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml index.html vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.ts postcss.config.js src
git commit -m "chore: scaffold h5 react app"
```

## Task 2: Domain Contracts Without Invented Business Rules

**Files:**
- Create: `src/domain/client/Client.ts`
- Create: `src/domain/client/ClientRepository.ts`
- Create: `src/domain/client/clientRules.ts`
- Create: `src/domain/client/clientRules.test.ts`
- Create: `src/domain/merchant/Merchant.ts`
- Create: `src/domain/merchant/MerchantRepository.ts`
- Create: `src/domain/merchant/merchantRules.ts`
- Create: `src/domain/merchant/merchantRules.test.ts`
- Create: `src/domain/plan/Plan.ts`
- Create: `src/domain/plan/PlanRepository.ts`
- Create: `src/domain/plan/planRules.ts`
- Create: `src/domain/plan/planRules.test.ts`

- [ ] **Step 1: Write failing boundary tests**

Write `src/domain/client/clientRules.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { hasClientIdentity } from "./clientRules";

describe("clientRules boundary", () => {
  it("only checks whether a client identity is present", () => {
    expect(hasClientIdentity({ id: "c1" })).toBe(true);
    expect(hasClientIdentity({ id: "" })).toBe(false);
  });
});
```

Write `src/domain/merchant/merchantRules.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { hasMerchantIdentity } from "./merchantRules";

describe("merchantRules boundary", () => {
  it("only checks whether a merchant identity is present", () => {
    expect(hasMerchantIdentity({ id: "m1" })).toBe(true);
    expect(hasMerchantIdentity({ id: " " })).toBe(false);
  });
});
```

Write `src/domain/plan/planRules.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { hasPlanIdentity } from "./planRules";

describe("planRules boundary", () => {
  it("only checks whether a plan identity is present", () => {
    expect(hasPlanIdentity({ id: "p1" })).toBe(true);
    expect(hasPlanIdentity({ id: "" })).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
pnpm test -- src/domain
```

Expected: FAIL with missing domain modules.

- [ ] **Step 3: Add neutral entity types and repository contracts**

Write `src/domain/client/Client.ts`:

```ts
export type ClientSummary = {
  id: string;
  name: string;
  phone?: string;
  updatedAt?: string;
};

export type ClientDetail = ClientSummary & {
  fields: Record<string, string>;
  planIds: string[];
};

export type ClientListParams = {
  keyword?: string;
};

export type UpdateClientInput = {
  clientId: string;
  values: Record<string, string>;
};
```

Write `src/domain/client/ClientRepository.ts`:

```ts
import type { ClientDetail, ClientListParams, ClientSummary, UpdateClientInput } from "./Client";

export type ClientRepository = {
  listClients(params: ClientListParams): Promise<ClientSummary[]>;
  getClientDetail(clientId: string): Promise<ClientDetail>;
  updateClient(input: UpdateClientInput): Promise<ClientDetail>;
};
```

Write `src/domain/merchant/Merchant.ts`:

```ts
export type MerchantSummary = {
  id: string;
  name: string;
  city?: string;
};

export type MerchantDetail = MerchantSummary & {
  fields: Record<string, string>;
};

export type MerchantListParams = {
  keyword?: string;
};
```

Write `src/domain/merchant/MerchantRepository.ts`:

```ts
import type { MerchantDetail, MerchantListParams, MerchantSummary } from "./Merchant";

export type MerchantRepository = {
  listMerchants(params: MerchantListParams): Promise<MerchantSummary[]>;
  getMerchantDetail(merchantId: string): Promise<MerchantDetail>;
};
```

Write `src/domain/plan/Plan.ts`:

```ts
export type PlanRule = {
  id: string;
  label: string;
  values: Record<string, string>;
};

export type PlanDetail = {
  id: string;
  clientId: string;
  name: string;
  fields: Record<string, string>;
  rules: PlanRule[];
  updatedAt?: string;
};

export type SavePlanSettingsInput = {
  clientId: string;
  planId?: string;
  name: string;
  fields: Record<string, string>;
  rules: PlanRule[];
};
```

Write `src/domain/plan/PlanRepository.ts`:

```ts
import type { PlanDetail, SavePlanSettingsInput } from "./Plan";

export type PlanRepository = {
  getPlanDetail(clientId: string, planId: string): Promise<PlanDetail>;
  savePlanSettings(input: SavePlanSettingsInput): Promise<PlanDetail>;
};
```

- [ ] **Step 4: Add neutral rule-boundary helpers**

Write `src/domain/client/clientRules.ts`:

```ts
export function hasClientIdentity(client: { id: string }) {
  return client.id.trim().length > 0;
}
```

Write `src/domain/merchant/merchantRules.ts`:

```ts
export function hasMerchantIdentity(merchant: { id: string }) {
  return merchant.id.trim().length > 0;
}
```

Write `src/domain/plan/planRules.ts`:

```ts
export function hasPlanIdentity(plan: { id: string }) {
  return plan.id.trim().length > 0;
}
```

- [ ] **Step 5: Verify domain tests**

Run:

```bash
pnpm test -- src/domain
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain
git commit -m "feat: add domain contracts"
```

## Task 3: Application Use Cases

**Files:**
- Create: `src/application/client/getClientList.ts`
- Create: `src/application/client/getClientDetail.ts`
- Create: `src/application/client/updateClient.ts`
- Create: `src/application/client/clientUseCases.test.ts`
- Create: `src/application/merchant/getMerchantList.ts`
- Create: `src/application/merchant/getMerchantDetail.ts`
- Create: `src/application/merchant/merchantUseCases.test.ts`
- Create: `src/application/plan/getPlanDetail.ts`
- Create: `src/application/plan/savePlanSettings.ts`
- Create: `src/application/plan/planUseCases.test.ts`

- [ ] **Step 1: Write failing use case tests**

Write `src/application/client/clientUseCases.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import { getClientDetail } from "./getClientDetail";
import { getClientList } from "./getClientList";
import { updateClient } from "./updateClient";
import type { ClientRepository } from "@/domain/client/ClientRepository";

const repository: ClientRepository = {
  listClients: vi.fn().mockResolvedValue([{ id: "c1", name: "客户 A" }]),
  getClientDetail: vi.fn().mockResolvedValue({ id: "c1", name: "客户 A", fields: {}, planIds: [] }),
  updateClient: vi.fn().mockResolvedValue({ id: "c1", name: "客户 A", fields: {}, planIds: [] }),
};

describe("client use cases", () => {
  it("delegates list params to the repository", async () => {
    await getClientList(repository, { keyword: "A" });
    expect(repository.listClients).toHaveBeenCalledWith({ keyword: "A" });
  });

  it("rejects empty client ids before detail lookup", async () => {
    await expect(getClientDetail(repository, " ")).rejects.toThrow("clientId is required");
  });

  it("passes update values through without applying business decisions", async () => {
    await updateClient(repository, { clientId: "c1", values: { name: "客户 A" } });
    expect(repository.updateClient).toHaveBeenCalledWith({ clientId: "c1", values: { name: "客户 A" } });
  });
});
```

Write `src/application/merchant/merchantUseCases.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import { getMerchantDetail } from "./getMerchantDetail";
import { getMerchantList } from "./getMerchantList";
import type { MerchantRepository } from "@/domain/merchant/MerchantRepository";

const repository: MerchantRepository = {
  listMerchants: vi.fn().mockResolvedValue([{ id: "m1", name: "商户 A" }]),
  getMerchantDetail: vi.fn().mockResolvedValue({ id: "m1", name: "商户 A", fields: {} }),
};

describe("merchant use cases", () => {
  it("delegates list params to the repository", async () => {
    await getMerchantList(repository, { keyword: "A" });
    expect(repository.listMerchants).toHaveBeenCalledWith({ keyword: "A" });
  });

  it("rejects empty merchant ids before detail lookup", async () => {
    await expect(getMerchantDetail(repository, "")).rejects.toThrow("merchantId is required");
  });
});
```

Write `src/application/plan/planUseCases.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import { getPlanDetail } from "./getPlanDetail";
import { savePlanSettings } from "./savePlanSettings";
import type { PlanRepository } from "@/domain/plan/PlanRepository";

const repository: PlanRepository = {
  getPlanDetail: vi.fn().mockResolvedValue({ id: "p1", clientId: "c1", name: "方案 A", fields: {}, rules: [] }),
  savePlanSettings: vi.fn().mockResolvedValue({ id: "p1", clientId: "c1", name: "方案 A", fields: {}, rules: [] }),
};

describe("plan use cases", () => {
  it("rejects missing ids before plan detail lookup", async () => {
    await expect(getPlanDetail(repository, "", "p1")).rejects.toThrow("clientId is required");
    await expect(getPlanDetail(repository, "c1", "")).rejects.toThrow("planId is required");
  });

  it("passes plan settings through to the repository", async () => {
    await savePlanSettings(repository, { clientId: "c1", planId: "p1", name: "方案 A", fields: {}, rules: [] });
    expect(repository.savePlanSettings).toHaveBeenCalledWith({
      clientId: "c1",
      planId: "p1",
      name: "方案 A",
      fields: {},
      rules: [],
    });
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
pnpm test -- src/application
```

Expected: FAIL with missing use case modules.

- [ ] **Step 3: Implement use cases**

Write `src/application/client/getClientList.ts`:

```ts
import type { ClientListParams } from "@/domain/client/Client";
import type { ClientRepository } from "@/domain/client/ClientRepository";

export function getClientList(repository: ClientRepository, params: ClientListParams) {
  return repository.listClients(params);
}
```

Write `src/application/client/getClientDetail.ts`:

```ts
import type { ClientRepository } from "@/domain/client/ClientRepository";

export function getClientDetail(repository: ClientRepository, clientId: string) {
  if (!clientId.trim()) return Promise.reject(new Error("clientId is required"));
  return repository.getClientDetail(clientId);
}
```

Write `src/application/client/updateClient.ts`:

```ts
import type { UpdateClientInput } from "@/domain/client/Client";
import type { ClientRepository } from "@/domain/client/ClientRepository";

export function updateClient(repository: ClientRepository, input: UpdateClientInput) {
  if (!input.clientId.trim()) return Promise.reject(new Error("clientId is required"));
  return repository.updateClient(input);
}
```

Write `src/application/merchant/getMerchantList.ts`:

```ts
import type { MerchantListParams } from "@/domain/merchant/Merchant";
import type { MerchantRepository } from "@/domain/merchant/MerchantRepository";

export function getMerchantList(repository: MerchantRepository, params: MerchantListParams) {
  return repository.listMerchants(params);
}
```

Write `src/application/merchant/getMerchantDetail.ts`:

```ts
import type { MerchantRepository } from "@/domain/merchant/MerchantRepository";

export function getMerchantDetail(repository: MerchantRepository, merchantId: string) {
  if (!merchantId.trim()) return Promise.reject(new Error("merchantId is required"));
  return repository.getMerchantDetail(merchantId);
}
```

Write `src/application/plan/getPlanDetail.ts`:

```ts
import type { PlanRepository } from "@/domain/plan/PlanRepository";

export function getPlanDetail(repository: PlanRepository, clientId: string, planId: string) {
  if (!clientId.trim()) return Promise.reject(new Error("clientId is required"));
  if (!planId.trim()) return Promise.reject(new Error("planId is required"));
  return repository.getPlanDetail(clientId, planId);
}
```

Write `src/application/plan/savePlanSettings.ts`:

```ts
import type { SavePlanSettingsInput } from "@/domain/plan/Plan";
import type { PlanRepository } from "@/domain/plan/PlanRepository";

export function savePlanSettings(repository: PlanRepository, input: SavePlanSettingsInput) {
  if (!input.clientId.trim()) return Promise.reject(new Error("clientId is required"));
  return repository.savePlanSettings(input);
}
```

- [ ] **Step 4: Verify use cases**

Run:

```bash
pnpm test -- src/application
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/application
git commit -m "feat: add application use cases"
```

## Task 4: Infrastructure Repositories and DTO Mappers

**Files:**
- Create: `src/infrastructure/http/axiosClient.ts`
- Create: `src/infrastructure/http/httpError.ts`
- Create: `src/infrastructure/query/queryKeys.ts`
- Create: `src/infrastructure/mock/clientMockData.ts`
- Create: `src/infrastructure/mock/merchantMockData.ts`
- Create: `src/infrastructure/mock/planMockData.ts`
- Create: `src/infrastructure/repositories/client/clientDto.ts`
- Create: `src/infrastructure/repositories/client/clientMapper.ts`
- Create: `src/infrastructure/repositories/client/clientMapper.test.ts`
- Create: `src/infrastructure/repositories/client/clientRepository.mock.ts`
- Create: `src/infrastructure/repositories/client/clientRepository.http.ts`
- Create: `src/infrastructure/repositories/merchant/merchantDto.ts`
- Create: `src/infrastructure/repositories/merchant/merchantMapper.ts`
- Create: `src/infrastructure/repositories/merchant/merchantMapper.test.ts`
- Create: `src/infrastructure/repositories/merchant/merchantRepository.mock.ts`
- Create: `src/infrastructure/repositories/merchant/merchantRepository.http.ts`
- Create: `src/infrastructure/repositories/plan/planDto.ts`
- Create: `src/infrastructure/repositories/plan/planMapper.ts`
- Create: `src/infrastructure/repositories/plan/planMapper.test.ts`
- Create: `src/infrastructure/repositories/plan/planRepository.mock.ts`
- Create: `src/infrastructure/repositories/plan/planRepository.http.ts`

- [ ] **Step 1: Write mapper tests**

Write `src/infrastructure/repositories/client/clientMapper.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { mapClientDetailDto, mapClientSummaryDto } from "./clientMapper";

describe("clientMapper", () => {
  it("maps DTO names without adding business meaning", () => {
    expect(mapClientSummaryDto({ id: "c1", name: "客户 A", phone: "13800000000", updated_at: "2026-06-13" })).toEqual({
      id: "c1",
      name: "客户 A",
      phone: "13800000000",
      updatedAt: "2026-06-13",
    });
  });

  it("maps detail fields as a generic record", () => {
    expect(mapClientDetailDto({ id: "c1", name: "客户 A", phone: "", updated_at: "", fields: { owner: "张三" }, plan_ids: ["p1"] })).toEqual({
      id: "c1",
      name: "客户 A",
      phone: "",
      updatedAt: "",
      fields: { owner: "张三" },
      planIds: ["p1"],
    });
  });
});
```

Write `src/infrastructure/repositories/merchant/merchantMapper.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { mapMerchantDetailDto, mapMerchantSummaryDto } from "./merchantMapper";

describe("merchantMapper", () => {
  it("maps summary and detail DTOs without filtering by business state", () => {
    expect(mapMerchantSummaryDto({ id: "m1", name: "商户 A", city: "上海" })).toEqual({
      id: "m1",
      name: "商户 A",
      city: "上海",
    });
    expect(mapMerchantDetailDto({ id: "m1", name: "商户 A", city: "上海", fields: { contact: "李四" } })).toEqual({
      id: "m1",
      name: "商户 A",
      city: "上海",
      fields: { contact: "李四" },
    });
  });
});
```

Write `src/infrastructure/repositories/plan/planMapper.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { mapPlanDetailDto } from "./planMapper";

describe("planMapper", () => {
  it("maps plan DTOs and preserves rule values as data", () => {
    expect(
      mapPlanDetailDto({
        id: "p1",
        client_id: "c1",
        name: "方案 A",
        fields: { owner: "运营" },
        rules: [{ id: "r1", label: "规则 A", values: { value: "1" } }],
        updated_at: "2026-06-13",
      }),
    ).toEqual({
      id: "p1",
      clientId: "c1",
      name: "方案 A",
      fields: { owner: "运营" },
      rules: [{ id: "r1", label: "规则 A", values: { value: "1" } }],
      updatedAt: "2026-06-13",
    });
  });
});
```

- [ ] **Step 2: Run mapper tests to verify failure**

Run:

```bash
pnpm test -- src/infrastructure/repositories
```

Expected: FAIL with missing mapper modules.

- [ ] **Step 3: Add HTTP client, query keys, DTOs, and mappers**

Write `src/infrastructure/http/axiosClient.ts`:

```ts
import axios from "axios";

export const axiosClient = axios.create({
  baseURL: "/api",
  timeout: 12_000,
});
```

Write `src/infrastructure/http/httpError.ts`:

```ts
import axios from "axios";

export type HttpError = {
  message: string;
  status?: number;
};

export function toHttpError(error: unknown): HttpError {
  if (axios.isAxiosError(error)) {
    return { message: error.response?.data?.message ?? error.message, status: error.response?.status };
  }
  return error instanceof Error ? { message: error.message } : { message: "Unknown network error" };
}
```

Write `src/infrastructure/query/queryKeys.ts`:

```ts
import type { ClientListParams } from "@/domain/client/Client";
import type { MerchantListParams } from "@/domain/merchant/Merchant";

export const queryKeys = {
  clients: {
    all: ["clients"] as const,
    list: (params: ClientListParams) => ["clients", "list", params] as const,
    detail: (clientId: string) => ["clients", "detail", clientId] as const,
  },
  merchants: {
    all: ["merchants"] as const,
    list: (params: MerchantListParams) => ["merchants", "list", params] as const,
    detail: (merchantId: string) => ["merchants", "detail", merchantId] as const,
  },
  plans: {
    all: ["plans"] as const,
    detail: (clientId: string, planId: string) => ["plans", "detail", clientId, planId] as const,
  },
};
```

Write `src/infrastructure/repositories/client/clientDto.ts`:

```ts
export type ClientSummaryDto = {
  id: string;
  name: string;
  phone?: string;
  updated_at?: string;
};

export type ClientDetailDto = ClientSummaryDto & {
  fields: Record<string, string>;
  plan_ids: string[];
};
```

Write `src/infrastructure/repositories/client/clientMapper.ts`:

```ts
import type { ClientDetail, ClientSummary } from "@/domain/client/Client";

import type { ClientDetailDto, ClientSummaryDto } from "./clientDto";

export function mapClientSummaryDto(dto: ClientSummaryDto): ClientSummary {
  return { id: dto.id, name: dto.name, phone: dto.phone, updatedAt: dto.updated_at };
}

export function mapClientDetailDto(dto: ClientDetailDto): ClientDetail {
  return { ...mapClientSummaryDto(dto), fields: dto.fields, planIds: dto.plan_ids };
}
```

Write `src/infrastructure/repositories/merchant/merchantDto.ts`:

```ts
export type MerchantSummaryDto = {
  id: string;
  name: string;
  city?: string;
};

export type MerchantDetailDto = MerchantSummaryDto & {
  fields: Record<string, string>;
};
```

Write `src/infrastructure/repositories/merchant/merchantMapper.ts`:

```ts
import type { MerchantDetail, MerchantSummary } from "@/domain/merchant/Merchant";

import type { MerchantDetailDto, MerchantSummaryDto } from "./merchantDto";

export function mapMerchantSummaryDto(dto: MerchantSummaryDto): MerchantSummary {
  return { id: dto.id, name: dto.name, city: dto.city };
}

export function mapMerchantDetailDto(dto: MerchantDetailDto): MerchantDetail {
  return { ...mapMerchantSummaryDto(dto), fields: dto.fields };
}
```

Write `src/infrastructure/repositories/plan/planDto.ts`:

```ts
export type PlanRuleDto = {
  id: string;
  label: string;
  values: Record<string, string>;
};

export type PlanDetailDto = {
  id: string;
  client_id: string;
  name: string;
  fields: Record<string, string>;
  rules: PlanRuleDto[];
  updated_at?: string;
};
```

Write `src/infrastructure/repositories/plan/planMapper.ts`:

```ts
import type { PlanDetail } from "@/domain/plan/Plan";

import type { PlanDetailDto } from "./planDto";

export function mapPlanDetailDto(dto: PlanDetailDto): PlanDetail {
  return {
    id: dto.id,
    clientId: dto.client_id,
    name: dto.name,
    fields: dto.fields,
    rules: dto.rules,
    updatedAt: dto.updated_at,
  };
}
```

- [ ] **Step 4: Add mock data and repositories**

Write mock data with neutral records:

```ts
// src/infrastructure/mock/clientMockData.ts
import type { ClientDetailDto } from "@/infrastructure/repositories/client/clientDto";

export const clientMockData: ClientDetailDto[] = [
  { id: "c1", name: "客户 A", phone: "13800000000", updated_at: "2026-06-13", fields: { owner: "负责人 A" }, plan_ids: ["p1"] },
  { id: "c2", name: "客户 B", phone: "13900000000", updated_at: "2026-06-12", fields: { owner: "负责人 B" }, plan_ids: ["p2"] },
];
```

```ts
// src/infrastructure/mock/merchantMockData.ts
import type { MerchantDetailDto } from "@/infrastructure/repositories/merchant/merchantDto";

export const merchantMockData: MerchantDetailDto[] = [
  { id: "m1", name: "商户 A", city: "上海", fields: { contact: "联系人 A" } },
  { id: "m2", name: "商户 B", city: "杭州", fields: { contact: "联系人 B" } },
];
```

```ts
// src/infrastructure/mock/planMockData.ts
import type { PlanDetailDto } from "@/infrastructure/repositories/plan/planDto";

export const planMockData: PlanDetailDto[] = [
  { id: "p1", client_id: "c1", name: "方案 A", fields: { owner: "运营 A" }, rules: [{ id: "r1", label: "规则 A", values: {} }], updated_at: "2026-06-13" },
  { id: "p2", client_id: "c2", name: "方案 B", fields: { owner: "运营 B" }, rules: [{ id: "r2", label: "规则 B", values: {} }], updated_at: "2026-06-12" },
];
```

Write mock repositories that filter only by keyword text and do not apply business state decisions:

```ts
// src/infrastructure/repositories/client/clientRepository.mock.ts
import type { ClientRepository } from "@/domain/client/ClientRepository";
import { clientMockData } from "@/infrastructure/mock/clientMockData";

import { mapClientDetailDto, mapClientSummaryDto } from "./clientMapper";

export const clientRepositoryMock: ClientRepository = {
  async listClients(params) {
    return clientMockData
      .map(mapClientSummaryDto)
      .filter((client) => !params.keyword || client.name.includes(params.keyword) || client.phone?.includes(params.keyword));
  },
  async getClientDetail(clientId) {
    const client = clientMockData.find((item) => item.id === clientId);
    if (!client) throw new Error("Client not found");
    return mapClientDetailDto(client);
  },
  async updateClient(input) {
    const client = clientMockData.find((item) => item.id === input.clientId);
    if (!client) throw new Error("Client not found");
    client.fields = input.values;
    client.name = input.values.name ?? client.name;
    return mapClientDetailDto(client);
  },
};
```

```ts
// src/infrastructure/repositories/merchant/merchantRepository.mock.ts
import type { MerchantRepository } from "@/domain/merchant/MerchantRepository";
import { merchantMockData } from "@/infrastructure/mock/merchantMockData";

import { mapMerchantDetailDto, mapMerchantSummaryDto } from "./merchantMapper";

export const merchantRepositoryMock: MerchantRepository = {
  async listMerchants(params) {
    return merchantMockData
      .map(mapMerchantSummaryDto)
      .filter((merchant) => !params.keyword || merchant.name.includes(params.keyword) || merchant.city?.includes(params.keyword));
  },
  async getMerchantDetail(merchantId) {
    const merchant = merchantMockData.find((item) => item.id === merchantId);
    if (!merchant) throw new Error("Merchant not found");
    return mapMerchantDetailDto(merchant);
  },
};
```

```ts
// src/infrastructure/repositories/plan/planRepository.mock.ts
import type { PlanRepository } from "@/domain/plan/PlanRepository";
import { planMockData } from "@/infrastructure/mock/planMockData";

import { mapPlanDetailDto } from "./planMapper";

export const planRepositoryMock: PlanRepository = {
  async getPlanDetail(clientId, planId) {
    const plan = planMockData.find((item) => item.client_id === clientId && item.id === planId);
    if (!plan) throw new Error("Plan not found");
    return mapPlanDetailDto(plan);
  },
  async savePlanSettings(input) {
    const next = {
      id: input.planId ?? `p${planMockData.length + 1}`,
      client_id: input.clientId,
      name: input.name,
      fields: input.fields,
      rules: input.rules,
      updated_at: new Date().toISOString(),
    };
    const index = planMockData.findIndex((item) => item.id === next.id);
    if (index >= 0) planMockData[index] = next;
    else planMockData.push(next);
    return mapPlanDetailDto(next);
  },
};
```

- [ ] **Step 5: Add HTTP repositories**

Write `src/infrastructure/repositories/client/clientRepository.http.ts`:

```ts
import type { ClientRepository } from "@/domain/client/ClientRepository";
import { axiosClient } from "@/infrastructure/http/axiosClient";

import type { ClientDetailDto, ClientSummaryDto } from "./clientDto";
import { mapClientDetailDto, mapClientSummaryDto } from "./clientMapper";

export const clientRepositoryHttp: ClientRepository = {
  async listClients(params) {
    const response = await axiosClient.get<ClientSummaryDto[]>("/clients", { params });
    return response.data.map(mapClientSummaryDto);
  },
  async getClientDetail(clientId) {
    const response = await axiosClient.get<ClientDetailDto>(`/clients/${clientId}`);
    return mapClientDetailDto(response.data);
  },
  async updateClient(input) {
    const response = await axiosClient.patch<ClientDetailDto>(`/clients/${input.clientId}`, input);
    return mapClientDetailDto(response.data);
  },
};
```

Write `src/infrastructure/repositories/merchant/merchantRepository.http.ts`:

```ts
import type { MerchantRepository } from "@/domain/merchant/MerchantRepository";
import { axiosClient } from "@/infrastructure/http/axiosClient";

import type { MerchantDetailDto, MerchantSummaryDto } from "./merchantDto";
import { mapMerchantDetailDto, mapMerchantSummaryDto } from "./merchantMapper";

export const merchantRepositoryHttp: MerchantRepository = {
  async listMerchants(params) {
    const response = await axiosClient.get<MerchantSummaryDto[]>("/merchants", { params });
    return response.data.map(mapMerchantSummaryDto);
  },
  async getMerchantDetail(merchantId) {
    const response = await axiosClient.get<MerchantDetailDto>(`/merchants/${merchantId}`);
    return mapMerchantDetailDto(response.data);
  },
};
```

Write `src/infrastructure/repositories/plan/planRepository.http.ts`:

```ts
import type { PlanRepository } from "@/domain/plan/PlanRepository";
import { axiosClient } from "@/infrastructure/http/axiosClient";

import type { PlanDetailDto } from "./planDto";
import { mapPlanDetailDto } from "./planMapper";

export const planRepositoryHttp: PlanRepository = {
  async getPlanDetail(clientId, planId) {
    const response = await axiosClient.get<PlanDetailDto>(`/clients/${clientId}/plans/${planId}`);
    return mapPlanDetailDto(response.data);
  },
  async savePlanSettings(input) {
    const response = await axiosClient.post<PlanDetailDto>(`/clients/${input.clientId}/plans`, input);
    return mapPlanDetailDto(response.data);
  },
};
```

- [ ] **Step 6: Verify infrastructure**

Run:

```bash
pnpm test -- src/infrastructure/repositories
pnpm lint
```

Expected: mapper tests PASS and TypeScript exits `0`.

- [ ] **Step 7: Commit**

```bash
git add src/infrastructure
git commit -m "feat: add infrastructure repositories"
```

## Task 5: Bootstrap, Providers, and Routes

**Files:**
- Create: `src/app/bootstrap/queryClient.ts`
- Create: `src/app/bootstrap/repositories.ts`
- Create: `src/app/bootstrap/useCases.ts`
- Create: `src/app/providers/AppProviders.tsx`
- Create: `src/app/router/routeMeta.ts`
- Create: `src/app/router/routeMeta.test.ts`
- Create: `src/app/router/routeTree.tsx`
- Create: `src/app/router/router.ts`
- Modify: `src/App.tsx`
- Create: `src/pages/client/ClientListRoute.tsx`
- Create: `src/pages/client/ClientDetailRoute.tsx`
- Create: `src/pages/plan/PlanSettingsRoute.tsx`
- Create: `src/pages/plan/PlanDetailRoute.tsx`
- Create: `src/pages/merchant/MerchantListRoute.tsx`
- Create: `src/pages/merchant/MerchantDetailRoute.tsx`

- [ ] **Step 1: Write route metadata test**

Write `src/app/router/routeMeta.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { routeMeta } from "./routeMeta";

describe("routeMeta", () => {
  it("defines metadata for every route in the spec", () => {
    expect(Object.keys(routeMeta).sort()).toEqual([
      "/client",
      "/client/$clientId",
      "/client/$clientId/plans/$planId",
      "/client/$clientId/plans/settings",
      "/merchant",
      "/merchant/$merchantId",
    ]);
  });
});
```

- [ ] **Step 2: Run metadata test to verify failure**

Run:

```bash
pnpm test -- src/app/router/routeMeta.test.ts
```

Expected: FAIL because `routeMeta.ts` does not exist.

- [ ] **Step 3: Add bootstrap and route metadata**

Write `src/app/bootstrap/queryClient.ts`:

```ts
import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });
}
```

Write `src/app/bootstrap/repositories.ts`:

```ts
import { clientRepositoryMock } from "@/infrastructure/repositories/client/clientRepository.mock";
import { merchantRepositoryMock } from "@/infrastructure/repositories/merchant/merchantRepository.mock";
import { planRepositoryMock } from "@/infrastructure/repositories/plan/planRepository.mock";

export const repositories = {
  clientRepository: clientRepositoryMock,
  merchantRepository: merchantRepositoryMock,
  planRepository: planRepositoryMock,
};
```

Write `src/app/bootstrap/useCases.ts`:

```ts
import { getClientDetail } from "@/application/client/getClientDetail";
import { getClientList } from "@/application/client/getClientList";
import { updateClient } from "@/application/client/updateClient";
import { getMerchantDetail } from "@/application/merchant/getMerchantDetail";
import { getMerchantList } from "@/application/merchant/getMerchantList";
import { getPlanDetail } from "@/application/plan/getPlanDetail";
import { savePlanSettings } from "@/application/plan/savePlanSettings";

import { repositories } from "./repositories";

export const useCases = {
  getClientList: (params: Parameters<typeof getClientList>[1]) => getClientList(repositories.clientRepository, params),
  getClientDetail: (clientId: string) => getClientDetail(repositories.clientRepository, clientId),
  updateClient: (input: Parameters<typeof updateClient>[1]) => updateClient(repositories.clientRepository, input),
  getMerchantList: (params: Parameters<typeof getMerchantList>[1]) => getMerchantList(repositories.merchantRepository, params),
  getMerchantDetail: (merchantId: string) => getMerchantDetail(repositories.merchantRepository, merchantId),
  getPlanDetail: (clientId: string, planId: string) => getPlanDetail(repositories.planRepository, clientId, planId),
  savePlanSettings: (input: Parameters<typeof savePlanSettings>[1]) => savePlanSettings(repositories.planRepository, input),
};
```

Write `src/app/router/routeMeta.ts`:

```ts
export type RouteMeta = {
  title: string;
  module: "client" | "plan" | "merchant";
  keepAlive?: boolean;
};

export const routeMeta = {
  "/client": { title: "客户列表", module: "client", keepAlive: true },
  "/client/$clientId": { title: "客户详情", module: "client" },
  "/client/$clientId/plans/settings": { title: "方案设置", module: "plan" },
  "/client/$clientId/plans/$planId": { title: "方案详情", module: "plan" },
  "/merchant": { title: "商户列表", module: "merchant", keepAlive: true },
  "/merchant/$merchantId": { title: "商户详情", module: "merchant" },
} satisfies Record<string, RouteMeta>;
```

- [ ] **Step 4: Add providers, route tree, and temporary route components**

Write temporary page route components:

```tsx
// src/pages/client/ClientListRoute.tsx
export function ClientListRoute() {
  return <div>客户列表</div>;
}
```

```tsx
// src/pages/client/ClientDetailRoute.tsx
export function ClientDetailRoute() {
  return <div>客户详情</div>;
}
```

```tsx
// src/pages/plan/PlanSettingsRoute.tsx
export function PlanSettingsRoute() {
  return <div>方案设置</div>;
}
```

```tsx
// src/pages/plan/PlanDetailRoute.tsx
export function PlanDetailRoute() {
  return <div>方案详情</div>;
}
```

```tsx
// src/pages/merchant/MerchantListRoute.tsx
export function MerchantListRoute() {
  return <div>商户列表</div>;
}
```

```tsx
// src/pages/merchant/MerchantDetailRoute.tsx
export function MerchantDetailRoute() {
  return <div>商户详情</div>;
}
```

Write `src/app/router/routeTree.tsx`:

```tsx
import { createRootRoute, createRoute, Navigate, Outlet } from "@tanstack/react-router";

import { ClientDetailRoute } from "@/pages/client/ClientDetailRoute";
import { ClientListRoute } from "@/pages/client/ClientListRoute";
import { MerchantDetailRoute } from "@/pages/merchant/MerchantDetailRoute";
import { MerchantListRoute } from "@/pages/merchant/MerchantListRoute";
import { PlanDetailRoute } from "@/pages/plan/PlanDetailRoute";
import { PlanSettingsRoute } from "@/pages/plan/PlanSettingsRoute";

const rootRoute = createRootRoute({ component: () => <Outlet /> });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: () => <Navigate to="/client" /> });
const clientListRoute = createRoute({ getParentRoute: () => rootRoute, path: "/client", component: ClientListRoute });
const clientDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: "/client/$clientId", component: ClientDetailRoute });
const planSettingsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/client/$clientId/plans/settings", component: PlanSettingsRoute });
const planDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: "/client/$clientId/plans/$planId", component: PlanDetailRoute });
const merchantListRoute = createRoute({ getParentRoute: () => rootRoute, path: "/merchant", component: MerchantListRoute });
const merchantDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: "/merchant/$merchantId", component: MerchantDetailRoute });

export const routeTree = rootRoute.addChildren([
  indexRoute,
  clientListRoute,
  clientDetailRoute,
  planSettingsRoute,
  planDetailRoute,
  merchantListRoute,
  merchantDetailRoute,
]);
```

Write `src/app/router/router.ts`:

```ts
import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree";

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
```

Write `src/app/providers/AppProviders.tsx`:

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useMemo } from "react";

import { createQueryClient } from "@/app/bootstrap/queryClient";
import { router } from "@/app/router/router";

export function AppProviders() {
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

Replace `src/App.tsx`:

```tsx
import { AppProviders } from "@/app/providers/AppProviders";

export function App() {
  return <AppProviders />;
}
```

- [ ] **Step 5: Verify routes**

Run:

```bash
pnpm test -- src/app/router/routeMeta.test.ts
pnpm build
```

Expected: metadata test PASS and build exits `0`.

- [ ] **Step 6: Commit**

```bash
git add src/app src/pages src/App.tsx
git commit -m "feat: add router and providers"
```

## Task 6: Shared UI Primitives

**Files:**
- Create: `src/shared/utils/cn.ts`
- Create: `src/shared/ui/Page/Page.tsx`
- Create: `src/shared/ui/Page/Page.test.tsx`
- Create: `src/shared/ui/Page/index.ts`
- Create: `src/shared/ui/Form/Button.tsx`
- Create: `src/shared/ui/Form/Field.tsx`
- Create: `src/shared/ui/Form/index.ts`
- Create: `src/shared/ui/Feedback/EmptyState.tsx`
- Create: `src/shared/ui/Feedback/ErrorState.tsx`
- Create: `src/shared/ui/Feedback/LoadingState.tsx`
- Create: `src/shared/ui/Feedback/ConfirmDialog.tsx`
- Create: `src/shared/ui/Feedback/index.ts`
- Create: `src/shared/ui/DataDisplay/InfoRow.tsx`
- Create: `src/shared/ui/DataDisplay/index.ts`

- [ ] **Step 1: Write shared UI test**

Write `src/shared/ui/Page/Page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Page } from "./Page";

describe("Page", () => {
  it("renders a mobile H5 page title and content", () => {
    render(<Page title="客户列表">内容</Page>);
    expect(screen.getByRole("heading", { name: "客户列表" })).toBeInTheDocument();
    expect(screen.getByText("内容")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run shared UI test to verify failure**

Run:

```bash
pnpm test -- src/shared/ui/Page/Page.test.tsx
```

Expected: FAIL because `Page.tsx` does not exist.

- [ ] **Step 3: Implement shared UI**

Write `cn`, `Page`, `Button`, `Field`, `EmptyState`, `ErrorState`, `LoadingState`, `ConfirmDialog`, and `InfoRow` as generic components. They must not mention client, merchant, plan, status meanings, or rule meanings.

Use this `Page` implementation:

```tsx
import type { ReactNode } from "react";

export function Page({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-surface text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-white px-4 py-3">
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>
      <section className="flex-1 px-4 py-4">{children}</section>
      {footer ? <footer className="sticky bottom-0 border-t border-line bg-white p-3">{footer}</footer> : null}
    </main>
  );
}
```

Use this `Button` implementation:

```tsx
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium disabled:opacity-50",
        variant === "primary" && "bg-brand text-white",
        variant === "secondary" && "border border-line bg-white text-ink",
        variant === "ghost" && "bg-transparent text-ink",
        variant === "danger" && "bg-danger text-white",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Verify shared UI**

Run:

```bash
pnpm test -- src/shared/ui/Page/Page.test.tsx
pnpm build
```

Expected: shared UI test PASS and build exits `0`.

- [ ] **Step 5: Commit**

```bash
git add src/shared
git commit -m "feat: add shared h5 ui"
```

## Task 7: Feature Query Hooks and Route Views

**Files:**
- Create: `src/features/client/store/clientListStore.ts`
- Create: `src/features/client/store/clientDetailUiStore.ts`
- Create: `src/features/client/queries/useClientListQuery.ts`
- Create: `src/features/client/queries/useClientDetailQuery.ts`
- Create: `src/features/client/mutations/useUpdateClientMutation.ts`
- Create: `src/features/client/views/ClientListView.tsx`
- Create: `src/features/client/views/ClientDetailView.tsx`
- Create: `src/features/client/views/ClientDetailView.test.tsx`
- Create: `src/features/merchant/store/merchantListStore.ts`
- Create: `src/features/merchant/queries/useMerchantListQuery.ts`
- Create: `src/features/merchant/queries/useMerchantDetailQuery.ts`
- Create: `src/features/merchant/views/MerchantListView.tsx`
- Create: `src/features/merchant/views/MerchantDetailView.tsx`
- Create: `src/features/plan/store/planDraftStore.ts`
- Create: `src/features/plan/queries/usePlanDetailQuery.ts`
- Create: `src/features/plan/mutations/useSavePlanSettingsMutation.ts`
- Create: `src/features/plan/views/PlanDetailView.tsx`
- Create: `src/features/plan/views/PlanSettingsView.tsx`
- Modify: `src/pages/client/*`
- Modify: `src/pages/merchant/*`
- Modify: `src/pages/plan/*`

- [ ] **Step 1: Write client edit state test**

Write `src/features/client/views/ClientDetailView.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ClientDetailView } from "./ClientDetailView";

function renderWithQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("ClientDetailView", () => {
  it("keeps edit mode as internal page state, not a route", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ClientDetailView clientId="c1" />);

    expect(await screen.findByText("客户 A")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "编辑" }));
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "保存" })).not.toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run feature test to verify failure**

Run:

```bash
pnpm test -- src/features/client/views/ClientDetailView.test.tsx
```

Expected: FAIL because feature files do not exist.

- [ ] **Step 3: Implement stores, query hooks, and mutation hooks**

Create Zustand stores for list keyword state, client detail edit mode, unsaved-change flag, confirm dialog visibility, and plan save message. Create query hooks that call `useCases` and use `queryKeys`. Create mutations that call use cases and invalidate related query keys. Do not add status filtering, risk logic, plan publishing logic, or merchant visibility logic.

Use this client detail store:

```ts
import { create } from "zustand";

type ClientDetailUiState = {
  mode: "readonly" | "editing";
  isDirty: boolean;
  confirmDiscardOpen: boolean;
  enterEdit: () => void;
  exitEdit: () => void;
  setDirty: (isDirty: boolean) => void;
  requestCancel: () => void;
  closeConfirm: () => void;
};

export const useClientDetailUiStore = create<ClientDetailUiState>((set, get) => ({
  mode: "readonly",
  isDirty: false,
  confirmDiscardOpen: false,
  enterEdit: () => set({ mode: "editing", isDirty: false, confirmDiscardOpen: false }),
  exitEdit: () => set({ mode: "readonly", isDirty: false, confirmDiscardOpen: false }),
  setDirty: (isDirty) => set({ isDirty }),
  requestCancel: () => {
    if (get().isDirty) set({ confirmDiscardOpen: true });
    else get().exitEdit();
  },
  closeConfirm: () => set({ confirmDiscardOpen: false }),
}));
```

- [ ] **Step 4: Implement views and route wrappers**

Implement list views with `Page`, keyword input, loading/error/empty states, and item links. Implement detail views with `Page`, data rows from `fields`, loading/error states, and no invented business status labels. Implement `ClientDetailView` with readonly/editing modes, save/cancel action bar, and dirty-cancel confirmation. Implement `PlanSettingsView` with React Hook Form and Zod only for structural requirements: `name` is a string and `fields` is a record.

Update route wrappers to read params with TanStack Router and pass them into feature views. Do not add `/client/$clientId/edit`.

- [ ] **Step 5: Verify feature views**

Run:

```bash
pnpm test -- src/features/client/views/ClientDetailView.test.tsx
pnpm build
```

Expected: client edit state test PASS and build exits `0`.

- [ ] **Step 6: Commit**

```bash
git add src/features src/pages
git commit -m "feat: add feature route views"
```

## Task 8: Setting Rule Capability Boundary

**Files:**
- Create: `src/features/setting-rule/types.ts`
- Create: `src/features/setting-rule/schema/settingRuleSchema.ts`
- Create: `src/features/setting-rule/schema/settingRuleSchema.test.ts`
- Create: `src/features/setting-rule/hooks/useSettingRuleForm.ts`
- Create: `src/features/setting-rule/components/SettingRuleEditor.tsx`
- Create: `src/features/setting-rule/components/SettingRulePreview.tsx`

- [ ] **Step 1: Write boundary test**

Write `src/features/setting-rule/schema/settingRuleSchema.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { settingRuleSchema } from "./settingRuleSchema";

describe("settingRuleSchema", () => {
  it("accepts rule fragments as data without deciding save ownership", () => {
    expect(
      settingRuleSchema.parse({
        rules: [{ id: "r1", label: "规则 A", values: { key: "value" } }],
      }),
    ).toEqual({
      rules: [{ id: "r1", label: "规则 A", values: { key: "value" } }],
    });
  });
});
```

- [ ] **Step 2: Run boundary test to verify failure**

Run:

```bash
pnpm test -- src/features/setting-rule/schema/settingRuleSchema.test.ts
```

Expected: FAIL because setting-rule files do not exist.

- [ ] **Step 3: Implement setting-rule capability**

Write `src/features/setting-rule/types.ts`:

```ts
import type { PlanRule } from "@/domain/plan/Plan";

export type SettingRuleFormValues = {
  rules: PlanRule[];
};
```

Write `src/features/setting-rule/schema/settingRuleSchema.ts`:

```ts
import { z } from "zod";

export const settingRuleSchema = z.object({
  rules: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      values: z.record(z.string()),
    }),
  ),
});
```

Write `useSettingRuleForm.ts`, `SettingRuleEditor.tsx`, and `SettingRulePreview.tsx` so they accept values and callbacks through props. They may import `shared/ui`, `shared/hooks`, and pure `domain` types. They must not import `pages`, `features/client`, or `features/plan`.

- [ ] **Step 4: Verify boundary**

Run:

```bash
pnpm test -- src/features/setting-rule/schema/settingRuleSchema.test.ts
pnpm build
```

Expected: setting-rule test PASS and build exits `0`.

- [ ] **Step 5: Commit**

```bash
git add src/features/setting-rule
git commit -m "feat: add setting rule capability boundary"
```

## Task 9: MSW Integration and Final Verification

**Files:**
- Create: `src/test/msw/handlers.ts`
- Create: `src/test/msw/server.ts`
- Modify: `src/test/setup.ts`
- Create: `src/infrastructure/repositories/client/clientRepository.http.test.ts`
- Create: `src/features/client/queries/useClientListQuery.test.tsx`

- [ ] **Step 1: Write integration tests**

Write `src/infrastructure/repositories/client/clientRepository.http.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { clientRepositoryHttp } from "./clientRepository.http";

describe("clientRepositoryHttp", () => {
  it("maps HTTP list responses through the repository", async () => {
    await expect(clientRepositoryHttp.listClients({ keyword: "HTTP" })).resolves.toEqual([
      expect.objectContaining({ id: "c-http-1", name: "HTTP 客户" }),
    ]);
  });
});
```

Write `src/features/client/queries/useClientListQuery.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useClientListQuery } from "./useClientListQuery";

describe("useClientListQuery", () => {
  it("returns repository data through the feature query hook", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useClientListQuery({ keyword: "客户" }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]).toEqual(expect.objectContaining({ id: "c1" }));
  });
});
```

- [ ] **Step 2: Run integration tests to verify failure**

Run:

```bash
pnpm test -- src/infrastructure/repositories/client/clientRepository.http.test.ts src/features/client/queries/useClientListQuery.test.tsx
```

Expected: HTTP repository test FAIL because MSW server is not configured.

- [ ] **Step 3: Add MSW server**

Write `src/test/msw/handlers.ts`:

```ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/clients", () =>
    HttpResponse.json([{ id: "c-http-1", name: "HTTP 客户", phone: "13800000000", updated_at: "2026-06-13" }]),
  ),
];
```

Write `src/test/msw/server.ts`:

```ts
import { setupServer } from "msw/node";

import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

Replace `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./msw/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

- [ ] **Step 4: Run final verification**

Run:

```bash
pnpm test
pnpm build
pnpm lint
```

Expected: all commands exit `0`.

- [ ] **Step 5: Manual route smoke check**

Run:

```bash
pnpm dev
```

Expected: Vite prints a local URL. Open `/client`, `/client/c1`, `/merchant`, `/merchant/m1`, `/client/c1/plans/settings`, and `/client/c1/plans/p1`. Confirm each route renders an H5 page, list/detail data loads, client edit mode is page-local, and no `/client/$clientId/edit` route exists.

- [ ] **Step 6: Commit**

```bash
git add src/test src/infrastructure/repositories/client/clientRepository.http.test.ts src/features/client/queries/useClientListQuery.test.tsx
git commit -m "test: add integration coverage"
```

## Self-Review

- Spec coverage: The revised plan covers the H5-only scope, all six routes, route metadata, page-to-feature mapping, Clean Architecture dependency direction, repository/mock strategy, DTO mappers, TanStack Query ownership, Zustand local UI state, React Hook Form/Zod form boundary, shared UI boundary, setting-rule capability boundary, and the specified highest-risk flows.
- Business-rule discipline: The plan does not define client status semantics, merchant filtering rules, risk scoring, plan publish conditions, budget calculations, reward thresholds, or domain-specific validation not present in the spec. Mock records and labels are only UI smoke data.
- Red-flag scan: The plan avoids deferred implementation markers, undefined future function names, and broad instructions to add unspecified error handling or unspecified validation.
- Type consistency: Domain types are introduced before use cases, repositories, hooks, and views. Query key names, route params, repository method names, and use case names match across tasks.
