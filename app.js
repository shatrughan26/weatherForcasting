import { env } from "./env.js";

const searchBtn = document.querySelector("#search-btn");
const searchInput = document.querySelector("#search-input");
const forecastList = document.querySelector("#forecast-list");
const summary = document.querySelector("#summary");

const API_Key = env.WEATHER_API_KEY;

// Initialize Map
const map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let marker;

// Popular Cities
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
  try {
    const city = searchInput.value.trim();

    if (!city) {
      alert("Please enter a city name");
      return;
    }

    // Current Weather
    const weatherUrl =
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_Key}&units=metric`;

    const weatherResponse = await fetch(weatherUrl);
    const data = await weatherResponse.json();

    if (data.cod != 200) {
      alert("City not found");
      return;
    }

    document.querySelector("#temp").innerHTML =
      `${Math.round(data.main.temp)}°C`;

    // Geocoding for Map
    const geoUrl =
      `https://nominatim.openstreetmap.org/search?format=json&q=${city}`;

    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.length) {
      alert("Location not found");
      return;
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);

    // Move Map
    map.setView([lat, lon], 10);

    if (marker) {
      map.removeLayer(marker);
    }

    marker = L.marker([lat, lon])
      .addTo(map)
      .bindPopup(city)
      .openPopup();

    // Popular Cities
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

    cityWeather.sort((a, b) => b.temp - a.temp);

    const topFive = cityWeather.slice(0, 5);

    const cityList = document.querySelector("#city-list");

    cityList.innerHTML = "";

    topFive.forEach((city) => {
      cityList.innerHTML += `
        <li>
          ${city.city} - ${Math.round(city.temp)}°C
        </li>
      `;
    });

    // Forecast
    const forecastUrl =
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_Key}&units=metric`;

    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    forecastList.innerHTML = "";

    const dailyForecast = forecastData.list.filter(item =>
      item.dt_txt.includes("12:00:00")
    );

    dailyForecast.forEach(day => {
      const date = new Date(day.dt_txt);

      forecastList.innerHTML += `
        <div class="forecast-card">
          <h5>
            ${date.toLocaleDateString("en-US", {
              weekday: "short"
            })}
          </h5>

          <p>${Math.round(day.main.temp)}°C</p>
        </div>
      `;
    });

    // Summary
    const cityTime = new Date(
      Date.now() + (data.timezone * 1000)
    );

    summary.innerHTML = `
      <h3>${data.name}</h3>

      <p>Temperature: ${Math.round(data.main.temp)}°C</p>

      <p>Feels Like: ${Math.round(data.main.feels_like)}°C</p>

      <p>Humidity: ${data.main.humidity}%</p>

      <p>Wind Speed: ${data.wind.speed} m/s</p>

      <p>Condition: ${data.weather[0].description}</p>

      <p>Local Time: ${cityTime.toUTCString()}</p>
    `;

  } catch (error) {
    console.error(error);
    alert("Something went wrong. Check console.");
  }
});