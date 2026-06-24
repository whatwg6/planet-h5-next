import { useNavigate, useParams, useRouter } from "@tanstack/react-router";

import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { routeModeState } from "@/app/router/historyState";
import { PlanSettingModeView } from "@/features/plan/views/PlanSettingModeView";
import { PlanSettingsView } from "@/features/plan/views/PlanSettingsView";

const planSettingModes = [
  "baseInfo",
  "openTimes",
  "operationDay",
  "occupationTime",
  "restriction",
  "orderRule",
  "orderTransfer",
  "manualConfirmOrder",
  "pickupSetting",
  "locationSetting",
  "menuStyle",
  "financeConfig",
  "maximumOrderAmount",
  "merchantOrderVerification",
  "hiddenAccountTypes",
  "disableAppendDish",
] as const;

export function PlanSettingsRoute() {
  const params = useParams({ strict: false, shouldThrow: false });
  const navigate = useNavigate();
  const router = useRouter();
  const clientId = params?.clientId ?? "";
  const planId = params?.planId ?? "";
  const back = () => router.history.back();
  const enterMode = (mode: string) => {
    void navigate({
      to: "/ops/client/$clientId/plan/$planId/setting",
      params: { clientId, planId },
      state: (state) => ({ ...state, ...routeModeState(mode) }),
    });
  };

  return (
    <RouteModeSwitch
      defaultPage={
        <PlanSettingsView
          clientId={clientId}
          planId={planId}
          onBack={back}
          onOpenMode={enterMode}
        />
      }
      modes={Object.fromEntries(
        planSettingModes.map((mode) => [
          mode,
          <PlanSettingModeView
            key={mode}
            clientId={clientId}
            planId={planId}
            mode={mode}
            onBack={back}
          />,
        ]),
      )}
    />
  );
}
