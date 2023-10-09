import * as fs from 'fs'
import { IFeatureCollection } from './model/geojson'

const result: IFeatureCollection[] = []
for (const filename of fs.readdirSync('.data')) {
    if (filename.endsWith('.geojson')) {
        console.info(`found file: ${filename}`)
        const json: IFeatureCollection = JSON.parse(fs.readFileSync(`.data/${filename}`, { encoding: "utf8" }))
        const feature = json.features[0]
        feature.properties = feature.properties || { source: { filename: filename } }
        result.push(json)
    }
}
fs.writeFileSync('dist/data.json', JSON.stringify(result))
