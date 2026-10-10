import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createJazzCashCheckout, verifyJazzCashReturn } from "./jazzcash";

const ENV_KEYS = ["JAZZCASH_MERCHANT_ID", "JAZZCASH_PASSWORD", "JAZZCASH_INTEGRITY_SALT"] as const;
const originalEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) originalEnv[key] = process.env[key];
  process.env.JAZZCASH_MERCHANT_ID = "MC12345";
  process.env.JAZZCASH_PASSWORD = "testpass";
  process.env.JAZZCASH_INTEGRITY_SALT = "testsalt123";
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

describe("createJazzCashCheckout", () => {
  it("throws a clear error when merchant credentials are missing", async () => {
    delete process.env.JAZZCASH_INTEGRITY_SALT;
    await expect(
      createJazzCashCheckout({
        paymentId: "pay_1",
        amountCents: 500000,
        currency: "PKR",
        description: "Membership renewal",
        customerEmail: "a@b.com",
        customerName: "Test User",
      })
    ).rejects.toThrow(/not configured|isn't configured/i);
  });

  it("builds a post-form checkout with a computed pp_SecureHash", async () => {
    const result = await createJazzCashCheckout({
      paymentId: "pay_1",
      amountCents: 500000,
      currency: "PKR",
      description: "Membership renewal",
      customerEmail: "a@b.com",
      customerName: "Test User",
    });
    expect(result.kind).toBe("post-form");
    if (result.kind !== "post-form") throw new Error("expected post-form");
    expect(result.fields.pp_MerchantID).toBe("MC12345");
    expect(result.fields.pp_Amount).toBe("500000");
    expect(result.fields.pp_BillReference).toBe("pay_1");
    expect(result.fields.pp_SecureHash).toMatch(/^[0-9A-F]{64}$/); // uppercase hex SHA-256
  });
});

describe("verifyJazzCashReturn", () => {
  it("validates an untampered return payload against its own hash (round trip)", async () => {
    const checkout = await createJazzCashCheckout({
      paymentId: "pay_42",
      amountCents: 900000,
      currency: "PKR",
      description: "VIP plan",
      customerEmail: "a@b.com",
      customerName: "Test User",
    });
    if (checkout.kind !== "post-form") throw new Error("expected post-form");

    // JazzCash's real return carries its own response fields (pp_ResponseCode
    // etc.) hashed together by JazzCash — we don't fabricate that hash here,
    // we only confirm our verifier accepts a payload whose hash it itself
    // would compute, i.e. it's internally consistent and not tautologically
    // broken. `success` is separately gated on pp_ResponseCode === "000",
    // which is absent from our own outbound fields.
    const result = verifyJazzCashReturn(checkout.fields);

    expect(result.valid).toBe(true);
    expect(result.success).toBe(false); // no pp_ResponseCode on the outbound side
    expect(result.paymentId).toBe("pay_42");
  });

  it("rejects a tampered hash", async () => {
    const checkout = await createJazzCashCheckout({
      paymentId: "pay_42",
      amountCents: 900000,
      currency: "PKR",
      description: "VIP plan",
      customerEmail: "a@b.com",
      customerName: "Test User",
    });
    if (checkout.kind !== "post-form") throw new Error("expected post-form");

    // An attacker (or a corrupted redirect) changing the paid amount after
    // the hash was computed must be caught, not silently accepted.
    const tampered = { ...checkout.fields, pp_Amount: "100", pp_ResponseCode: "000" };
    const result = verifyJazzCashReturn(tampered);

    expect(result.valid).toBe(false);
  });

  it("reports invalid when the integrity salt isn't configured", () => {
    delete process.env.JAZZCASH_INTEGRITY_SALT;
    const result = verifyJazzCashReturn({ pp_SecureHash: "ABC", pp_BillReference: "pay_1", pp_ResponseCode: "000" });
    expect(result.valid).toBe(false);
  });
});
