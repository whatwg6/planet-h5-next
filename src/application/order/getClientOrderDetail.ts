import type { ClientOrderQuery } from "@/domain/order/Order";
import type { OrderRepository } from "@/domain/order/OrderRepository";

export function getClientOrderDetail(repository: OrderRepository, query: ClientOrderQuery) {
  if (!query.clientId.trim()) return Promise.reject(new Error("clientId is required"));
  if (!query.planId.trim()) return Promise.reject(new Error("planId is required"));
  return repository.getClientOrderDetail(query);
}
