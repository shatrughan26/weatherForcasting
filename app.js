import { env } from "./env.js";
const searchBtn = document.querySelector("#search-btn");
const searchInput = document.querySelector("#search-input");
const API_Key = env.WETHER_API_KEY;

searchBtn.addEventListener("click", async () => {
    const city = searchInput.value;
    const apiKey = API_Key;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);

    const data = await response.json();

    console.log(data);

    document.querySelector("#temp").innerHTML = `${data.main.temp}°C`;
});

