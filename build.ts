import * as fs from 'fs'

fs.mkdirSync("_site")
fs.copyFileSync("index.html", "_site/index.html")

for (const file of fs.readdirSync('.data')) {
    if (file.endsWith('.geojson')) {
        console.info(`found file: ${file}`)
    }
}
