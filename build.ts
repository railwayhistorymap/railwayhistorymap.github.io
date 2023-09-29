import * as fs from 'fs'

const result: any[] = []
for (const file of fs.readdirSync('.data')) {
    if (file.endsWith('.geojson')) {
        console.info(`found file: ${file}`)
        const json = JSON.parse(fs.readFileSync(`.data/${file}`, {encoding: "utf8"}))
        result.push(json)
    }
}
fs.writeFileSync('dist/data.json', JSON.stringify(result))
