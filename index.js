const form = document.getElementById("weatherForm");
const resultDiv = document.getElementById("weatherResult");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const apiKey = "d49f768bd5ea4f249972455f214cadfe";
  const cityInput = document.getElementById("cityInput").value.trim();

  // Validar si el input está vacío
  if (!cityInput) {
    resultDiv.innerHTML =
      '<div class="alert alert-danger">Please enter at least one city name!</div>';
    return;
  }

  // Separar las ciudades por comas, limpiar espacios y eliminar vacíos
  const cities = cityInput
    .split(",")
    .map((city) => city.trim())
    .filter((city) => city !== "");

  // Validar si se ingresó al menos una ciudad válida
  if (cities.length === 0) {
    resultDiv.innerHTML =
      '<div class="alert alert-danger">Invalid input. Please enter valid city names.</div>';
    return;
  }

  resultDiv.innerHTML =
    '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Fetching weather data...</div>';

  try {
    const weatherPromises = cities.map(async (city) => {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`City "${city}" not found`);
      }

      return response.json();
    });

    const weatherData = await Promise.allSettled(weatherPromises);

    const weatherResults = weatherData.map((result, index) => {
      if (result.status === "fulfilled") {
        const data = result.value;
        return `
          <div class="card result-card p-3 mb-3">
            <div class="card-body text-center">
              <h5 class="card-title">${data.name}, ${data.sys.country} <i class="fas fa-map-marker-alt text-info"></i></h5>
              <p class="mb-2"><i class="fas fa-temperature-high text-danger"></i> <strong>${data.main.temp}°C</strong></p>
              <p class="mb-2"><i class="fas fa-cloud text-primary"></i> ${data.weather[0].description}</p>
              <p class="mb-0"><i class="fas fa-tint text-info"></i> Humidity: ${data.main.humidity}%</p>
            </div>
          </div>
        `;
      } else {
        return `<div class="alert alert-warning">${result.reason.message}</div>`;
      }
    });

    // Mostrar los resultados
    resultDiv.innerHTML = weatherResults.join("");
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-danger">An error occurred while fetching weather data.</div>`;
  }
});
