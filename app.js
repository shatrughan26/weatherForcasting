import { env } from "./env.js";
const searchBtn = document.querySelector("#search-btn");
const searchInput = document.querySelector("#search-input");
const API_Key = env.WETHER_API_KEY;
const map = L.map('map').setView([20.5937, 78.9629], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


searchBtn.addEventListener("click", async () => {
    const city = searchInput.value;
    const apiKey = API_Key;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);

    const data = await response.json();

    console.log(data);

    document.querySelector("#temp").innerHTML = `${data.main.temp}°C`;

    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${city}`;

    const geoResponse = await fetch(geoUrl);

    const geoData = await geoResponse.json();

    const lat = geoData[0].lat;
    const lon = geoData[0].lon;

    map.setView([lat, lon], 10);

    L.marker([lat,lon]).addTo(map).bindPopup(city).openPopup();


});



