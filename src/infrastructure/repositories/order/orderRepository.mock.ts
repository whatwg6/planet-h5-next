import type { ClientOrderQuery } from "@/domain/order/Order";
import type { OrderRepository } from "@/domain/order/OrderRepository";
import { memberOrderMockData, orderDetailMockData } from "@/infrastructure/mock/orderMockData";

function formatLocalDate(time: number) {
  const date = new Date(time);
  const pad = (input: number) => input.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function findOrder({ clientId, planId, params }: ClientOrderQuery) {
  return orderDetailMockData.find((item) => {
    if (item.clientId !== clientId || item.planId !== planId) return false;
    if (params.orderNo) return item.orderNo === params.orderNo;
    return item.orderDate === formatLocalDate(params.time);
  });
}

export const orderRepositoryMock: OrderRepository = {
  async getClientOrderDetail(query) {
    const order = findOrder(query);
    if (!order) throw new Error("Order not found");
    return order;
  },
  async listClientMemberOrders(query) {
    const order = findOrder(query);
    if (!order) throw new Error("Order not found");
    return memberOrderMockData[order.id] ?? [];
  },
};
