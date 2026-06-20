import { Navigate, useRouter, useRouterState } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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

export type RouteStackEntry = {
  id: string;
  pathname: string;
  historyIndex?: number;
  element: ReactNode;
};

export const routeStackTransitionDurationMs = 300;

type RouteStackTransitionDirection = "forward" | "back" | "replace";
type RouteStackFrameTransitionPhase = "entering" | "exiting" | "static";
type RouteStackFrameAnimationStage = "start" | "active";

const routeStackTransformTransitionClassName = "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

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

function getRouteStackTransitionDirection(navigationAction: RouteStackNavigationAction): RouteStackTransitionDirection {
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

function getRouteStackTransitionDirectionFromEntries(
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

export function getRouteStackCommitDelay(
  entries: RouteStackEntry[],
  currentEntry: RouteStackEntry,
  navigationAction: RouteStackNavigationAction,
) {
  if (getRouteStackTransitionDirectionFromEntries(entries, currentEntry.id, navigationAction) !== "back") {
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

function getLocationHistoryIndex(location: { state: RouteStackLocationState }) {
  return location.state.__TSR_index;
}

function getRouteStackCurrentEntry(entries: RouteStackEntry[], currentEntry: RouteStackEntry | null) {
  if (!currentEntry) {
    return null;
  }

  return (
    entries.find((entry) => entry.id === currentEntry.id) ??
    entries.find((entry) => currentEntry.historyIndex !== undefined && entry.historyIndex === currentEntry.historyIndex) ??
    currentEntry
  );
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

export function RouteStackFrames({
  entries,
  activeEntryId,
  navigationAction,
}: {
  entries: RouteStackEntry[];
  activeEntryId: string;
  navigationAction: RouteStackNavigationAction;
}) {
  const activeIndex = entries.findIndex((entry) => entry.id === activeEntryId);
  const transitionDirection = getRouteStackTransitionDirectionFromEntries(entries, activeEntryId, navigationAction);
  const exitingEntryId = transitionDirection === "back" && activeIndex !== -1 ? entries[activeIndex + 1]?.id : null;

  return (
    <div className="route-stack">
      {entries.map((entry, entryIndex) => {
        const isActive = entry.id === activeEntryId;
        const isExiting = entry.id === exitingEntryId;
        const isEntering = activeIndex !== -1 && entryIndex === activeIndex && transitionDirection === "forward" && activeIndex > 0;
        const transitionPhase: RouteStackFrameTransitionPhase =
          isExiting ? "exiting" : isEntering ? "entering" : "static";
        const frameTransitionDirection = transitionPhase === "static" ? "replace" : transitionDirection;
        const isVisible = isActive || transitionPhase !== "static" || (transitionDirection === "forward" && entryIndex === activeIndex - 1);

        return (
          <RouteStackFrame
            entry={entry}
            isActive={isActive}
            isVisible={isVisible}
            key={entry.id}
            transitionDirection={frameTransitionDirection}
            transitionPhase={transitionPhase}
          />
        );
      })}
    </div>
  );
}

const RouteStackFrame = memo(function RouteStackFrame({
  entry,
  isActive,
  isVisible,
  transitionDirection,
  transitionPhase,
}: {
  entry: RouteStackEntry;
  isActive: boolean;
  isVisible: boolean;
  transitionDirection: RouteStackTransitionDirection;
  transitionPhase: RouteStackFrameTransitionPhase;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [animationStage, setAnimationStage] = useState<RouteStackFrameAnimationStage>(() =>
    transitionPhase === "static" ? "active" : "start",
  );

  useLayoutEffect(() => {
    if (transitionPhase === "static" || transitionDirection === "replace") {
      setAnimationStage("active");
      return;
    }

    setAnimationStage("start");

    const startAnimationFrame = window.requestAnimationFrame(() => {
      const activeAnimationFrame = window.requestAnimationFrame(() => {
        setAnimationStage("active");
      });

      frameRef.current?.setAttribute("data-route-stack-animation-frame", String(activeAnimationFrame));
    });

    frameRef.current?.setAttribute("data-route-stack-animation-frame", String(startAnimationFrame));

    return () => {
      const animationFrame = Number(frameRef.current?.getAttribute("data-route-stack-animation-frame"));

      if (Number.isFinite(animationFrame)) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [transitionDirection, transitionPhase]);

  const layerClassName = transitionPhase === "entering" && transitionDirection === "forward"
    ? "route-stack__frame--top"
    : transitionPhase === "exiting" && transitionDirection === "back"
      ? "route-stack__frame--top"
      : isVisible
        ? "route-stack__frame--base"
        : "";
  const transformClassName = getRouteStackFrameTransformClassName(transitionDirection, transitionPhase, animationStage);
  const transitionClassName = transitionPhase === "static" || animationStage === "start" ? "" : routeStackTransformTransitionClassName;

  return (
    <div
      aria-hidden={!isActive}
      className={[
        "route-stack__frame",
        isVisible ? "route-stack__frame--visible" : "",
        layerClassName,
        transformClassName,
        transitionClassName,
      ].filter(Boolean).join(" ")}
      data-route-pathname={entry.pathname}
      data-route-stack-active={isActive}
      data-route-stack-transition={transitionPhase}
      ref={frameRef}
    >
      {entry.element}
    </div>
  );
});

function getRouteStackFrameTransformClassName(
  transitionDirection: RouteStackTransitionDirection,
  transitionPhase: RouteStackFrameTransitionPhase,
  animationStage: RouteStackFrameAnimationStage,
) {
  if (transitionPhase === "entering" && transitionDirection === "forward") {
    return animationStage === "start" ? "translate-x-full" : "translate-x-0";
  }

  if (transitionPhase === "exiting" && transitionDirection === "back") {
    return animationStage === "start" ? "translate-x-0" : "translate-x-full";
  }

  return "translate-x-0";
}

export function RouteStack() {
  const router = useRouter();
  const location = useRouterState({ select: (state) => state.location });
  const locationKey = getLocationKey(location);
  const locationPathname = location.pathname;
  const childMatch = useRouterState({
    select: (state) => state.matches[1] as RouteStackMatch | undefined,
  });
  const navigationAction = useRouteStackNavigationAction();
  const currentEntry = useMemo<RouteStackEntry | null>(() => {
    if (!childMatch || childMatch.pathname !== locationPathname) {
      return null;
    }

    const routesById = router.routesById as Record<string, RouteStackComponentRoute>;
    const Page = routesById[childMatch.routeId]?.options.component;

    if (!Page) {
      return null;
    }

    return {
      id: locationKey,
      pathname: locationPathname,
      historyIndex: getLocationHistoryIndex(location),
      element: <Page routeParams={childMatch.params} />,
    };
  }, [childMatch, location, locationKey, locationPathname, router.routesById]);
  const [entries, setEntries] = useState<RouteStackEntry[]>(() => (currentEntry ? [currentEntry] : []));
  const stackCurrentEntry = useMemo(() => getRouteStackCurrentEntry(entries, currentEntry), [currentEntry, entries]);
  const [activeEntryId, setActiveEntryId] = useState(() => currentEntry?.id ?? null);
  const renderedActiveEntryId = stackCurrentEntry?.id ?? activeEntryId;
  const visibleEntries = stackCurrentEntry && !entries.some((entry) => entry.id === stackCurrentEntry.id) ? getNextRouteStackEntries(entries, stackCurrentEntry, navigationAction) : entries;

  useEffect(() => {
    if (stackCurrentEntry) {
      setActiveEntryId(stackCurrentEntry.id);
    }
  }, [stackCurrentEntry]);

  useLayoutEffect(() => {
    if (!stackCurrentEntry) {
      return;
    }

    const nextEntries = getNextRouteStackEntries(entries, stackCurrentEntry, navigationAction);
    const commitDelay = getRouteStackCommitDelay(entries, stackCurrentEntry, navigationAction);

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
  }, [stackCurrentEntry, entries, navigationAction]);

  if (locationPathname === "/") {
    return <Navigate to="/client" />;
  }

  if (!renderedActiveEntryId || visibleEntries.length === 0) {
    return null;
  }

  return <RouteStackFrames activeEntryId={renderedActiveEntryId} entries={visibleEntries} navigationAction={navigationAction} />;
}
