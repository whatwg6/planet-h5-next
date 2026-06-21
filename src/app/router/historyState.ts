export type RouteMode = string;

export const defaultRouteMode = "read";

export function routeModeState<TMode extends RouteMode>(mode: TMode) {
  return { routeMode: mode } as const;
}

export function getRouteMode(state: unknown, fallback: RouteMode = defaultRouteMode): RouteMode {
  if (
    typeof state === "object" &&
    state !== null &&
    "routeMode" in state &&
    typeof state.routeMode === "string"
  ) {
    return state.routeMode;
  }

  return fallback;
}
