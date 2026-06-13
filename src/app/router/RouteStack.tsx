import { Navigate, useRouter, useRouterState } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

export type RouteStackParams = Record<string, string>;

export type RouteStackPageProps = {
  routeParams?: RouteStackParams;
};

export type RouteStackNavigationType = "PUSH" | "POP" | "REPLACE";

export type RouteStackEntry = {
  id: string;
  pathname: string;
  element: ReactNode;
};

type RouteStackFrameState = "active" | "hidden" | "push-enter" | "push-exit" | "pop-enter" | "pop-exit";

export const routeStackTransitionDurationMs = 260;

type RouteStackLocationState = {
  key?: string;
  __TSR_key?: string;
  __TSR_index?: number;
};

type RouteStackMatch = {
  id: string;
  routeId: string;
  pathname: string;
  params: RouteStackParams;
};

type RouteStackComponentRoute = {
  options: {
    component?: ComponentType<RouteStackPageProps>;
  };
};

export function getNextRouteStackEntries(entries: RouteStackEntry[], currentEntry: RouteStackEntry, navigationType: RouteStackNavigationType) {
  switch (navigationType) {
    case "POP": {
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

    case "PUSH": {
      if (entries.some((entry) => entry.id === currentEntry.id)) {
        return entries;
      }

      return [...entries, currentEntry];
    }

    case "REPLACE": {
      const replaceIndex = entries.findIndex((entry) => entry.pathname === currentEntry.pathname);

      if (replaceIndex !== -1) {
        return [...entries.slice(0, replaceIndex), currentEntry];
      }

      return [...entries.slice(0, -1), currentEntry];
    }
  }
}

export function getRouteStackCommitDelay(
  entries: RouteStackEntry[],
  currentEntry: RouteStackEntry,
  navigationType: RouteStackNavigationType,
) {
  if (navigationType !== "POP") {
    return 0;
  }

  const currentIndex = entries.findIndex((entry) => entry.id === currentEntry.id);

  if (currentIndex === -1 || currentIndex === entries.length - 1) {
    return 0;
  }

  return routeStackTransitionDurationMs;
}

function getLocationKey(location: { href: string; state: RouteStackLocationState }) {
  return location.state.__TSR_key ?? location.state.key ?? location.href;
}

function toRouteStackNavigationType(type: string): RouteStackNavigationType {
  if (type === "PUSH" || type === "REPLACE") {
    return type;
  }

  return "POP";
}

function useRouteStackNavigationType() {
  const router = useRouter();
  const [navigationType, setNavigationType] = useState<RouteStackNavigationType>("POP");

  useEffect(() => {
    return router.history.subscribe(({ action }) => {
      setNavigationType(toRouteStackNavigationType(action.type));
    });
  }, [router]);

  return navigationType;
}

function getRouteStackFrameState(
  entryIndex: number,
  activeIndex: number,
  entriesLength: number,
  navigationType: RouteStackNavigationType,
): RouteStackFrameState {
  if (entryIndex === activeIndex) {
    if (navigationType === "PUSH" && activeIndex > 0) {
      return "push-enter";
    }

    if (navigationType === "POP" && activeIndex < entriesLength - 1) {
      return "pop-enter";
    }

    return "active";
  }

  if (navigationType === "PUSH" && entryIndex === activeIndex - 1) {
    return "push-exit";
  }

  if (navigationType === "POP" && entryIndex === activeIndex + 1) {
    return "pop-exit";
  }

  return "hidden";
}

export function RouteStackFrames({
  entries,
  activeEntryId,
  navigationType,
}: {
  entries: RouteStackEntry[];
  activeEntryId: string;
  navigationType: RouteStackNavigationType;
}) {
  const activeIndex = entries.findIndex((entry) => entry.id === activeEntryId);

  return (
    <div className="route-stack">
      {entries.map((entry, entryIndex) => {
        const isActive = entry.id === activeEntryId;
        const frameState = activeIndex === -1 ? "hidden" : getRouteStackFrameState(entryIndex, activeIndex, entries.length, navigationType);
        const isVisibleFrame = frameState !== "hidden";

        return (
          <div
            aria-hidden={!isActive}
            className="route-stack__frame"
            key={entry.id}
            style={{ display: isVisibleFrame ? "block" : "none" }}
            data-route-stack-frame={frameState}
            data-route-pathname={entry.pathname}
          >
            {entry.element}
          </div>
        );
      })}
    </div>
  );
}

export function RouteStack() {
  const router = useRouter();
  const location = useRouterState({ select: (state) => state.location });
  const childMatch = useRouterState({
    select: (state) => state.matches[1] as RouteStackMatch | undefined,
  });
  const navigationType = useRouteStackNavigationType();
  const currentEntry = useMemo<RouteStackEntry | null>(() => {
    if (!childMatch || childMatch.pathname !== location.pathname) {
      return null;
    }

    const routesById = router.routesById as Record<string, RouteStackComponentRoute>;
    const Page = routesById[childMatch.routeId]?.options.component;

    if (!Page) {
      return null;
    }

    return {
      id: getLocationKey(location),
      pathname: location.pathname,
      element: <Page routeParams={childMatch.params} />,
    };
  }, [childMatch, location, router.routesById]);
  const [entries, setEntries] = useState<RouteStackEntry[]>(() => (currentEntry ? [currentEntry] : []));
  const visibleEntries = currentEntry && !entries.some((entry) => entry.id === currentEntry.id) ? getNextRouteStackEntries(entries, currentEntry, navigationType) : entries;

  useEffect(() => {
    if (!currentEntry) {
      return;
    }

    const nextEntries = getNextRouteStackEntries(entries, currentEntry, navigationType);
    const commitDelay = getRouteStackCommitDelay(entries, currentEntry, navigationType);

    if (commitDelay === 0) {
      if (nextEntries !== entries) {
        setEntries(nextEntries);
      }

      return;
    }

    const commitTimer = window.setTimeout(() => {
      setEntries(nextEntries);
    }, commitDelay);

    return () => {
      window.clearTimeout(commitTimer);
    };
  }, [currentEntry, entries, navigationType]);

  if (location.pathname === "/") {
    return <Navigate to="/client" />;
  }

  if (!currentEntry) {
    return null;
  }

  return <RouteStackFrames activeEntryId={currentEntry.id} entries={visibleEntries} navigationType={navigationType} />;
}
