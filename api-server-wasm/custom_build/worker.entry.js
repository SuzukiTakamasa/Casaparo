let _wasm = null;
let _wasmInitializing = null;

async function loadWasm() {
  if (_wasm) return _wasm;
  if (_wasmInitializing) return _wasmInitializing;

  _wasmInitializing = (async () => {
    try {
      const mod = await import("../build/index.js");
      console.log("imported module keys:", Object.keys(mod));

      // try to load wasm bytes if present
      let bytes = null;
      try {
        const wasmUrl = new URL("../build/index_bg.wasm", import.meta.url);
        const resp = await fetch(wasmUrl);
        if (resp.ok) bytes = await resp.arrayBuffer();
      } catch (e) {
        console.warn("failed to fetch index_bg.wasm:", e);
      }

      // try common init patterns
      if (typeof mod.default === "function") {
        try {
          if (bytes) {
            await mod.default(bytes);
            console.log("initialized via mod.default(bytes)");
          } else {
            await mod.default();
            console.log("initialized via mod.default()");
          }
        } catch (e) {
          console.warn("mod.default init failed, error:", e);
        }
      }

      if (typeof mod.init === "function" && bytes) {
        try {
          await mod.init(bytes);
          console.log("initialized via mod.init(bytes)");
        } catch (e) {
          console.warn("mod.init init failed, error:", e);
        }
      }

      if (typeof mod.__wbindgen_start === "function") {
        try {
          mod.__wbindgen_start();
          console.log("called __wbindgen_start");
        } catch (e) {
          console.warn("__wbindgen_start failed:", e);
        }
      }

      if (typeof mod.start === "function") {
        try {
          await mod.start();
          console.log("called start()");
        } catch (e) {
          console.warn("start() failed:", e);
        }
      }

      _wasm = mod;
      return _wasm;
    } catch (e) {
      console.error("loadWasm failed:", e);
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
    const res = fn(...args);
    return Promise.resolve(res);
  } catch (e) {
    console.error("wasm call error:", e);
    throw e;
  }
}

try {
  // top-level await を利用してモジュールロード時に初期化（Cloudflare Modules は対応）
  await loadWasm()
  console.log("WASM preloaded at module initialization")
} catch (e) {
  console.error("WASM preloading failed at module initialization:", e)
}

export default {
  async fetch(request, env, ctx) {
    const mod = await loadWasm().catch((e) => {
      console.error("loadWasm error in fetch:", e);
      return null;
    });
    if (mod) {
      console.log("module keys at fetch:", Object.keys(mod));
      const fn = mod.fetch ?? mod.default?.fetch ?? null;
      if (fn) return await safeCall(fn, [request, env, ctx]);
    }
    return new Response("fetch not implemented", { status: 501 });
  },
  async queue(batch, env, ctx) {
    const mod = await loadWasm().catch((e) => {
      console.error("loadWasm error in queue:", e);
      return null;
    });
    if (mod) {
      console.log("module keys at queue:", Object.keys(mod));
      const fn = mod.queue ?? mod.default?.queue ?? null;
      if (fn) return await safeCall(fn, [batch, env, ctx]);
    }
    return new Response("queue not implemented", { status: 501 });
  },
  async scheduled(event, env, ctx) {
    const mod = await loadWasm().catch((e) => {
      console.error("loadWasm error in scheduled:", e);
      return null;
    });
    if (mod) {
      console.log("module keys at scheduled:", Object.keys(mod));
      const fn = mod.scheduled ?? mod.default?.scheduled ?? null;
      if (fn) return await safeCall(fn, [event, env, ctx]);
    }
    return new Response("scheduled not implemented", { status: 501 });
  }
}