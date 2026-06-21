import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { ClientListView } from "@/features/client/views/ClientListView";

export function ClientListRoute() {
  return <RouteModeSwitch fallback={<ClientListView />} />;
}
