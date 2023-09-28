// config map
let config = {};
// magnification with which the map will start
const zoom = 10;
// co-ordinates
const lat = 60;
const lng = 30;

// calling map
const map = L.map("map", config).setView([lat, lng], zoom);

// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

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
    })
