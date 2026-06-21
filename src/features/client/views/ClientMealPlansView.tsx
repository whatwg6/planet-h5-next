import type { ClientDetail, ClientMealPlanSummary } from "@/domain/client/Client";
import { EmptyState } from "@/shared/ui/Feedback";
import { Page } from "@/shared/ui/Page";

const businessTypeText: Record<ClientMealPlanSummary["businessType"], string> = {
  groupDelivery: "团餐配送",
  dineIn: "到店堂食",
};

export function ClientMealPlansView({
  client,
  onBack,
  onOpenPlan,
}: {
  client: ClientDetail;
  onBack: () => void;
  onOpenPlan: (planId: string) => void;
}) {
  return (
    <Page title="用餐计划" onBack={onBack}>
      {client.mealPlans.length === 0 ? (
        <EmptyState title="暂无用餐计划" />
      ) : (
        <div className="space-y-3">
          {client.mealPlans.map((plan) => (
            <MealPlanCard key={plan.id} plan={plan} onClick={() => onOpenPlan(plan.id)} />
          ))}
        </div>
      )}
    </Page>
  );
}

function MealPlanCard({ plan, onClick }: { plan: ClientMealPlanSummary; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-md border border-border-solid-line-2 bg-background-primary-container p-4 text-left shadow-card active:bg-background-primary-container--active"
    >
      <span className="block text-base font-medium text-text-primary">{plan.name}</span>
      <span className="mt-2 block text-sm text-text-secondary">
        {businessTypeText[plan.businessType]}
      </span>
      {plan.updatedAt ? (
        <span className="mt-1 block text-xs text-text-tertiary">更新于 {plan.updatedAt}</span>
      ) : null}
    </button>
  );
}
