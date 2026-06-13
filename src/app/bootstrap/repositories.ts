import { clientRepositoryMock } from "@/infrastructure/repositories/client/clientRepository.mock";
import { merchantRepositoryMock } from "@/infrastructure/repositories/merchant/merchantRepository.mock";
import { planRepositoryMock } from "@/infrastructure/repositories/plan/planRepository.mock";

export const repositories = {
  clientRepository: clientRepositoryMock,
  merchantRepository: merchantRepositoryMock,
  planRepository: planRepositoryMock,
};
