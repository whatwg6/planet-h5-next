import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";

import { RouteStackFrames, getRouteStackCommitDelay, getNextRouteStackEntries, routeStackTransitionDurationMs, type RouteStackEntry } from "./RouteStack";

function createEntry(id: string, pathname: string, onUnmount: () => void, label = pathname, onRender?: () => void, historyIndex?: number): RouteStackEntry {
  function TestPage() {
    onRender?.();
    useEffect(() => onUnmount, [onUnmount]);
    return <div data-testid={label}>{label}</div>;
  }

  return {
    id,
    pathname,
    historyIndex,
    element: <TestPage />,
  };
}

describe("getNextRouteStackEntries", () => {
  it("pushes a new route onto the stack", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());
    const routeB = createEntry("key-b", "/client/1", vi.fn());

    expect(getNextRouteStackEntries([routeA], routeB, { type: "PUSH" })).toEqual([routeA, routeB]);
  });

  it("does not push the same history entry twice", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());

    expect(getNextRouteStackEntries([routeA], routeA, { type: "PUSH" })).toEqual([routeA]);
  });

  it("pops back to a previous route by history key", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());
    const routeB = createEntry("key-b", "/client/1", vi.fn());

    expect(getNextRouteStackEntries([routeA, routeB], routeA, { type: "BACK" })).toEqual([routeA]);
  });

  it("pops by stack position even when the navigation action is stale", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());
    const routeB = createEntry("key-b", "/client/1", vi.fn());

    expect(getNextRouteStackEntries([routeA, routeB], routeA, { type: "PUSH" })).toEqual([routeA]);
  });

  it("keeps the same stack reference when pop already targets the top route", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());
    const entries = [routeA];

    expect(getNextRouteStackEntries(entries, routeA, { type: "BACK" })).toBe(entries);
  });

  it("replaces an existing route with the same pathname", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());
    const oldRouteB = createEntry("key-b", "/client/1", vi.fn());
    const newRouteB = createEntry("key-c", "/client/1", vi.fn());

    expect(getNextRouteStackEntries([routeA, oldRouteB], newRouteB, { type: "REPLACE" })).toEqual([routeA, newRouteB]);
  });
});

describe("getRouteStackCommitDelay", () => {
  it("delays pruning popped routes so the exit animation can finish", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());
    const routeB = createEntry("key-b", "/client/1", vi.fn());

    expect(getRouteStackCommitDelay([routeA, routeB], routeA, { type: "BACK" })).toBe(routeStackTransitionDurationMs);
  });

  it("delays pruning by stack position even when the navigation action is stale", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());
    const routeB = createEntry("key-b", "/client/1", vi.fn());

    expect(getRouteStackCommitDelay([routeA, routeB], routeA, { type: "PUSH" })).toBe(routeStackTransitionDurationMs);
  });

  it("does not delay push commits", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());
    const routeB = createEntry("key-b", "/client/1", vi.fn());

    expect(getRouteStackCommitDelay([routeA], routeB, { type: "PUSH" })).toBe(0);
  });
});

