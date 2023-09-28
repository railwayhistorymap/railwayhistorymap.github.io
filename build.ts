import * as fs from 'fs'

fs.mkdirSync("_site")
fs.copyFileSync("index.html", "_site/index.html")
fs.copyFileSync("index.js", "_site/index.js")

const result = []
for (const file of fs.readdirSync('.data')) {
    if (file.endsWith('.geojson')) {
        console.info(`found file: ${file}`)
        const json = JSON.parse(fs.readFileSync(`.data/${file}`, {encoding: "utf8"}))
        result.push(json)
    }
}
fs.writeFileSync('_site/data.json', JSON.stringify(result))
