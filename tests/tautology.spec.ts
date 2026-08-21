import { describe, test, expect } from "vitest";

describe("Tautology Test", () => {
  test("passes a sanity check", () => {
    expect(1 + 1).toBe(2);
  });

  test("confirms reality is consistent", () => {
    expect(1 + 1).toEqual(2);
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
  });
});
