// api-server-wasm/build/worker.js
import initWasm, * as wasm from "./index.js";
// Wasm を ES Modules として import（CompiledWasm 指定で Module として渡される）
import wasmModule from "./worker_rust_bg.wasm";

// Cloudflare Workers は top-level await 可
await initWasm(wasmModule);

export default {
  async fetch(request, env, ctx) {
    // Rust 側が export している fetch に委譲
    return wasm.fetch(request, env, ctx);
  },
  // 使っていれば自動で委譲、無ければ 501（undefined 呼び出しを回避）
  async queue(batch, env, ctx) {
    if (typeof wasm.queue === "function") return wasm.queue(batch, env, ctx);
    return new Response("queue not implemented", { status: 501 });
  },
  async scheduled(event, env, ctx) {
    if (typeof wasm.scheduled === "function") {
      return wasm.scheduled(event, env, ctx);
    }
    return new Response("scheduled not implemented", { status: 501 });
  },
};
