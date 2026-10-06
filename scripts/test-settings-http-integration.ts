import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { JwtService } from "@nestjs/jwt";

const TEST_JWT_SECRET = "local-settings-integration-test-secret-not-for-production";

function requireDisposableDatabaseUrl(raw: string | undefined): string {
  if (!raw) throw new Error("Set SETTINGS_TEST_DATABASE_URL to a dedicated local test database; production database URLs are not accepted.");
  const url = new URL(raw);
  const database = decodeURIComponent(url.pathname.replace(/^\//, "").split("/")[0] || "");
  if (url.protocol !== "mysql:" || !["localhost", "127.0.0.1"].includes(url.hostname) || !/(test|integration)/i.test(database)) {
    throw new Error("Refusing Settings integration tests unless the URL is MySQL on localhost with a database name containing 'test' or 'integration'.");
  }
  return raw;
}

async function main() {
  const databaseUrl = requireDisposableDatabaseUrl(process.env.SETTINGS_TEST_DATABASE_URL);
  process.env.DATABASE_URL = databaseUrl;
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  const [{ NestFactory }, { AppModule }, { PrismaClient }, { resolveCmsList, shouldRenderCmsList, resolveTestimonialRating }] = await Promise.all([
    import("@nestjs/core"),
    import("../apps/api/dist/modules/app.module.js"),
    import("@prisma/client"),
    import("../apps/web/src/lib/testimonial-data"),
  ]);
  const app = await NestFactory.create(AppModule, { logger: false });
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  const runPrefix = `site.settings-test.${randomUUID()}`;
  const exactLandingKeys = ["site.landing.xayNhaTronGoi", "site.servicePages.thiCongNhaXuong"];

  try {
    await prisma.$connect();
    assert.equal(await prisma.setting.count({ where: { key: { in: exactLandingKeys } } }), 0,
      "The disposable integration database must not contain the exact landing test keys before the test starts.");

    await app.listen(0, "127.0.0.1");
    const address = app.getHttpServer().address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const jwt = new JwtService({ secret: TEST_JWT_SECRET });
    const adminToken = await jwt.signAsync({ sub: 900001, email: "settings-test-admin@invalid.local", roles: ["Admin"] });
    const viewerToken = await jwt.signAsync({ sub: 900002, email: "settings-test-viewer@invalid.local", roles: ["Viewer"] });

    async function request(path: string, options: { method?: string; body?: unknown; token?: string | null } = {}) {
      const headers: Record<string, string> = {};
      if (options.token) headers.Authorization = `Bearer ${options.token}`;
      if (options.body !== undefined) headers["Content-Type"] = "application/json";
      const response = await fetch(`${baseUrl}${path}`, {
        method: options.method || "GET",
        headers,
        ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      });
      const text = await response.text();
      let data: unknown = text;
      try { data = text ? JSON.parse(text) : null; } catch { /* keep response text for useful assertions */ }
      return { status: response.status, data };
    }

    function settings(data: unknown) {
      assert.ok(data && typeof data === "object" && "settings" in data, "Expected a versioned Settings response.");
      return (data as { settings: Record<string, { exists: boolean; value: unknown; updatedAt: string | null }> }).settings;
    }

    function write(key: string, value: unknown, expectedUpdatedAt: string | null) {
      return { key, value, expectedUpdatedAt };
    }

    const baseKey = `${runPrefix}.create`;
    assert.equal((await request(`/api/admin/settings/snapshot?keys=${encodeURIComponent(baseKey)}`, { token: null })).status, 401,
      "Admin Settings snapshot must require authentication.");
    assert.equal((await request(`/api/admin/settings/snapshot?keys=${encodeURIComponent(baseKey)}`, { token: viewerToken })).status, 200,
      "Viewer may read Settings snapshots.");
    assert.equal((await request("/api/admin/settings", { method: "PATCH", token: viewerToken, body: { key: baseKey, value: {}, expectedUpdatedAt: null } })).status, 403,
      "Viewer role must not write Settings.");
    console.log("PASS: HTTP authentication and Admin-only Settings writes");

    const missingVersion = await request("/api/admin/settings", { method: "PATCH", token: adminToken, body: { key: baseKey, value: {} } });
    assert.equal(missingVersion.status, 428, "A missing expectedUpdatedAt must be explicit (428).");
    const invalidVersion = await request("/api/admin/settings", { method: "PATCH", token: adminToken, body: { key: baseKey, value: {}, expectedUpdatedAt: "tomorrow" } });
    assert.equal(invalidVersion.status, 400, "A malformed expectedUpdatedAt must be explicit (400).");
    assert.equal(await prisma.setting.count({ where: { key: baseKey } }), 0, "Invalid writes must not create a row.");
    console.log("PASS: missing/malformed versions rejected without a write");

    const create = await request("/api/admin/settings", { method: "PATCH", token: adminToken, body: write(baseKey, { title: "initial" }, null) });
    assert.equal(create.status, 200);
    let snapshotResponse = await request(`/api/admin/settings/snapshot?keys=${encodeURIComponent(baseKey)}`, { token: adminToken });
    assert.equal(snapshotResponse.status, 200);
    const currentVersion = settings(snapshotResponse.data)[baseKey];
    assert.equal(currentVersion?.exists, true);
    assert.deepEqual(currentVersion?.value, { title: "initial" });
    assert.ok(currentVersion?.updatedAt);
    console.log("PASS: create uses absent-version precondition and returns a new version");

    const originalVersion = currentVersion!.updatedAt!;
    assert.equal((await request("/api/admin/settings", { method: "PATCH", token: adminToken, body: write(baseKey, { title: "session A" }, originalVersion) })).status, 200);
    assert.equal((await request("/api/admin/settings", { method: "PATCH", token: adminToken, body: write(baseKey, { title: "stale session B" }, originalVersion) })).status, 409);
    snapshotResponse = await request(`/api/admin/settings/snapshot?keys=${encodeURIComponent(baseKey)}`, { token: adminToken });
    assert.deepEqual(settings(snapshotResponse.data)[baseKey]?.value, { title: "session A" }, "Stale save must not overwrite the winning value.");
    console.log("PASS: stale session returns 409 and preserves the winning write");

    const concurrentKey = `${runPrefix}.concurrent`;
    assert.equal((await request("/api/admin/settings", { method: "PATCH", token: adminToken, body: write(concurrentKey, { winner: "seed" }, null) })).status, 200);
    snapshotResponse = await request(`/api/admin/settings/snapshot?keys=${encodeURIComponent(concurrentKey)}`, { token: adminToken });
    const concurrentVersion = settings(snapshotResponse.data)[concurrentKey]!.updatedAt!;
    const concurrentWrites = await Promise.all([
      request("/api/admin/settings", { method: "PATCH", token: adminToken, body: write(concurrentKey, { winner: "A" }, concurrentVersion) }),
      request("/api/admin/settings", { method: "PATCH", token: adminToken, body: write(concurrentKey, { winner: "B" }, concurrentVersion) }),
    ]);
    assert.deepEqual(concurrentWrites.map(({ status }) => status).sort(), [200, 409]);
    snapshotResponse = await request(`/api/admin/settings/snapshot?keys=${encodeURIComponent(concurrentKey)}`, { token: adminToken });
    const winningValue = settings(snapshotResponse.data)[concurrentKey]?.value as { winner: string };
    assert.ok(["A", "B"].includes(winningValue.winner));
    console.log("PASS: simultaneous writes yield one success and one conflict");

    const atomicA = `${runPrefix}.batch.a`;
    const atomicB = `${runPrefix}.batch.b`;
    const atomicCreate = await request("/api/admin/settings", {
      method: "PATCH", token: adminToken,
      body: { updates: [write(atomicA, { value: "before" }, null), write(atomicB, { value: "before" }, null)] },
    });
    assert.equal(atomicCreate.status, 200);
    const atomicSnapshot = await request(`/api/admin/settings/snapshot?keys=${encodeURIComponent(`${atomicA},${atomicB}`)}`, { token: adminToken });
    const atomicVersions = settings(atomicSnapshot.data);
    const bUpdatedAt = new Date(new Date(atomicVersions[atomicB]!.updatedAt!).getTime() + 1000);
    await prisma.setting.update({ where: { key: atomicB }, data: { value: { value: "external writer" }, updatedAt: bUpdatedAt } });
    const atomicConflict = await request("/api/admin/settings", {
      method: "PATCH", token: adminToken,
      body: { updates: [write(atomicA, { value: "must rollback" }, atomicVersions[atomicA]!.updatedAt), write(atomicB, { value: "stale" }, atomicVersions[atomicB]!.updatedAt)] },
    });
    assert.equal(atomicConflict.status, 409);
    const afterAtomic = await request(`/api/admin/settings/snapshot?keys=${encodeURIComponent(`${atomicA},${atomicB}`)}`, { token: adminToken });
    const afterAtomicSettings = settings(afterAtomic.data);
    assert.deepEqual(afterAtomicSettings[atomicA]?.value, { value: "before" }, "A batch conflict must roll back earlier writes in the same transaction.");
    assert.deepEqual(afterAtomicSettings[atomicB]?.value, { value: "external writer" });
    console.log("PASS: multi-key Settings save rolls back atomically on stale version");

    const createRaceKey = `${runPrefix}.create-race`;
    assert.equal((await request("/api/admin/settings", { method: "PATCH", token: adminToken, body: write(createRaceKey, { creator: "first" }, null) })).status, 200);
    assert.equal((await request("/api/admin/settings", { method: "PATCH", token: adminToken, body: write(createRaceKey, { creator: "second" }, null) })).status, 409,
      "A stale missing-key snapshot must not upsert over a row created by another session.");
    snapshotResponse = await request(`/api/admin/settings/snapshot?keys=${encodeURIComponent(createRaceKey)}`, { token: adminToken });
    assert.deepEqual(settings(snapshotResponse.data)[createRaceKey]?.value, { creator: "first" });
    console.log("PASS: competing create returns 409 and preserves the first value");

    for (const [index, key] of exactLandingKeys.entries()) {
      assert.equal((await request("/api/admin/settings", {
        method: "PATCH", token: adminToken,
        body: write(key, {
          heroTitle: "Existing title retained",
          hidden: { keep: "keep me", replace: "old" },
          stats: [{ label: "old stat" }],
          testimonials: [{ name: "old CMS entry", quote: "old quote" }],
          canonical: index === 0 ? "/existing-path" : null,
        }, null),
      })).status, 200);
    }
    const landingSnapshots = await request(`/api/admin/settings/snapshot?keys=${encodeURIComponent(exactLandingKeys.join(","))}`, { token: adminToken });
    const landingVersions = settings(landingSnapshots.data);
    const emptyListsBatch = await request("/api/admin/settings", {
      method: "PATCH", token: adminToken,
      body: { updates: exactLandingKeys.map((key) => write(key, { hidden: { replace: "new" }, stats: [], testimonials: [] }, landingVersions[key]!.updatedAt)) },
    });
    assert.equal(emptyListsBatch.status, 200);

    const publicSettings = await request("/api/site-settings");
    assert.equal(publicSettings.status, 200);
    const publicMap = publicSettings.data as Record<string, Record<string, unknown>>;
    for (const [index, key] of exactLandingKeys.entries()) {
      assert.deepEqual(publicMap[key]?.stats, []);
      assert.deepEqual(publicMap[key]?.testimonials, []);
      assert.equal(publicMap[key]?.canonical, index === 0 ? "/existing-path" : null, "Omitted canonical values, including explicit null, must be preserved.");
      assert.equal((publicMap[key]?.hidden as Record<string, unknown>).keep, "keep me", "Deep merge must preserve omitted fields.");
      assert.equal((publicMap[key]?.hidden as Record<string, unknown>).replace, "new");
      assert.equal(publicMap[key]?.heroTitle, "Existing title retained");
    }
    assert.equal(shouldRenderCmsList(resolveCmsList(publicMap[exactLandingKeys[0]!]?.testimonials as unknown[])), false);
    assert.equal(shouldRenderCmsList(resolveCmsList(publicMap[exactLandingKeys[0]!]?.stats as unknown[])), false);
    assert.equal(resolveTestimonialRating(undefined), null);
    console.log("PASS: both service landing keys preserve omitted JSON, expose empty lists and synthesize no testimonial/rating");
    console.log("Settings real-HTTP/real-MySQL integration tests passed.");
  } finally {
    const testKeys = await prisma.setting.findMany({ where: { key: { startsWith: "site.settings-test." } }, select: { key: true } }).catch(() => []);
    if (testKeys.length) await prisma.setting.deleteMany({ where: { key: { in: testKeys.map(({ key }) => key) } } }).catch(() => undefined);
    await prisma.setting.deleteMany({ where: { key: { in: exactLandingKeys } } }).catch(() => undefined);
    await prisma.$disconnect();
    await app.close();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
