import type { MerchantDetail, MerchantSummary } from "@/domain/merchant/Merchant";

import type { MerchantDetailDto, MerchantSummaryDto } from "./merchantDto";

export function mapMerchantSummaryDto(dto: MerchantSummaryDto): MerchantSummary {
  return { id: dto.id, name: dto.name, city: dto.city };
}

export function mapMerchantDetailDto(dto: MerchantDetailDto): MerchantDetail {
  return { ...mapMerchantSummaryDto(dto), fields: dto.fields };
}
