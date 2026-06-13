import type { ClientDetail, ClientSummary } from "@/domain/client/Client";

import type { ClientDetailDto, ClientSummaryDto } from "./clientDto";

export function mapClientSummaryDto(dto: ClientSummaryDto): ClientSummary {
  return { id: dto.id, name: dto.name, phone: dto.phone, updatedAt: dto.updated_at };
}

export function mapClientDetailDto(dto: ClientDetailDto): ClientDetail {
  return { ...mapClientSummaryDto(dto), fields: dto.fields, planIds: dto.plan_ids };
}
