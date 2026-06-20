import { Navigate } from "@tanstack/react-router";
import { memo } from "react";
import type { TransitionEventHandler } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import type { TransitionStatus } from "react-transition-group/Transition";

import {
  getRouteStackTransitionDirectionFromEntries,
  routeStackTransitionDurationMs,
  type RouteStackEntry,
  type RouteStackNavigationAction,
  type RouteStackPageProps,
  type RouteStackParams,
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

type RouteStackFrameTransitionPhase = "entering" | "exiting" | "static";

type RouteStackFrameProps = {
  activeEntryId: string;
  entries: RouteStackEntry[];
  entry: RouteStackEntry;
  transitionState: TransitionStatus;
};

export function RouteStackFrames({
  entries,
  activeEntryId,
  navigationAction,
}: {
  entries: RouteStackEntry[];
  activeEntryId: string;
  navigationAction: RouteStackNavigationAction;
}) {
  const transitionDirection = getRouteStackTransitionDirectionFromEntries(entries, activeEntryId, navigationAction);

  return (
    <TransitionGroup className="route-stack" component="div">
      {entries.map((entry) => (
        <CSSTransition
          classNames={transitionDirection === "replace" ? undefined : "route-stack-slide"}
          key={entry.id}
          nodeRef={entry.nodeRef}
          timeout={transitionDirection === "replace" ? 0 : routeStackTransitionDurationMs}
        >
          {(transitionState: TransitionStatus) => (
            <RouteStackFrame
              activeEntryId={activeEntryId}
              entries={entries}
              entry={entry}
              transitionState={transitionState}
            />
          )}
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
}

const RouteStackFrame = memo(function RouteStackFrame({
  activeEntryId,
  entries,
  entry,
  transitionState,
}: RouteStackFrameProps) {
  const activeIndex = entries.findIndex((stackEntry) => stackEntry.id === activeEntryId);
  const entryIndex = entries.findIndex((stackEntry) => stackEntry.id === entry.id);
  const isActive = entry.id === activeEntryId;
  const transitionPhase = getRouteStackFrameTransitionPhase(transitionState);
  const isTransitioning = transitionPhase !== "static";
  const isPreviousFrame = activeIndex !== -1 && entryIndex === activeIndex - 1;
  const isVisible = isActive || isPreviousFrame || isTransitioning;
  const layerClassName = isTransitioning || isActive ? "route-stack__frame--top" : isVisible ? "route-stack__frame--base" : "";

  return (
    <div
      aria-hidden={!isActive}
      className={["route-stack__frame", isVisible ? "route-stack__frame--visible" : "", layerClassName]
        .filter(Boolean)
        .join(" ")}
      data-route-pathname={entry.pathname}
      data-route-stack-active={isActive}
      data-route-stack-transition={transitionPhase}
      onTransitionEnd={stopNestedTransitionPropagation}
      ref={entry.nodeRef}
    >
      {entry.element}
    </div>
  );
});

function getRouteStackFrameTransitionPhase(transitionState: TransitionStatus): RouteStackFrameTransitionPhase {
  if (transitionState === "entering") {
    return "entering";
  }

  if (transitionState === "exiting") {
    return "exiting";
  }

  return "static";
}

const stopNestedTransitionPropagation: TransitionEventHandler<HTMLDivElement> = (event) => {
  if (event.currentTarget !== event.target) {
    event.stopPropagation();
  }
};

export function RouteStack() {
  const { activeEntryId, entries, locationPathname, navigationAction } = useRouteStack();

  if (locationPathname === "/") {
    return <Navigate to="/client" />;
  }

  if (!activeEntryId || entries.length === 0) {
    return null;
  }

  return <RouteStackFrames activeEntryId={activeEntryId} entries={entries} navigationAction={navigationAction} />;
}
