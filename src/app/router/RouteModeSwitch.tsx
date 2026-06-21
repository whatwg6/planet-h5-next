import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { getRouteMode } from "@/app/router/historyState";

export function useRouteMode(fallback?: string) {
  return useRouterState({ select: (state) => getRouteMode(state.location.state, fallback) });
}

export function RouteModeSwitch<TMode extends string>({
  fallback,
  modes = {},
}: {
  fallback: ReactNode;
  modes?: Partial<Record<TMode, ReactNode>>;
}) {
  const mode = useRouteMode();

  return <>{modes[mode as TMode] ?? fallback}</>;
}
