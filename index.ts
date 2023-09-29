// config map
let config = {};
// magnification with which the map will start
const zoom = 10;
// co-ordinates
const lat = 60;
const lng = 30;


// calling map
const map = L.map("map",
    {
        attributionControl: false,
    }
).setView([lat, lng], zoom);

const attributions = [
    '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>',
    'Рендеринг: <a href="https://openrailwaymap.org">OpenRailwayMap</a>, Данные карты &copy; участники OpenStreetMap',
    '&copy; Алексей Горшков'
];

const attributionControl = L.control.attribution({
    prefix: attributions.join(' | ')
    // prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
}).addTo(map);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        opacity: 0.5
    }
).addTo(map);

L.tileLayer(
    // ,
    "https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
    {
        opacity: 0.5,
        //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
).addTo(map);

fetch('/data.json')
    .then(response => response.json())
    .then(data => {
        for (const geojson of data) {
            L.geoJSON(geojson, {}).addTo(map);
        }
    })
    .catch(e => {
        alert("Failed get data.json");
        throw new Error("Failed get data.json")
    });

if (module['hot']) {
    module['hot'].accept();
}

