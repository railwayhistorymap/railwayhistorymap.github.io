const zoom = 10;
const lat = 60;
const lng = 30;

const map = L.map("map",
    {
        attributionControl: false,
    }
).setView([lat, lng], zoom);

const attributionControl = L.control.attribution(
    {
        prefix: `<a href="https://leafletjs.com">&copy; Leaflet</a>`
    }
).addTo(map);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: '<a href="http://openstreetmap.org">&copy; OpenStreetMap</a>',
        opacity: 0.5
    }
).addTo(map);

L.tileLayer(
    "https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
    {
        attribution: '<a href="https://openrailwaymap.org">&copy; OpenRailwayMap</a>',
        opacity: 0.5,
    }
).addTo(map);

const $tableTracks = document.getElementById('tracks') as HTMLTableElement;
const trackRowTemplate = document.querySelector('template#track-row') as HTMLTemplateElement;

fetch('/data.json')
    .then(response => response.json())
    .then((data: IFeatureCollection[]) => {
        const color = 'black'
        let counter = 0;
        for (const geojson of data) {

            let title = `${++counter}. Без названия`;

            const name = geojson.features[0]?.properties?.name
            if (name) {
                title = `${counter}. ${name}`
            }

            const layer = L.geoJSON(geojson, {
                attribution: '&copy; Алексей Горшков',
                style: {
                    color: color
                },
                onEachFeature(feature, layer) {
                    layer.bindTooltip(title);
                },
            }).addTo(map);

            const $tr = trackRowTemplate.content.cloneNode(true) as HTMLTableRowElement
            const $title = $tr.querySelector('td.title') as HTMLTableCellElement;
            const $buttonGo = $tr.querySelector('.go')
            $buttonGo?.addEventListener('click', () => {
                map.panInsideBounds(layer.getBounds(), { animate: true });

                layer.setStyle({ color: 'red' });

                setTimeout(() => layer.setStyle({ color: color }), 1000)
            });

            $title.textContent = title;

            $tableTracks.tBodies[0].appendChild($tr);
        }
    })
    .catch(e => {
        alert("Failed get data.json");
        throw new Error("Failed get data.json")
    });

interface IGeoJson {
    type: String;
}

interface IFeature extends IGeoJson {
    type: 'Feature'
    properties: {
        name: string
    }
    geometry: any
}

interface IFeatureCollection extends IGeoJson {
    type: 'FeatureCollection'
    features: IFeature[]
}
