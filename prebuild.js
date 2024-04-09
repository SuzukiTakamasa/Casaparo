
// Remove 'line-bot-server' directory from the target of 'next build'
const fs = require('fs-extra')
const path = require('path')

const lineborServerDirPath = path.join(__dirname, './line-bot-server/src/')
const r2DirPath = path.join(__dirname, './r2/src/')

fs.remove(lineborServerDirPath, e => {
    if (e) return console.error(e)
    console.log(`${lineborServerDirPath} was removed before the build.`)
})

fs.remove(r2DirPath, e => {
    if (e) return console.error(e)
    console.log(`${r2DirPath} was removed before the build.`)
})