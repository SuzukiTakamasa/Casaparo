// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("R2 worker", () => {
  it("returns 404 when the requested object does not exist (unit style)", async () => {
    const request = new IncomingRequest("http://example.com/missing-object");
    // Create an empty context to pass to `worker.fetch()`.
    const ctx = createExecutionContext();
    const testEnv = { ...env, R2_WORKER_HOST: "http://localhost:8787" };
    const response = await worker.fetch(request, testEnv, ctx);
    // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Not found: null; key name: missing-object");
  });

  it("returns 404 when the requested object does not exist (integration style)", async () => {
   const response = await SELF.fetch("https://example.com/missing-object");
   expect(response.status).toBe(404);
   expect(await response.text()).toBe("Not found: null; key name: missing-object");
 });
});
