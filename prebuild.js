
// Remove 'line-bot-server' directory from the target of 'next build'
const fs = require('fs')
const path = require('path')

const linebotServerDirPath = path.join(__dirname, './line-bot-server/src/')
const r2DirPath = path.join(__dirname, './r2/')

// A leftover '.next' makes 'next build' fail while prerendering with
// "TypeError: Cannot read properties of undefined (reading 'call')" thrown from
// .next/server/webpack-runtime.js: the restored build references server chunks
// that the current compilation no longer emits. Always start from a clean
// output directory so the export step sees a consistent set of chunks.
const nextDirPath = path.join(__dirname, './.next/')

const removePath = (target) => {
    // Synchronous on purpose: 'next build' must not start until these are gone.
    fs.rmSync(target, { recursive: true, force: true })
    console.log(`${target} was removed before the build.`)
}

removePath(linebotServerDirPath)
removePath(r2DirPath)
removePath(nextDirPath)
