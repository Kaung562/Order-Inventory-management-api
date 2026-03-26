import { dollarsToCents } from "../../src/libs/money";

describe("dollarsToCents", () => {
  it("converts dollars to integer cents", () => {
    expect(dollarsToCents(10)).toBe(1000);
    expect(dollarsToCents(19.99)).toBe(1999);
    expect(dollarsToCents(0.01)).toBe(1);
  });
});
