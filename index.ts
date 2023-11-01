function getCenter() {
    const url = new URL(location.href);
    const zoom = url.searchParams.get('z');
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    return {
        zoom: Number(zoom) || 10,
        lat: Number(lat) || 60,
        lng: Number(lng) || 30,
    }
}

const center = getCenter();

const map = L.map("map",
    {
        attributionControl: false,
    }
).setView([center.lat, center.lng], center.zoom);

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

const osmDataLayer = L.layerGroup([], { attribution: 'Overpass API' });

const osmDataLayerMap = new Map<string, L.Polyline>();

function updateUrl() {
    const url = new URL(location.href);
    url.searchParams.set('z', map.getZoom().toString());

    const center = map.getCenter();
    url.searchParams.set('lat', center.lat.toString());
    url.searchParams.set('lng', center.lng.toString());

    history.replaceState(null, '', url.toString())
}

updateUrl()

function updateOsmRailway() {
    if (map.getZoom() < 10) {
        return;
    }

    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const bbox = [sw.lat, sw.lng, ne.lat, ne.lng].join(', ');

    fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `
            [out:json];

            nwr
                [railway~'abandoned|dismantled|disused|razed|historic']
                (${bbox});
            out geom;
        `
    })
        .then(response => response.json())
        .then((data: OverpassResponse) => {
            const usedKeys = new Set<string>();

            const wayElements = data.elements.filter(e => e.type == 'way').map(e => e as OverpassWayElement);

            for (let element of wayElements) {
                const key = `${element.type}_${element.id}`
                usedKeys.add(key);

                if (osmDataLayerMap.has(key)) {
                    continue;
                }

                let popup = `<h4>${element?.tags?.name ?? 'way #' + element.id}</h4>`;
                popup += `<ul>`
                popup += `<li><b>id</b>: <a href="https://www.openstreetmap.org/way/${element.id}" target="blank">way ${element.id}</a></li>`
                for (let tagName in (element?.tags || {})) {
                    popup += `<li><b>${tagName}</b>: ${element.tags[tagName]}</li>`
                }
                popup += `</ul>`

                const polyline = L.polyline(
                    element.geometry.map(geom => L.latLng(geom.lat, geom.lon)),
                    {
                        color: 'magenta',
                    }
                )
                    .bindPopup(popup)
                    .addTo(osmDataLayer);

                osmDataLayerMap.set(key, polyline);
            }

            for (let key of osmDataLayerMap.keys()) {
                if (!usedKeys.has(key)) {
                    const oldLayer = osmDataLayerMap.get(key);
                    oldLayer?.removeFrom(map);
                    osmDataLayerMap.delete(key);
                }
            }
        });
}

updateOsmRailway()

const $toggleOsmRailwayButton = document.getElementById("toggle-osm-railway")!!
$toggleOsmRailwayButton?.addEventListener('click', (e) => toggleOsmRailway())

function toggleOsmRailway() {
    if (map.hasLayer(osmDataLayer)) {
        map.removeLayer(osmDataLayer);
        $toggleOsmRailwayButton.textContent = "Включить отрисовку OSM"
    } else {
        map.addLayer(osmDataLayer);
        $toggleOsmRailwayButton.textContent = "Отключить отрисовку OSM"
    }
}

toggleOsmRailway();

map.addEventListener('moveend', (e) => updateUrl());

map.addEventListener('moveend', (e) => updateOsmRailway());

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
    type: string;
}

interface IFeature extends IGeoJson {
    type: 'Feature'
    properties?: {
        name?: string
        source?: {
            filename?: string
        }
    }
    geometry: any
}

interface OverpassElement {
    type: string
    id: number
    tags?: any
}

interface OverpassWayElement extends OverpassElement {
    type: 'way'
    geometry: [{
        lat: number
        lon: number
    }]
}

interface OverpassResponse {
    elements: OverpassElement[]
}

interface IFeatureCollection extends IGeoJson {
    type: 'FeatureCollection'
    features: IFeature[]
}