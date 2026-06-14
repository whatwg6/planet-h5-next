export type ClientDetailRouteMode = "readonly" | "editing";

export const clientDetailEditingState = { clientDetailMode: "editing" } as const;

export function getClientDetailRouteMode(state: unknown): ClientDetailRouteMode {
  if (typeof state === "object" && state !== null && "clientDetailMode" in state) {
    return state.clientDetailMode === "editing" ? "editing" : "readonly";
  }

  return "readonly";
}
