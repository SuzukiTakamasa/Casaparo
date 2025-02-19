
// Remove 'line-bot-server' directory from the target of 'next build'
const fs = require('fs-extra')
const path = require('path')

const linebotServerDirPath = path.join(__dirname, './line-bot-server/src/')
const r2DirPath = path.join(__dirname, './r2/')
const webPushDirPath = path.join(__dirname, './web-push/')

const removePath = (path) => {
    fs.remove(path, e => {
        if (e) return console.error(e)
        console.log(`${path} was removed before the build.`)
    })
}

removePath(linebotServerDirPath)
removePath(r2DirPath)
removePath(webPushDirPath)