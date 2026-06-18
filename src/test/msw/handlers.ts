import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/clients", () =>
    HttpResponse.json([{ id: "c-http-1", name: "HTTP 客户", phone: "13800000000", updatedAt: "2026-06-13" }]),
  ),
];
