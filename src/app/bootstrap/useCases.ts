import { getClientDetail } from "@/application/client/getClientDetail";
import { getClientList } from "@/application/client/getClientList";
import { updateClient } from "@/application/client/updateClient";
import { getMerchantDetail } from "@/application/merchant/getMerchantDetail";
import { getMerchantList } from "@/application/merchant/getMerchantList";
import { getPlanDetail } from "@/application/plan/getPlanDetail";
import { savePlanSettings } from "@/application/plan/savePlanSettings";

import { repositories } from "./repositories";

export const useCases = {
  getClientList: (params: Parameters<typeof getClientList>[1]) => getClientList(repositories.clientRepository, params),
  getClientDetail: (clientId: string) => getClientDetail(repositories.clientRepository, clientId),
  updateClient: (input: Parameters<typeof updateClient>[1]) => updateClient(repositories.clientRepository, input),
  getMerchantList: (params: Parameters<typeof getMerchantList>[1]) => getMerchantList(repositories.merchantRepository, params),
  getMerchantDetail: (merchantId: string) => getMerchantDetail(repositories.merchantRepository, merchantId),
  getPlanDetail: (clientId: string, planId: string) => getPlanDetail(repositories.planRepository, clientId, planId),
  savePlanSettings: (input: Parameters<typeof savePlanSettings>[1]) => savePlanSettings(repositories.planRepository, input),
};
