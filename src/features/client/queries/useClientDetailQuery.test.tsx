import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { queryKeys } from "@/infrastructure/query/queryKeys";

import { useClientDetailQuery } from "./useClientDetailQuery";

function createWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useClientDetailQuery", () => {
  it("returns deterministic client detail through the feature query hook", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useClientDetailQuery("c1"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(
      expect.objectContaining({
        id: "c1",
        name: "客户 A",
        isDeveloperTest: true,
      }),
    );
    expect(result.current.data?.mealPlans[0]).toEqual(
      expect.objectContaining({ id: "p1", name: "方案 A" }),
    );
  });

  it("keys the query by client id", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useClientDetailQuery("c2"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(queryKeys.clients.detail("c2"))).toEqual(result.current.data);
    expect(queryClient.getQueryData(queryKeys.clients.detail("c1"))).toBeUndefined();
  });
});
