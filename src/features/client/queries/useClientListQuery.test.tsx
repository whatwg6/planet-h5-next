import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import type { ClientListParams } from "@/domain/client/Client";
import { queryKeys } from "@/infrastructure/query/queryKeys";

import { useClientListQuery } from "./useClientListQuery";

describe("useClientListQuery", () => {
  it("returns repository data through the feature query hook", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useClientListQuery({ keyword: "客户" }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]).toEqual(
      expect.objectContaining({ id: "c1", isDeveloperTest: true }),
    );
  });

  it("keys the query by normalized committed params only", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const committedParams = {
      keyword: " 客户 A ",
      draftKeyword: "客户 B",
    } as ClientListParams & { draftKeyword: string };

    const { result } = renderHook(() => useClientListQuery(committedParams), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(queryKeys.clients.list({ keyword: "客户 A" }))).toEqual(
      result.current.data,
    );
    expect(
      queryClient.getQueryData([
        "clients",
        "list",
        { keyword: " 客户 A ", draftKeyword: "客户 B" },
      ]),
    ).toBeUndefined();
  });
});
