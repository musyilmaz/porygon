import { describe, expect, it, vi } from "vitest";

vi.mock("@porygon/db", () => {
  const fakeTable = { _: { name: "fake" } };
  return {
    getDb: vi.fn(() => ({})),
    user: fakeTable,
    session: fakeTable,
    account: fakeTable,
    verification: fakeTable,
  };
});

describe("auth", () => {
  it("exports a configured auth instance", async () => {
    const { getAuth } = await import("./auth");
    const auth = getAuth();

    expect(auth).toBeDefined();
    expect(auth.handler).toBeTypeOf("function");
    expect(auth.api.getSession).toBeDefined();
    expect(auth.api.signUpEmail).toBeDefined();
  });
});
