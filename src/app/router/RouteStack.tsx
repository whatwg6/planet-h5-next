import { Navigate, useRouter, useRouterState } from "@tanstack/react-router";
import type { ComponentType, ReactNode, RefObject } from "react";
import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";

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

export const routeStackTransitionDurationMs = 300;

type RouteStackTransitionClassNames = Partial<{
  appear: string;
  appearActive: string;
  appearDone: string;
  enter: string;
  enterActive: string;
  enterDone: string;
  exit: string;
  exitActive: string;
}>;

const routeStackTransitionClassNames: Record<RouteStackNavigationType, RouteStackTransitionClassNames> = {
  PUSH: {
    appear: "route-stack__frame--visible route-stack__frame--top translate-x-full",
    appearActive: "!translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    appearDone: "route-stack__frame--visible route-stack__frame--top !translate-x-0",
    enter: "route-stack__frame--visible route-stack__frame--top translate-x-full",
    enterActive: "!translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    enterDone: "route-stack__frame--visible route-stack__frame--top !translate-x-0",
    exit: "route-stack__frame--visible route-stack__frame--base translate-x-0",
    exitActive: "!-translate-x-[24%] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  },
  POP: {
    appear: "route-stack__frame--visible route-stack__frame--base -translate-x-[24%]",
    appearActive: "!translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    appearDone: "route-stack__frame--visible route-stack__frame--base !translate-x-0",
    enter: "route-stack__frame--visible route-stack__frame--base -translate-x-[24%]",
    enterActive: "!translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    enterDone: "route-stack__frame--visible route-stack__frame--base !translate-x-0",
    exit: "route-stack__frame--visible route-stack__frame--top translate-x-0",
    exitActive: "!translate-x-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  },
  REPLACE: {},
};

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

function shouldAnimateActiveFrame(
  entryIndex: number,
  activeIndex: number,
  entriesLength: number,
  navigationType: RouteStackNavigationType,
) {
  if (entryIndex === activeIndex) {
    if (navigationType === "PUSH" && activeIndex > 0) {
      return true;
    }

    if (navigationType === "POP" && activeIndex < entriesLength - 1) {
      return true;
    }
  }

  return false;
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
  const frameRefs = useRef(new Map<string, RefObject<HTMLDivElement | null>>());

  useEffect(() => {
    const entryIds = new Set(entries.map((entry) => entry.id));

    frameRefs.current.forEach((_, entryId) => {
      if (!entryIds.has(entryId)) {
        frameRefs.current.delete(entryId);
      }
    });
  }, [entries]);

  const getFrameRef = (entryId: string) => {
    const existingRef = frameRefs.current.get(entryId);

    if (existingRef) {
      return existingRef;
    }

    const frameRef = createRef<HTMLDivElement>();
    frameRefs.current.set(entryId, frameRef);
    return frameRef;
  };

  return (
    <div className="route-stack">
      {entries.map((entry, entryIndex) => {
        const isActive = entry.id === activeEntryId;
        const frameRef = getFrameRef(entry.id);
        const shouldAppear = activeIndex !== -1 && shouldAnimateActiveFrame(entryIndex, activeIndex, entries.length, navigationType);

        return (
          <CSSTransition
            appear={shouldAppear}
            classNames={routeStackTransitionClassNames[navigationType]}
            in={isActive}
            key={entry.id}
            nodeRef={frameRef}
            timeout={routeStackTransitionDurationMs}
          >
            <div
              aria-hidden={!isActive}
              className="route-stack__frame"
              data-route-stack-active={isActive}
              data-route-pathname={entry.pathname}
              ref={frameRef}
            >
              {entry.element}
            </div>
          </CSSTransition>
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
