const form = document.getElementById("weather-form");
const locationInput = document.getElementById("location");
const weatherOutput = document.getElementById("weather-output");
const unitToggle = document.getElementById("unitToggle");
const searchHistoryEl = document.getElementById("search-history");

let unit = "celsius";
let searchHistory = [];

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const location = locationInput.value.trim();
  if (!location) return;
  getWeatherForLocation(location);
});

unitToggle.addEventListener("change", () => {
  unit = unitToggle.checked ? "fahrenheit" : "celsius";
  const lastLocation = locationInput.value.trim();
  if (lastLocation) getWeatherForLocation(lastLocation);
});

searchHistoryEl.addEventListener("click", (e) => {
  if (e.target.tagName === "SPAN") {
    locationInput.value = e.target.textContent;
    form.dispatchEvent(new Event("submit"));
  }
});

async function getWeatherForLocation(query) {
  weatherOutput.innerHTML = "<p>Loading...</p>";
  try {
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const geoRes = await fetch(geocodeUrl, {
      headers: { "User-Agent": "weather-app" },
    });
    const geoData = await geoRes.json();
    if (!geoData.length) throw new Error("Location not found");
    const { lat, lon } = geoData[0];

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=${unit}&timezone=auto`;
    const weatherRes = await fetch(apiUrl);
    const weatherData = await weatherRes.json();

    displayWeather(weatherData, query);
    updateSearchHistory(query);
    // changeBackground(weatherData.daily.weathercode[0]); // Removed
  } catch (err) {
    weatherOutput.innerHTML = `<p style="color: red;">${err.message}</p>`;
  }
}

function displayWeather(data, locationName) {
  const { time, temperature_2m_max, temperature_2m_min, weathercode } = data.daily;
  const unitLabel = unit === "celsius" ? "°C" : "°F";

  // Mapping weather codes to emojis
  const codeToEmoji = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️",
    51: "🌦️", 53: "🌦️", 55: "🌧️",
    56: "🌧️", 57: "🌧️",
    61: "🌧️", 63: "🌧️", 65: "🌧️",
    66: "🌧️", 67: "🌧️",
    71: "🌨️", 73: "🌨️", 75: "❄️", 77: "❄️",
    80: "🌦️", 81: "🌧️", 82: "🌧️",
    85: "❄️", 86: "❄️",
    95: "⛈️", 96: "⛈️", 99: "⛈️"
  };

  let html = `<h2>7-Day Forecast for <strong>${locationName}</strong></h2>`;
  html += `<table><thead><tr>
            <th>Date</th><th>Min Temp (${unitLabel})</th><th>Max Temp (${unitLabel})</th><th>Weather</th>
          </tr></thead><tbody>`;

  for (let i = 0; i < time.length; i++) {
    const emoji = codeToEmoji[weathercode[i]] || "❔";
    html += `<tr>
               <td>${time[i]}</td>
               <td>${temperature_2m_min[i]}</td>
               <td>${temperature_2m_max[i]}</td>
               <td>${emoji}</td>
             </tr>`;
  }

  html += "</tbody></table>";
  weatherOutput.innerHTML = html;
}

function updateSearchHistory(location) {
  if (!searchHistory.includes(location)) {
    searchHistory.unshift(location);
    if (searchHistory.length > 5) searchHistory.pop();
  }

  searchHistoryEl.innerHTML = searchHistory
    .map(loc => `<span>${loc}</span>`)
    .join("");
}
