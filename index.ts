let config = {};
const zoom = 10;
const lat = 60;
const lng = 30;

const map = L.map("map",
    {
        attributionControl: false,
    }
).setView([lat, lng], zoom);

const attributionControl = L.control.attribution().addTo(map);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>',
        opacity: 0.5
    }
).addTo(map);

L.tileLayer(
    // ,
    "https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
    {
        attribution: 'Рендеринг: <a href="https://openrailwaymap.org">OpenRailwayMap</a>, Данные карты &copy; участники OpenStreetMap',
        opacity: 0.5,
    }
).addTo(map);

fetch('/data.json')
    .then(response => response.json())
    .then(data => {
        for (const geojson of data) {
            L.geoJSON(geojson, {
                attribution: '&copy; Алексей Горшков'
            }).addTo(map);
        }
    })
    .catch(e => {
        alert("Failed get data.json");
        throw new Error("Failed get data.json")
    });

if (module['hot']) {
    module['hot'].accept();
}
