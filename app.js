import { env } from "./env.js";

const searchBtn = document.querySelector("#search-btn");
const searchInput = document.querySelector("#search-input");
const forecastList = document.querySelector("#forecast-list");

const API_Key = env.WETHER_API_KEY;

const map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const nearbyCities = [
  "Delhi",
  "Mumbai",
  "Jaipur",
  "Lucknow",
  "Bhopal",
  "Ahmedabad",
  "Indore",
];

searchBtn.addEventListener("click", async () => {

  const city = searchInput.value;

  const url =
  `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_Key}&units=metric`;

  const response = await fetch(url);

  const data = await response.json();

  document.querySelector("#temp").innerHTML =
  `${data.main.temp}°C`;

  const geoUrl =
  `https://nominatim.openstreetmap.org/search?format=json&q=${city}`;

  const geoResponse = await fetch(geoUrl);

  const geoData = await geoResponse.json();

  const lat = geoData[0].lat;
  const lon = geoData[0].lon;

  map.setView([lat, lon], 10);

  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(city)
    .openPopup();

  const cityWeather = [];

  for (const cityName of nearbyCities) {

    const cityUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_Key}&units=metric`;

    const cityResponse = await fetch(cityUrl);

    const cityData = await cityResponse.json();

    cityWeather.push({
      city: cityName,
      temp: cityData.main.temp,
    });
  }

  cityWeather.sort((a,b) => b.temp - a.temp);

  const topFive = cityWeather.slice(0,5);

  const cityList = document.querySelector("#city-list");

  cityList.innerHTML = "";

  topFive.forEach(city => {

    cityList.innerHTML += `
      <li>
        ${city.city} - ${city.temp}°C
      </li>
    `;
  });

  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_Key}&units=metric`;

  const forecastResponse = await fetch(forecastUrl);
  const forecastData = await forecastResponse.json();
  console.log(forecastData);

  forecastList.innerHTML = "";

  const dailyForecast = forecastData.list.filter(item => {
    return item.dt_txt.includes("12:00:00")
  });

  dailyForecast.forEach(day => {
    const date = new Date(day.dt_txt);
    const temp = day.main.temp;

    forecastList.innerHTML += `
      <div class="forecast-card">

            <h5>
                ${date.toLocaleDateString("en-US", {
                    weekday: "short"
                })}
            </h5>

            <p>${temp}°C</p>

        </div>
    `;
  });

});