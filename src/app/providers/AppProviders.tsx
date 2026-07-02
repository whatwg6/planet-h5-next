import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useMemo } from "react";

import { createQueryClient } from "@/app/bootstrap/queryClient";
import { createAppRouter } from "@/app/router/router";

export function AppProviders() {
  const queryClient = useMemo(() => createQueryClient(), []);
  const router = useMemo(() => createAppRouter({ queryClient }), [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
