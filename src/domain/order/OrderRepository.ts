import type { ClientMemberOrderItem, ClientOrderDetail, ClientOrderQuery } from "./Order";

export type OrderRepository = {
  getClientOrderDetail(query: ClientOrderQuery): Promise<ClientOrderDetail>;
  listClientMemberOrders(query: ClientOrderQuery): Promise<ClientMemberOrderItem[]>;
};
