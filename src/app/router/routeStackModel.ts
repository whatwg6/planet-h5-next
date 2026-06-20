import type { ReactNode, RefObject } from "react";

export type RouteStackParams = Record<string, string>;

export type RouteStackPageProps = {
  routeParams?: RouteStackParams;
};

export type RouteStackNavigationType = "PUSH" | "REPLACE" | "FORWARD" | "BACK" | "GO";

export type RouteStackNavigationAction =
  | {
      type: Exclude<RouteStackNavigationType, "GO">;
    }
  | {
      type: "GO";
      index: number;
    };

export type RouteStackTransitionDirection = "forward" | "back" | "replace";

export type RouteStackEntry = {
  id: string;
  pathname: string;
  historyIndex?: number;
  element: ReactNode;
  nodeRef: RefObject<HTMLDivElement | null>;
};

export const routeStackTransitionDurationMs = 300;

export function getRouteStackTransitionDirection(
  navigationAction: RouteStackNavigationAction,
): RouteStackTransitionDirection {
  switch (navigationAction.type) {
    case "PUSH":
    case "FORWARD":
      return "forward";
    case "BACK":
      return "back";
    case "GO":
      return navigationAction.index > 0 ? "forward" : "back";
    case "REPLACE":
      return "replace";
  }
}

export function getRouteStackTransitionDirectionFromEntries(
  entries: RouteStackEntry[],
  activeEntryId: string,
  navigationAction: RouteStackNavigationAction,
): RouteStackTransitionDirection {
  const activeIndex = entries.findIndex((entry) => entry.id === activeEntryId);

  if (activeIndex !== -1 && activeIndex < entries.length - 1) {
    return "back";
  }

  return getRouteStackTransitionDirection(navigationAction);
}

export function getNextRouteStackEntries(
  entries: RouteStackEntry[],
  currentEntry: RouteStackEntry,
  navigationAction: RouteStackNavigationAction,
) {
  const transitionDirection = getRouteStackTransitionDirectionFromEntries(entries, currentEntry.id, navigationAction);

  switch (transitionDirection) {
    case "back": {
      const currentIndex = entries.findIndex((entry) => entry.id === currentEntry.id);

      if (currentIndex === -1) {
        if (entries.length > 1) {
          return [...entries, currentEntry];
        }

        return [currentEntry];
      }

      if (currentIndex === entries.length - 1) {
        return entries;
      }

      return entries.slice(0, currentIndex + 1);
    }

    case "forward": {
      if (entries.some((entry) => entry.id === currentEntry.id)) {
        return entries;
      }

      return [...entries, currentEntry];
    }

    case "replace": {
      const replaceIndex = entries.findIndex((entry) => entry.pathname === currentEntry.pathname);

      if (replaceIndex !== -1) {
        return [...entries.slice(0, replaceIndex), currentEntry];
      }

      return [...entries.slice(0, -1), currentEntry];
    }
  }
}

export function getRouteStackCurrentEntry(entries: RouteStackEntry[], currentEntry: RouteStackEntry | null) {
  if (!currentEntry) {
    return null;
  }

  return (
    entries.find((entry) => entry.id === currentEntry.id) ??
    entries.find((entry) => currentEntry.historyIndex !== undefined && entry.historyIndex === currentEntry.historyIndex) ??
    currentEntry
  );
}
