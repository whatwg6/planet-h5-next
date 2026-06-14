import { getClientDetail as getClientDetailFn } from "@/application/client/getClientDetail";
import { getClientList as getClientListFn } from "@/application/client/getClientList";
import { updateClient as updateClientFn } from "@/application/client/updateClient";
import { getMerchantDetail as getMerchantDetailFn } from "@/application/merchant/getMerchantDetail";
import { getMerchantList as getMerchantListFn } from "@/application/merchant/getMerchantList";
import { getPlanDetail as getPlanDetailFn } from "@/application/plan/getPlanDetail";
import { savePlanSettings as savePlanSettingsFn } from "@/application/plan/savePlanSettings";

import { clientRepository, merchantRepository, planRepository } from "./repositories";

export const getClientList = (params: Parameters<typeof getClientListFn>[1]) => getClientListFn(clientRepository, params);
export const getClientDetail = (clientId: string) => getClientDetailFn(clientRepository, clientId);
export const updateClient = (input: Parameters<typeof updateClientFn>[1]) => updateClientFn(clientRepository, input);
export const getMerchantList = (params: Parameters<typeof getMerchantListFn>[1]) => getMerchantListFn(merchantRepository, params);
export const getMerchantDetail = (merchantId: string) => getMerchantDetailFn(merchantRepository, merchantId);
export const getPlanDetail = (clientId: string, planId: string) => getPlanDetailFn(planRepository, clientId, planId);
export const savePlanSettings = (input: Parameters<typeof savePlanSettingsFn>[1]) => savePlanSettingsFn(planRepository, input);
