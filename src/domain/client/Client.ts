export type ClientSummary = {
  id: string;
  name: string;
  phone?: string;
  updatedAt?: string;
};

export type ClientDetail = ClientSummary & {
  fields: Record<string, string>;
  planIds: string[];
};

export type ClientListParams = {
  keyword?: string;
};

export type UpdateClientInput = {
  clientId: string;
  values: Record<string, string>;
};
