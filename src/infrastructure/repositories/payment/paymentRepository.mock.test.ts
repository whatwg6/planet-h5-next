import { describe, expect, it } from "vitest";

import { paymentRepositoryMock } from "./paymentRepository.mock";

describe("paymentRepositoryMock", () => {
  it("lists enabled and disabled payment methods for a client", async () => {
    const methods = await paymentRepositoryMock.listPaymentMethods("client-mc");

    expect(methods.map((method) => method.id)).toEqual(["mc-card", "external-card"]);
    expect(methods.some((method) => method.enabled)).toBe(true);
    expect(methods.some((method) => !method.enabled)).toBe(true);
  });
});
