import { useRouter, useRouterState } from "@tanstack/react-router";
import { createRef, useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";

import {
  getNextRouteStackEntries,
  getRouteStackCurrentEntry,
  type RouteStackEntry,
  type RouteStackNavigationAction,
  type RouteStackPageProps,
  type RouteStackParams,
} from "@/app/router/routeStackModel";

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

type RouteStackLocation = {
  href: string;
  pathname: string;
  state: RouteStackLocationState;
};

function getLocationKey(location: { href: string; state: RouteStackLocationState }) {
  return location.state.__TSR_key ?? location.state.key ?? location.href;
}

function getLocationHistoryIndex(location: { state: RouteStackLocationState }) {
  return location.state.__TSR_index;
}

function snapshotRouteStackLocation(location: RouteStackLocation) {
  return {
    ...location,
    state: { ...location.state },
  };
}

function useRouteStackNavigationAction() {
  const router = useRouter();
  const [navigationAction, setNavigationAction] = useState<RouteStackNavigationAction>({ type: "BACK" });

  useEffect(() => {
    return router.history.subscribe(({ action }) => {
      setNavigationAction(action);
    });
  }, [router]);

  return navigationAction;
}

function createRouteStackEntry({
  childMatch,
  location,
  routesById,
}: {
  childMatch?: RouteStackMatch;
  location: RouteStackLocation;
  routesById: Record<string, RouteStackComponentRoute>;
}): RouteStackEntry | null {
  if (!childMatch || childMatch.pathname !== location.pathname) {
    return null;
  }

  const Page = routesById[childMatch.routeId]?.options.component;

  if (!Page) {
    return null;
  }

  return {
    id: getLocationKey(location),
    location: snapshotRouteStackLocation(location),
    pathname: location.pathname,
    historyIndex: getLocationHistoryIndex(location),
    element: <Page routeParams={childMatch.params} />,
    nodeRef: createRef<HTMLDivElement>(),
  };
}

export function useRouteStack() {
  const router = useRouter();
  const location = useRouterState({ select: (state) => state.location });
  const childMatch = useRouterState({
    select: (state) => state.matches[1] as RouteStackMatch | undefined,
  });
  const navigationAction = useRouteStackNavigationAction();
  const routesById = router.routesById as Record<string, RouteStackComponentRoute>;
  const currentEntry = useMemo<RouteStackEntry | null>(() => {
    return createRouteStackEntry({ childMatch, location, routesById });
  }, [childMatch, location, routesById]);
  const [entries, setEntries] = useState<RouteStackEntry[]>(() => (currentEntry ? [currentEntry] : []));
  const stackCurrentEntry = useMemo(() => getRouteStackCurrentEntry(entries, currentEntry), [currentEntry, entries]);
  const [activeEntryId, setActiveEntryId] = useState(() => currentEntry?.id ?? null);

  useEffect(() => {
    if (stackCurrentEntry) {
      setActiveEntryId(stackCurrentEntry.id);
    }
  }, [stackCurrentEntry]);

  useLayoutEffect(() => {
    if (!stackCurrentEntry) {
      return;
    }

    setEntries((currentEntries) => getNextRouteStackEntries(currentEntries, stackCurrentEntry, navigationAction));
  }, [stackCurrentEntry, navigationAction]);

  return {
    activeEntryId: stackCurrentEntry?.id ?? activeEntryId,
    entries,
    locationPathname: location.pathname,
    navigationAction,
  };
}
