import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Unit tests for pure/server-side logic (money formatting, password hashing,
// payment-gateway adapters). Component/page-level coverage lives in
// e2e-smoke.mjs (Playwright, run against a live dev server) — these two
// layers are complementary, not overlapping: this file is fast and needs no
// database or browser, e2e-smoke.mjs exercises the real signed-in app.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // Next.js shims this to a no-op at build time; stand in for it here
      // too, see test/server-only-shim.ts.
      "server-only": path.resolve(__dirname, "test/server-only-shim.ts"),
    },
  },
});
