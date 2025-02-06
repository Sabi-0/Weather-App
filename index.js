const form = document.getElementById("weatherForm");
const resultDiv = document.getElementById("weatherResult");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const cityInput = document.getElementById("cityInput").value.trim();
  resultDiv.innerHTML = "";

  if (!cityInput) {
    resultDiv.innerHTML =
      '<div class="alert alert-danger">Please enter at least one city name!</div>';
    return;
  }

  const cities = cityInput
    .split(",")
    .map((city) => city.trim())
    .filter((city) => city !== "");

  if (cities.length === 0) {
    resultDiv.innerHTML =
      '<div class="alert alert-danger">Invalid input. Please enter valid city names!</div>';
    return;
  }

  try {
    const apiKey = "d49f768bd5ea4f249972455f214cadfe";
    let resultsHTML = "";

    for (const city of cities) {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) {
        resultsHTML += `<div class="alert alert-warning">City not found: ${city}</div>`;
        continue;
      }

      const data = await response.json();

      resultsHTML += `
        <div class="card result-card p-3">
          <div class="card-body text-center">
            <h5 class="card-title">${data.name}, ${data.sys.country} <i class="fas fa-map-marker-alt text-info"></i></h5>
            <p class="mb-2"><i class="fas fa-temperature-high text-danger"></i> <strong>${data.main.temp}°C</strong></p>
            <p class="mb-2"><i class="fas fa-cloud text-primary"></i> ${data.weather[0].description}</p>
            <p class="mb-0"><i class="fas fa-tint text-info"></i> Humidity: ${data.main.humidity}%</p>
          </div>
        </div>
      `;
    }

    resultDiv.innerHTML = resultsHTML;
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
});
