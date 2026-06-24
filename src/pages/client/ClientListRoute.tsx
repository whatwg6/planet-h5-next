import { useNavigate } from "@tanstack/react-router";

import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { ClientListView } from "@/features/client/views/ClientListView";

export function ClientListRoute() {
  const navigate = useNavigate();

  return (
    <RouteModeSwitch
      defaultPage={
        <ClientListView
          onOpenClient={(clientId) => {
            void navigate({ to: "/ops/client/$clientId", params: { clientId } });
          }}
        />
      }
    />
  );
}
