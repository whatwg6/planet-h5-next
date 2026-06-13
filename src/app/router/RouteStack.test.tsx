import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";

import { RouteStackFrames, getNextRouteStackEntries, type RouteStackEntry } from "./RouteStack";

function createEntry(id: string, pathname: string, onUnmount: () => void, label = pathname): RouteStackEntry {
  function TestPage() {
    useEffect(() => onUnmount, [onUnmount]);
    return <div data-testid={label}>{label}</div>;
  }

  return {
    id,
    pathname,
    element: <TestPage />,
  };
}

describe("getNextRouteStackEntries", () => {
  it("pushes a new route onto the stack", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());
    const routeB = createEntry("key-b", "/client/1", vi.fn());

    expect(getNextRouteStackEntries([routeA], routeB, "PUSH")).toEqual([routeA, routeB]);
  });

  it("does not push the same history entry twice", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());

    expect(getNextRouteStackEntries([routeA], routeA, "PUSH")).toEqual([routeA]);
  });

  it("pops back to a previous route by history key", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());
    const routeB = createEntry("key-b", "/client/1", vi.fn());

    expect(getNextRouteStackEntries([routeA, routeB], routeA, "POP")).toEqual([routeA]);
  });

  it("replaces an existing route with the same pathname", () => {
    const routeA = createEntry("key-a", "/client", vi.fn());
    const oldRouteB = createEntry("key-b", "/client/1", vi.fn());
    const newRouteB = createEntry("key-c", "/client/1", vi.fn());

    expect(getNextRouteStackEntries([routeA, oldRouteB], newRouteB, "REPLACE")).toEqual([routeA, newRouteB]);
  });
});

describe("RouteStackFrames", () => {
  it("keeps the previous route mounted when a new route becomes active", () => {
    const unmountA = vi.fn();
    const unmountB = vi.fn();
    const routeA = createEntry("key-a", "/client", unmountA, "A");
    const routeB = createEntry("key-b", "/client/1", unmountB, "B");

    const { rerender } = render(<RouteStackFrames activeEntryId={routeA.id} entries={[routeA]} />);

    rerender(<RouteStackFrames activeEntryId={routeB.id} entries={[routeA, routeB]} />);

    expect(screen.getByTestId("A")).toBeInTheDocument();
    expect(screen.getByTestId("A")).not.toBeVisible();
    expect(screen.getByTestId("B")).toBeVisible();
    expect(unmountA).not.toHaveBeenCalled();
    expect(unmountB).not.toHaveBeenCalled();
  });
});