describe("RouteStackFrames", () => {
  it("keeps the previous route mounted when a new route becomes active", () => {
    const unmountA = vi.fn();
    const unmountB = vi.fn();
    const routeA = createEntry("key-a", "/client", unmountA, "A");
    const routeB = createEntry("key-b", "/client/1", unmountB, "B");

    const { rerender } = render(<RouteStackFrames activeEntryId={routeA.id} entries={[routeA]} navigationAction={{ type: "BACK" }} />);

    rerender(<RouteStackFrames activeEntryId={routeB.id} entries={[routeA, routeB]} navigationAction={{ type: "PUSH" }} />);

    expect(screen.getByTestId("A")).toBeInTheDocument();
    expect(screen.getByTestId("A").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("B")).toBeVisible();
    expect(unmountA).not.toHaveBeenCalled();
    expect(unmountB).not.toHaveBeenCalled();
  });

  it("marks frames with push transition classes", () => {
    const routeA = createEntry("key-a", "/client", vi.fn(), "A");
    const routeB = createEntry("key-b", "/client/1", vi.fn(), "B");

    const { rerender } = render(<RouteStackFrames activeEntryId={routeA.id} entries={[routeA]} navigationAction={{ type: "BACK" }} />);

    rerender(<RouteStackFrames activeEntryId={routeB.id} entries={[routeA, routeB]} navigationAction={{ type: "PUSH" }} />);

    expect(screen.getByTestId("A").parentElement).toHaveClass("route-stack__frame--visible", "route-stack__frame--base", "translate-x-0");
    expect(screen.getByTestId("A").parentElement).not.toHaveClass("-translate-x-[24%]", "!-translate-x-[24%]", "transition-transform");
    expect(screen.getByTestId("A").parentElement).toHaveAttribute("data-route-stack-active", "false");
    expect(screen.getByTestId("B").parentElement).toHaveClass("route-stack__frame--visible", "route-stack__frame--top", "translate-x-full");
    expect(screen.getByTestId("B").parentElement).toHaveAttribute("data-route-stack-active", "true");
  });

  it("only animates the exiting top frame when navigating back", async () => {
    const routeA = createEntry("key-a", "/client", vi.fn(), "A");
    const routeB = createEntry("key-b", "/client/1", vi.fn(), "B");

    const { rerender } = render(<RouteStackFrames activeEntryId={routeB.id} entries={[routeA, routeB]} navigationAction={{ type: "PUSH" }} />);

    rerender(<RouteStackFrames activeEntryId={routeA.id} entries={[routeA, routeB]} navigationAction={{ type: "BACK" }} />);

    expect(screen.getByTestId("A").parentElement).not.toHaveClass("-translate-x-[24%]", "!-translate-x-[24%]", "transition-transform");
    expect(screen.getByTestId("A").parentElement).toHaveAttribute("data-route-stack-active", "true");
    expect(screen.getByTestId("A").parentElement).toHaveAttribute("data-route-stack-transition", "static");
    expect(screen.getByTestId("B").parentElement).toHaveClass("route-stack__frame--visible", "route-stack__frame--top", "translate-x-0");
    expect(screen.getByTestId("B").parentElement).toHaveAttribute("data-route-stack-active", "false");
    expect(screen.getByTestId("B").parentElement).toHaveAttribute("data-route-stack-transition", "exiting");

    await waitFor(() => {
      expect(screen.getByTestId("B").parentElement).not.toHaveClass("translate-x-0");
      expect(screen.getByTestId("B").parentElement).toHaveClass("translate-x-full", "transition-transform");
    });
  });

  it("uses stack position instead of stale navigation action for back transitions", async () => {
    const routeA = createEntry("key-a", "/client", vi.fn(), "A");
    const routeB = createEntry("key-b", "/client/1", vi.fn(), "B");

    const { rerender } = render(<RouteStackFrames activeEntryId={routeB.id} entries={[routeA, routeB]} navigationAction={{ type: "PUSH" }} />);

    rerender(<RouteStackFrames activeEntryId={routeA.id} entries={[routeA, routeB]} navigationAction={{ type: "PUSH" }} />);

    expect(screen.getByTestId("A").parentElement).toHaveAttribute("data-route-stack-transition", "static");
    expect(screen.getByTestId("B").parentElement).toHaveAttribute("data-route-stack-transition", "exiting");

    await waitFor(() => {
      expect(screen.getByTestId("B").parentElement).not.toHaveClass("translate-x-0");
      expect(screen.getByTestId("B").parentElement).toHaveClass("translate-x-full", "transition-transform");
    });
  });

  it("does not rerender unchanged inactive frames during navigation", () => {
    const renderA = vi.fn();
    const routeA = createEntry("key-a", "/client", vi.fn(), "A", renderA);
    const routeB = createEntry("key-b", "/client/1", vi.fn(), "B");
    const routeC = createEntry("key-c", "/client/1/plans/settings", vi.fn(), "C");

    const { rerender } = render(
      <RouteStackFrames activeEntryId={routeC.id} entries={[routeA, routeB, routeC]} navigationAction={{ type: "PUSH" }} />,
    );

    expect(renderA).toHaveBeenCalledTimes(1);

    rerender(<RouteStackFrames activeEntryId={routeB.id} entries={[routeA, routeB, routeC]} navigationAction={{ type: "BACK" }} />);

    expect(renderA).toHaveBeenCalledTimes(1);
  });

  it("does not rerender the previous page content when pushing a new route", () => {
    const renderA = vi.fn();
    const routeA = createEntry("key-a", "/client", vi.fn(), "A", renderA);
    const routeB = createEntry("key-b", "/client/1", vi.fn(), "B");

    const { rerender } = render(<RouteStackFrames activeEntryId={routeA.id} entries={[routeA]} navigationAction={{ type: "BACK" }} />);

    expect(renderA).toHaveBeenCalledTimes(1);

    rerender(<RouteStackFrames activeEntryId={routeB.id} entries={[routeA, routeB]} navigationAction={{ type: "PUSH" }} />);

    expect(renderA).toHaveBeenCalledTimes(1);
  });
});
