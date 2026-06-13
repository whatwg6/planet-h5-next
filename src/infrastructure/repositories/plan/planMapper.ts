import type { PlanDetail } from "@/domain/plan/Plan";

import type { PlanDetailDto } from "./planDto";

export function mapPlanDetailDto(dto: PlanDetailDto): PlanDetail {
  return {
    id: dto.id,
    clientId: dto.client_id,
    name: dto.name,
    fields: dto.fields,
    rules: dto.rules,
    updatedAt: dto.updated_at,
  };
}
