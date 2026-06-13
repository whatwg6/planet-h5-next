import { describe, expect, it } from "vitest";

import { clientRepositoryHttp } from "./clientRepository.http";

describe("clientRepositoryHttp", () => {
  it("maps HTTP list responses through the repository", async () => {
    await expect(clientRepositoryHttp.listClients({ keyword: "HTTP" })).resolves.toEqual([
      expect.objectContaining({ id: "c-http-1", name: "HTTP 客户" }),
    ]);
  });
});
