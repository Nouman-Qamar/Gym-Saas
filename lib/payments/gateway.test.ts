import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { activeGateway, gatewayIsConfigured } from "./gateway";

const ENV_KEYS = [
  "PAYMENT_GATEWAY",
  "STRIPE_SECRET_KEY",
  "JAZZCASH_MERCHANT_ID",
  "JAZZCASH_PASSWORD",
  "JAZZCASH_INTEGRITY_SALT",
] as const;
const originalEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    originalEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

describe("activeGateway", () => {
  it("defaults to 'off' when PAYMENT_GATEWAY is unset", () => {
    expect(activeGateway()).toBe("off");
  });

  it("recognizes stripe, jazzcash, and easypaisa (case-insensitive)", () => {
    process.env.PAYMENT_GATEWAY = "Stripe";
    expect(activeGateway()).toBe("stripe");
    process.env.PAYMENT_GATEWAY = "JAZZCASH";
    expect(activeGateway()).toBe("jazzcash");
    process.env.PAYMENT_GATEWAY = "easypaisa";
    expect(activeGateway()).toBe("easypaisa");
  });

  it("falls back to 'off' for an unrecognized value", () => {
    process.env.PAYMENT_GATEWAY = "paypal";
    expect(activeGateway()).toBe("off");
  });
});

describe("gatewayIsConfigured", () => {
  it("'off' is never configured", () => {
    expect(gatewayIsConfigured("off")).toBe(false);
  });

  it("stripe needs STRIPE_SECRET_KEY", () => {
    expect(gatewayIsConfigured("stripe")).toBe(false);
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    expect(gatewayIsConfigured("stripe")).toBe(true);
  });

  it("jazzcash needs all three merchant credentials", () => {
    process.env.JAZZCASH_MERCHANT_ID = "MC12345";
    process.env.JAZZCASH_PASSWORD = "pw";
    expect(gatewayIsConfigured("jazzcash")).toBe(false); // missing salt
    process.env.JAZZCASH_INTEGRITY_SALT = "salt123";
    expect(gatewayIsConfigured("jazzcash")).toBe(true);
  });

  it("easypaisa is always reported unconfigured (stub adapter)", () => {
    expect(gatewayIsConfigured("easypaisa")).toBe(false);
  });
});
