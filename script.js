const form = document.getElementById("location-form");
const spinner = document.getElementById("spinner");
const weatherContainer = document.getElementById("weather-data");
const downloadBtn = document.getElementById("downloadBtn");

// GSAP Animations
gsap.to("header", { opacity: 1, duration: 1 });
gsap.to("form", { opacity: 1, duration: 1, delay: 0.5 });

// Weather icon mapping
const weatherIcons = {
    0: "☀️ Clear sky",
    1: "🌤️ Mostly clear",
    2: "⛅ Partly cloudy",
    3: "☁️ Overcast",
    45: "🌫️ Fog",
    48: "🌫️ Fog with frost",
    51: "🌦️ Light drizzle",
    53: "🌦️ Moderate drizzle",
    55: "🌧️ Dense drizzle",
    56: "🌧️ Freezing light drizzle",
    57: "🌧️ Freezing heavy drizzle",
    61: "🌦️ Light rain",
    63: "🌧️ Moderate rain",
    65: "🌧️ Heavy rain",
    66: "🌧️ Freezing light rain",
    67: "🌧️ Freezing heavy rain",
    71: "🌨️ Light snow",
    73: "🌨️ Moderate snow",
    75: "❄️ Heavy snow",
    77: "❄️ Snow grains",
    80: "🌦️ Rain showers (light)",
    81: "🌧️ Rain showers (moderate)",
    82: "🌧️ Rain showers (violent)",
    85: "🌨️ Snow showers (light)",
    86: "🌨️ Snow showers (heavy)",
    95: "⛈️ Thunderstorm (light)",
    96: "⛈️ Thunderstorm + hail (moderate)",
    99: "⛈️ Thunderstorm + hail (severe)"
  };
  

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = document.getElementById("locationQuery").value.trim();
  if (!query) return;

  spinner.style.display = "block";
  weatherContainer.innerHTML = "";
  downloadBtn.style.display = "none";

  try {
    const geoData = await geocodeLocation(query);
    const weatherData = await fetchWeather(geoData.lat, geoData.lon);
    renderWeather(weatherData, geoData.displayName);
  } catch (error) {
    weatherContainer.innerHTML = `<p>❌ ${error.message}</p>`;
  } finally {
    spinner.style.display = "none";
  }
});

async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "WeatherApp/1.0" } });
  const data = await res.json();
  if (!data.length) throw new Error("Location not found");
  return {
    lat: data[0].lat,
    lon: data[0].lon,
    displayName: data[0].display_name
  };
}

async function fetchWeather(lat, lon) {
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error("Weather data unavailable");
  return res.json();
}

function renderWeather(data, locationName) {
  const current = data.current_weather;
  const daily = data.daily;

  const icon = weatherIcons[current.weathercode] || "❓";

  const html = `
    <h2>${locationName}</h2>
    <h3>Now: ${icon}</h3>
    <p><strong>Temperature:</strong> ${current.temperature}°C</p>
    <p><strong>Wind:</strong> ${current.windspeed} km/h</p>
    
    <h3>📅 Daily Forecast</h3>
    <table>
      <tr><th>Date</th><th>Min (°C)</th><th>Max (°C)</th><th>Weather</th></tr>
      ${daily.time.map((date, i) => `
        <tr>
          <td>${date}</td>
          <td>${daily.temperature_2m_min[i]}</td>
          <td>${daily.temperature_2m_max[i]}</td>
          <td>${weatherIcons[daily.weathercode[i]] || '❓'}</td>
        </tr>`).join("")}
    </table>
  `;

  weatherContainer.innerHTML = html;
  gsap.to(".weather-data", { opacity: 1, scale: 1, duration: 0.5 });

  // JSON download link
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBtn.href = URL.createObjectURL(blob);
  downloadBtn.style.display = 'inline-block';
}
