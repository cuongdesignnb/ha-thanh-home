import assert from "node:assert/strict";
import { ApiUnavailableError, getDetail } from "./api";

const realFetch = globalThis.fetch;
function mockFetch(handler: () => Promise<Response>) {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    return handler();
  }) as typeof fetch;
  return () => calls;
}

async function main() {
  // A missing record is a real not-found.
  let calls = mockFetch(async () => new Response('{"message":"Not found"}', { status: 404 }));
  assert.equal(await getDetail("/posts/khong-ton-tai"), null);
  assert.equal(calls(), 1);

  // A record is returned as before.
  mockFetch(async () => new Response(JSON.stringify({ id: 1, title: "Bài viết", slug: "bai-viet" }), { status: 200 }));
  assert.equal((await getDetail<{ slug: string }>("/posts/bai-viet"))?.slug, "bai-viet");

  // An API that is restarting (connection refused) or failing (5xx) is retried once, then surfaces as an
  // error instead of a noindex 404.
  calls = mockFetch(async () => {
    throw new TypeError("fetch failed");
  });
  await assert.rejects(getDetail("/posts/bai-viet"), ApiUnavailableError);
  assert.equal(calls(), 2);
  calls = mockFetch(async () => new Response("Bad gateway", { status: 502 }));
  await assert.rejects(getDetail("/posts/bai-viet"), ApiUnavailableError);
  assert.equal(calls(), 2);

  // A blip shorter than the retry delay is absorbed.
  let first = true;
  mockFetch(async () => {
    if (first) {
      first = false;
      throw new TypeError("fetch failed");
    }
    return new Response(JSON.stringify({ id: 1, title: "Bài viết", slug: "bai-viet" }), { status: 200 });
  });
  assert.equal((await getDetail<{ slug: string }>("/posts/bai-viet"))?.slug, "bai-viet");

  globalThis.fetch = realFetch;
  console.log("api-detail: outage vs not-found verified");
}

main();
