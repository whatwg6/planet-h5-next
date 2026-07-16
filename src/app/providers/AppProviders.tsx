import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

import { installObservability } from "@/app/bootstrap/observability";
import { createQueryClient } from "@/app/bootstrap/queryClient";
import { createAppRouter } from "@/app/router/router";

export function AppProviders() {
  const queryClient = useMemo(() => createQueryClient(), []);
  const router = useMemo(() => createAppRouter({ queryClient }), [queryClient]);

  useEffect(() => {
    installObservability(router);
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
