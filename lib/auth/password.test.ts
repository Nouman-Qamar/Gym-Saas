import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("round-trips: a hashed password verifies against its own plaintext", async () => {
    const hash = await hashPassword("demopass123");
    expect(await verifyPassword("demopass123", hash)).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("demopass123");
    expect(await verifyPassword("wrongpass", hash)).toBe(false);
  });

  it("never stores the plaintext password in the hash", async () => {
    const hash = await hashPassword("demopass123");
    expect(hash).not.toContain("demopass123");
  });

  it("produces a different hash each time (salted)", async () => {
    const a = await hashPassword("demopass123");
    const b = await hashPassword("demopass123");
    expect(a).not.toBe(b);
  });
});
