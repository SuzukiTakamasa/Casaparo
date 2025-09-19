// api-server-wasm/worker.entry.js
import initWasm, * as wasm from "./build/index.js";
import wasmModule from "./build/index_bg.wasm"; // 生成名が違うなら後述

await initWasm(wasmModule);

export default {
  async fetch(request, env, ctx) {
    return wasm.fetch(request, env, ctx);
  },
  async queue(batch, env, ctx) {
    if (typeof wasm.queue === "function") return wasm.queue(batch, env, ctx);
    return new Response("queue not implemented", { status: 501 });
  },
  async scheduled(event, env, ctx) {
    if (typeof wasm.scheduled === "function") return wasm.scheduled(event, env, ctx);
    return new Response("scheduled not implemented", { status: 501 });
  }
};
