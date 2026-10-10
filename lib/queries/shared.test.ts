import { describe, it, expect } from "vitest";
import { formatMoney, initials, timeAgo } from "./shared";

describe("formatMoney", () => {
  it("formats whole-rupee amounts from cents", () => {
    expect(formatMoney(300000)).toBe("Rs. 3,000");
  });

  it("rounds down to whole rupees (no fractional paisa shown)", () => {
    expect(formatMoney(150)).toBe("Rs. 2"); // 1.50 rupees -> displayed rounded
  });

  it("handles zero", () => {
    expect(formatMoney(0)).toBe("Rs. 0");
  });
});

describe("initials", () => {
  it("takes the first letter of the first two words", () => {
    expect(initials("Ayesha Malik")).toBe("AM");
  });

  it("uppercases a single-word name", () => {
    expect(initials("Cher")).toBe("C");
  });

  it("caps at two initials for long names", () => {
    expect(initials("Muhammad Ali Raza Khan")).toBe("MA");
  });
});

describe("timeAgo", () => {
  it("reports 'just now' for the current instant", () => {
    expect(timeAgo(new Date())).toBe("just now");
  });

  it("reports minutes for sub-hour deltas", () => {
    expect(timeAgo(new Date(Date.now() - 5 * 60 * 1000))).toBe("5 min ago");
  });

  it("reports hours for sub-day deltas", () => {
    expect(timeAgo(new Date(Date.now() - 3 * 60 * 60 * 1000))).toBe("3 hr ago");
  });

  it("reports days for sub-month deltas", () => {
    expect(timeAgo(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000))).toBe("4d ago");
  });
});
