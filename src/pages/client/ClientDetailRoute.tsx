import { useParams } from "@tanstack/react-router";

import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { ClientDetailView } from "@/features/client/views/ClientDetailView";

export function ClientDetailRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  return <ClientDetailView clientId={routeParams?.clientId ?? params?.clientId ?? ""} />;
}
