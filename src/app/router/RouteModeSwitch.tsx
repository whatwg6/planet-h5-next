import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { getRouteMode } from "@/app/router/historyState";

export function useRouteMode(defaultMode?: string) {
  return useRouterState({ select: (state) => getRouteMode(state.location.state, defaultMode) });
}

export function RouteModeSwitch<TMode extends string>({
  defaultPage,
  modes = {},
}: {
  defaultPage: ReactNode;
  modes?: Partial<Record<TMode, ReactNode>>;
}) {
  const mode = useRouteMode();

  return <>{modes[mode as TMode] ?? defaultPage}</>;
}
