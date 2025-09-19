
let _wasm = null;
let _wasmInitializing = null;

async function loadWasm() {
  if (_wasm) return _wasm;
  if (_wasmInitializing) return _wasmInitializing;

  _wasmInitializing = (async () => {
    try {
      // 動的 import してトップレベル評価の副作用を遅延
      const mod = await import("../build/index.js");
      // wasm バイナリを取得して init 関数に渡す（wasm-bindgen の初期化パターンに対応）
      const wasmUrl = new URL("../build/index_bg.wasm", import.meta.url);
      const resp = await fetch(wasmUrl);
      const bytes = await resp.arrayBuffer();

      // デフォルトエクスポートが初期化関数になっているケースに対応
      if (typeof mod.default === "function") {
        await mod.default(bytes);
      } else if (typeof mod.init === "function") {
        await mod.init(bytes);
      }
      _wasm = mod;
      return _wasm;
    } catch (e) {
      console.error("loadWasm failed:", e);
      // 初期化失敗は上位でハンドルできるように再投げ
      throw e;
    } finally {
      _wasmInitializing = null;
    }
  })();

  return _wasmInitializing;
}

function safeCall(fn, args) {
  if (typeof fn !== "function") return null;
  try {
    return fn(...args);
  } catch (e) {
    console.error("wasm call error:", e);
    throw e;
  }
}

export default {
  async fetch(request, env, ctx) {
    const mod = await loadWasm().catch(() => null);
    if (mod) {
      // さまざまなエクスポート配置パターンに対応
      const fn = mod.fetch ?? mod.default?.fetch ?? null;
      if (fn) return await Promise.resolve(safeCall(fn, [request, env, ctx]));
    }
    return new Response("fetch not implemented", { status: 501 });
  },

  async queue(batch, env, ctx) {
    const mod = await loadWasm().catch(() => null);
    if (mod) {
      const fn = mod.queue ?? mod.default?.queue ?? null;
      if (fn) return await Promise.resolve(safeCall(fn, [batch, env, ctx]));
    }
    return new Response("queue not implemented", { status: 501 });
  },

  async scheduled(event, env, ctx) {
    const mod = await loadWasm().catch(() => null);
    if (mod) {
      const fn = mod.scheduled ?? mod.default?.scheduled ?? null;
      if (fn) return await Promise.resolve(safeCall(fn, [event, env, ctx]));
    }
    return new Response("scheduled not implemented", { status: 501 });
  }
}
