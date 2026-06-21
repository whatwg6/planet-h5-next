import { Navigate } from "@tanstack/react-router";
import { memo, useLayoutEffect } from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import { RouteStackEntryLocationProvider } from "@/app/router/RouteStackEntryLocationProvider";
import {
  getRouteStackTransitionDirectionFromEntries,
  routeStackTransitionDurationMs,
  type RouteStackEntry,
  type RouteStackNavigationAction,
} from "@/app/router/routeStackModel";
import { useRouteStack } from "@/app/router/useRouteStack";

export type {
  RouteStackEntry,
  RouteStackNavigationAction,
  RouteStackNavigationType,
  RouteStackPageProps,
  RouteStackParams,
} from "@/app/router/routeStackModel";
export {
  getNextRouteStackEntries,
  getRouteStackCurrentEntry,
  getRouteStackTransitionDirection,
  getRouteStackTransitionDirectionFromEntries,
  routeStackTransitionDurationMs,
} from "@/app/router/routeStackModel";

type RouteStackFrameProps = {
  activeEntryId: string;
  entry: RouteStackEntry;
};

type RouteStackFramesProps = {
  activeEntryId: string;
  entries: RouteStackEntry[];
  navigationAction: RouteStackNavigationAction;
};

const routeStackSlideClassNames = {
  enter: "translate-x-full",
  enterActive:
    "!translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  exit: "translate-x-0",
  exitActive:
    "!translate-x-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
};

export function RouteStackFrames({
  entries,
  activeEntryId,
  navigationAction,
}: RouteStackFramesProps) {
  const transitionDirection = getRouteStackTransitionDirectionFromEntries(
    entries,
    activeEntryId,
    navigationAction,
  );
  const shouldAnimate = transitionDirection !== "replace";

  return (
    <TransitionGroup className="route-stack">
      {entries.map((entry) => (
        <CSSTransition
          classNames={shouldAnimate ? routeStackSlideClassNames : undefined}
          key={entry.id}
          nodeRef={entry.nodeRef}
          timeout={shouldAnimate ? routeStackTransitionDurationMs : 0}
        >
          <RouteStackFrame activeEntryId={activeEntryId} entry={entry} />
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
}

const RouteStackFrame = memo(function RouteStackFrame({
  activeEntryId,
  entry,
}: RouteStackFrameProps) {
  const isActive = entry.id === activeEntryId;

  useLayoutEffect(() => {
    const frameElement = entry.nodeRef.current;

    if (isActive || !frameElement?.contains(document.activeElement)) {
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [entry.nodeRef, isActive]);

  return (
    <div className="route-stack__frame" inert={!isActive} ref={entry.nodeRef}>
      <RouteStackEntryLocationProvider location={entry.location}>
        {entry.element}
      </RouteStackEntryLocationProvider>
    </div>
  );
});

export function RouteStack() {
  const { activeEntryId, entries, locationPathname, navigationAction } = useRouteStack();

  if (locationPathname === "/") {
    return <Navigate to="/client" />;
  }

  if (!activeEntryId || entries.length === 0) {
    return null;
  }

  return (
    <RouteStackFrames
      activeEntryId={activeEntryId}
      entries={entries}
      navigationAction={navigationAction}
    />
  );
}
