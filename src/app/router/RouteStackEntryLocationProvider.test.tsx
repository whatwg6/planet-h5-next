import { RouterContextProvider, useLocation, useRouter, useRouterState } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RouteStackEntryLocationProvider } from "./RouteStackEntryLocationProvider";

function createStore(state: unknown) {
  return {
    get: () => state,
    subscribe: () => ({ unsubscribe: vi.fn() }),
  };
}

function Probe() {
  const router = useRouter();
  const location = useLocation();
  const routerStatus = useRouterState({ select: (state) => state.status });
  const mode = useRouterState({
    select: (state) => (state.location.state as { routeMode?: string }).routeMode ?? "read",
  });

  return (
    <button onClick={() => router.navigate({ to: "/client" })}>
      {mode}:{location.pathname}:{routerStatus}
    </button>
  );
}

describe("RouteStackEntryLocationProvider", () => {
  it("caches location for a stack entry while delegating router actions and other state", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const router = {
      navigate,
      options: {},
      stores: {
        __store: createStore({
          location: {
            pathname: "/client/c1",
            state: { routeMode: "edit" },
          },
          status: "idle",
        }),
        location: createStore({
          pathname: "/client/c1",
          state: { routeMode: "edit" },
        }),
      },
    };

    render(
      <RouterContextProvider router={router as never}>
        <RouteStackEntryLocationProvider location={{ pathname: "/client/c1", state: {} }}>
          <Probe />
        </RouteStackEntryLocationProvider>
      </RouterContextProvider>,
    );

    const button = screen.getByRole("button", { name: "read:/client/c1:idle" });
    await user.click(button);

    expect(navigate).toHaveBeenCalledWith({ to: "/client" });
  });
});
