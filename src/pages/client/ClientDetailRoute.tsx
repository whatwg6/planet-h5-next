import { useParams } from "@tanstack/react-router";

import { ClientDetailView } from "@/features/client/views/ClientDetailView";

export function ClientDetailRoute() {
  const { clientId } = useParams({ strict: false });
  return <ClientDetailView clientId={clientId ?? ""} />;
}
