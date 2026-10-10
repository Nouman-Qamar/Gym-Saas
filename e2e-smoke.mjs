// Run against a dev server on port 3100 (so it doesn't collide with a
// normal `npm run dev` on 3000): `next dev -p 3100` in one terminal, then
// `npm run test:e2e` (or `node e2e-smoke.mjs`) in another. Needs the demo
// seed data (`npm run db:seed`) — it signs in as admin/trainer/member/
// platform-owner and walks every page.
import { chromium } from "playwright";

const BASE = "http://localhost:3100";
const results = [];
function log(name, ok, extra = "") {
  results.push({ name, ok, extra });
  console.log(`${ok ? "✅" : "❌"} ${name}${extra ? " — " + extra : ""}`);
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("pageerror", (err) => log("console pageerror", false, err.message));
page.on("response", (res) => {
  if (res.status() >= 500) log(`HTTP ${res.status()} on ${res.url()}`, false);
});

async function shot(name) {
  await page.screenshot({ path: `/tmp/shots/${name}.png`, fullPage: true });
}

try {
  // Landing page
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  log("landing loads", (await page.title()).includes("Ironline"));
  await shot("01-landing");

  // Login as admin
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', "admin@demo.gym");
  await page.fill('input[name="password"]', "demopass123");
  await Promise.all([page.waitForURL("**/admin/dashboard"), page.click('button[type="submit"]')]);
  log("admin login -> dashboard", page.url().includes("/admin/dashboard"));
  await shot("02-admin-dashboard");

  await page.goto(BASE + "/admin/members", { waitUntil: "networkidle" });
  log("admin members page loads", await page.locator("text=Members").first().isVisible());
  await shot("03-admin-members");

  await page.goto(BASE + "/admin/payments", { waitUntil: "networkidle" });
  await shot("04-admin-payments");
  await page.goto(BASE + "/admin/attendance", { waitUntil: "networkidle" });
  await shot("05-admin-attendance");
  await page.goto(BASE + "/admin/trainers", { waitUntil: "networkidle" });
  await shot("06-admin-trainers");
  await page.goto(BASE + "/admin/workouts", { waitUntil: "networkidle" });
  await shot("07-admin-workouts");
  await page.goto(BASE + "/admin/announcements", { waitUntil: "networkidle" });
  await shot("08-admin-announcements");
  await page.goto(BASE + "/admin/reports", { waitUntil: "networkidle" });
  await shot("09-admin-reports");
  await page.goto(BASE + "/admin/settings", { waitUntil: "networkidle" });
  await shot("10-admin-settings");
  log("admin section pages all loaded", true);

  // logout
  await page.click('button[title="Log out"]');
  await page.waitForURL("**/login");
  log("admin logout -> login", true);

  // Login as trainer
  await page.fill('input[name="email"]', "trainer@demo.gym");
  await page.fill('input[name="password"]', "demopass123");
  await Promise.all([page.waitForURL("**/trainer/dashboard"), page.click('button[type="submit"]')]);
  log("trainer login -> dashboard (Ember theme expected)", true);
  await shot("11-trainer-dashboard");

  await page.goto(BASE + "/trainer/members", { waitUntil: "networkidle" });
  await shot("12-trainer-members");
  await page.goto(BASE + "/trainer/workouts", { waitUntil: "networkidle" });
  await shot("13-trainer-workouts");

  // open first plan if present
  const firstPlanLink = page.locator('a[href^="/trainer/workouts/"]').first();
  if (await firstPlanLink.count()) {
    await firstPlanLink.click();
    await page.waitForLoadState("networkidle");
    log("trainer plan detail loads", true);
    await shot("14-trainer-plan-detail");
  }

  await page.goto(BASE + "/trainer/schedule", { waitUntil: "networkidle" });
  await shot("15-trainer-schedule");
  await page.goto(BASE + "/trainer/progress", { waitUntil: "networkidle" });
  await shot("16-trainer-progress");
  await page.goto(BASE + "/trainer/messages", { waitUntil: "networkidle" });
  await shot("17-trainer-messages");
  await page.goto(BASE + "/trainer/profile", { waitUntil: "networkidle" });
  await shot("18-trainer-profile");
  log("trainer section pages all loaded", true);

  await page.click('button[title="Log out"]');
  await page.waitForURL("**/login");

  // Login as member
  await page.fill('input[name="email"]', "member@demo.gym");
  await page.fill('input[name="password"]', "demopass123");
  await Promise.all([page.waitForURL("**/member/dashboard"), page.click('button[type="submit"]')]);
  log("member login -> dashboard", true);
  await shot("19-member-dashboard");

  await page.goto(BASE + "/member/workouts", { waitUntil: "networkidle" });
  await shot("20-member-workouts");
  await page.goto(BASE + "/member/classes", { waitUntil: "networkidle" });
  await shot("21-member-classes");
  await page.goto(BASE + "/member/progress", { waitUntil: "networkidle" });
  await shot("22-member-progress");
  await page.goto(BASE + "/member/community", { waitUntil: "networkidle" });
  await shot("23-member-community");
  await page.goto(BASE + "/member/messages", { waitUntil: "networkidle" });
  await shot("24-member-messages");
  await page.goto(BASE + "/member/checkin", { waitUntil: "networkidle" });
  await shot("25-member-checkin");
  await page.goto(BASE + "/member/profile", { waitUntil: "networkidle" });
  await shot("26-member-profile");
  log("member section pages all loaded", true);

  // Onboarding page visual check (won't submit, just visual since demo user already onboarded)
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await shot("27-landing-again");

  // Member layout has no visible desktop logout button (mobile tab bar
  // only) — clear the session directly so the auth-page checks below see a
  // signed-out browser, same as a real visitor would be.
  await page.context().clearCookies();

  // ── Forgot / reset password ─────────────────────────────────────────
  await page.goto(BASE + "/forgot-password", { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', "admin@demo.gym");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(500);
  log(
    "forgot-password shows a confirmation (doesn't reveal whether the email exists)",
    /check your email|sent/i.test(await page.locator("body").innerText())
  );
  await shot("28-forgot-password-sent");
  // The reset link itself is only ever delivered via email/console-log (no
  // token is exposed to the browser), so the reset-password/[token] page is
  // covered separately by hitting it with a syntactically-valid but unknown
  // token and confirming it degrades gracefully rather than crashing.
  await page.goto(BASE + "/reset-password/deadbeef00000000000000000000000000000000000000000000000000dead", {
    waitUntil: "networkidle",
  });
  log("reset-password page with an invalid/expired token doesn't crash", (await page.title()).length > 0);
  await shot("29-reset-password-invalid-token");

  // ── Platform-owner console (separate auth track from gym staff) ─────
  await page.goto(BASE + "/platform/login", { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', "owner@ironline.app");
  await page.fill('input[name="password"]', "demopass123");
  await Promise.all([page.waitForURL("**/platform/dashboard"), page.click('button[type="submit"]')]);
  await page.waitForLoadState("networkidle");
  log("platform owner login -> dashboard", page.url().includes("/platform/dashboard"));
  await shot("30-platform-dashboard");

  const firstGymLink = page.locator('a[href^="/platform/gyms/"]').first();
  if (await firstGymLink.count()) {
    // Client-side Link navigation here — wait on the URL itself (like the
    // login steps above do) rather than networkidle, which can settle
    // before the RSC transition actually lands.
    await Promise.all([page.waitForURL("**/platform/gyms/**"), firstGymLink.click()]);
    await page.waitForLoadState("networkidle");
    log("platform gym detail page loads", page.url().includes("/platform/gyms/"));
    await shot("31-platform-gym-detail");
  } else {
    log("platform gym detail page loads", false, "no gym card found on dashboard");
  }

  // An unauthenticated hit on a protected platform route must bounce to
  // /platform/login, never leak gym data — and gym-staff routes must stay
  // separately protected from the platform-owner session. Both session
  // cookies are httpOnly, so they can only be cleared at the browser-context
  // level (document.cookie can't touch them, and that's the point).
  await page.context().clearCookies();
  await page.goto(BASE + "/platform/dashboard", { waitUntil: "networkidle" });
  log("unauthenticated /platform/dashboard redirects to /platform/login", page.url().includes("/platform/login"));

  await page.goto(BASE + "/admin/dashboard", { waitUntil: "networkidle" });
  log("unauthenticated /admin/dashboard redirects to /login", page.url().includes("/login"));
} catch (e) {
  log("FATAL", false, e.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) {
  console.log("Failures:", failed);
  process.exit(1);
}
