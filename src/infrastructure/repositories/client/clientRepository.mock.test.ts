import { describe, expect, it } from "vitest";

import { clientRepositoryMock } from "./clientRepository.mock";

describe("clientRepositoryMock", () => {
  it("filters client summaries by name keyword", async () => {
    const clients = await clientRepositoryMock.listClients({ keyword: "星河" });

    expect(clients).toHaveLength(1);
    expect(clients[0]).toEqual(expect.objectContaining({ id: "c3", name: "星河便利店" }));
  });

  it("filters client summaries by phone keyword", async () => {
    const clients = await clientRepositoryMock.listClients({ keyword: "15512880010" });

    expect(clients).toHaveLength(1);
    expect(clients[0]).toEqual(expect.objectContaining({ id: "c12", name: "麦田烘焙" }));
  });

  it("returns empty results without throwing for unmatched keywords", async () => {
    await expect(clientRepositoryMock.listClients({ keyword: "不存在的客户" })).resolves.toEqual(
      [],
    );
  });

  it("preserves developer test markers on list summaries", async () => {
    const clients = await clientRepositoryMock.listClients({ keyword: "客户 A" });

    expect(clients[0]).toEqual(expect.objectContaining({ id: "c1", isDeveloperTest: true }));
  });
});
