
// Remove 'line-bot-server' directory from the target of 'next build'
const fs = require('fs-extra')
const path = require('path')

const dirPath = path.join(__dirname, './line-bot-server/src/')

fs.remove(dirPath, e => {
    if (e) return console.error(e)
    console.log(`${dirPath} was removed before the build.`)
})