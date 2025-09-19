import initWasm, * as wasm from "../build/index.js";
import wasmModule from "../build/index_bg.wasm";

try {
  await initWasm(wasmModule);
} catch (e) {
  // 初期化に失敗した場合でも明示的にログを残しておく
  console.error("wasm init failed:", e);
  // init に失敗したら以降の呼び出しで意味のあるエラーレスポンスを返すために続行
}

function invokeIfFunction(fn, args) {
  try {
    if (typeof fn === "function") {
      return fn(...args);
    }
  } catch (e) {
    console.error("wasm invocation error:", e);
    throw e;
  }
  return null;
}

export default {
  async fetch(request, env, ctx) {
    // wasm.fetch が存在すれば呼び出し、なければ 501 を返す
    const result = invokeIfFunction(wasm.fetch, [request, env, ctx])
                 ?? invokeIfFunction(wasm.default?.fetch, [request, env, ctx]);
    if (result !== null) return result;
    return new Response("fetch not implemented", { status: 501 });
  },
  async queue(batch, env, ctx) {
    const result = invokeIfFunction(wasm.queue, [batch, env, ctx])
                 ?? invokeIfFunction(wasm.default?.queue, [batch, env, ctx]);
    if (result !== null) return result;
    return new Response("queue not implemented", { status: 501 });
  },
  async scheduled(event, env, ctx) {
    const result = invokeIfFunction(wasm.scheduled, [event, env, ctx])
                 ?? invokeIfFunction(wasm.default?.scheduled, [event, env, ctx]);
    if (result !== null) return result;
    return new Response("scheduled not implemented", { status: 501 });
  }
}
