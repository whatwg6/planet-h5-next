import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useClientOrderDetailQuery } from "./useClientOrderDetailQuery";

describe("useClientOrderDetailQuery", () => {
  it("returns mock order detail through the feature query hook", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useClientOrderDetailQuery("c1", "p1", {
          raw: "CO20260621001-t1781971200000",
          orderNo: "CO20260621001",
          time: 1781971200000,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expect.objectContaining({ id: "o1", productCount: 8 }));
  });
});
