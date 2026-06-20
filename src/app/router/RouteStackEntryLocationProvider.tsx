import { RouterContextProvider, useRouter } from "@tanstack/react-router";
import { useMemo, type ReactNode } from "react";

type RouterStore = ReturnType<typeof useRouter>["stores"]["__store"];
type LocationStore = ReturnType<typeof useRouter>["stores"]["location"];

function createSnapshotStore<TStore extends { get: () => unknown }>(
  store: TStore,
  getSnapshot: () => ReturnType<TStore["get"]>,
): TStore {
  return {
    ...store,
    get: getSnapshot,
  } as TStore;
}

function createRouterStateStore(store: RouterStore, location: unknown): RouterStore {
  return createSnapshotStore(store, () => ({
    ...store.get(),
    location,
  }) as ReturnType<RouterStore["get"]>);
}

function createLocationStore(store: LocationStore, location: unknown): LocationStore {
  return createSnapshotStore(store, () => location as ReturnType<LocationStore["get"]>);
}

function createRouteStackEntryRouter(router: ReturnType<typeof useRouter>, location: unknown) {
  const options = {
    ...router.options,
    Wrap: undefined,
  };
  const stores = {
    ...router.stores,
    __store: createRouterStateStore(router.stores.__store, location),
    location: createLocationStore(router.stores.location, location),
  };

  return new Proxy(router, {
    get(target, property, receiver) {
      if (property === "stores") {
        return stores;
      }

      if (property === "options") {
        return options;
      }

      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export function RouteStackEntryLocationProvider({
  children,
  location,
}: {
  children: ReactNode;
  location: unknown;
}) {
  const router = useRouter();
  const entryRouter = useMemo(() => createRouteStackEntryRouter(router, location), [router, location]);

  return (
    <RouterContextProvider router={entryRouter}>
      {children}
    </RouterContextProvider>
  );
}
