const form = document.getElementById("weatherForm");
const resultDiv = document.getElementById("weatherResult");
const chartCanvas = document.getElementById("weatherChart").getContext("2d");
let weatherChart = null; // Variable para almacenar la instancia del gráfico

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const apiKey = "d49f768bd5ea4f249972455f214cadfe";
  const cityInput = document.getElementById("cityInput").value.trim();

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
      if (!response.ok) throw new Error(`City "${city}" not found`);
      return response.json();
    });

    const weatherData = await Promise.allSettled(weatherPromises);
    const validCities = [];
    const temperatures = [];
    const cityCards = weatherData.map((result, index) => {
      if (result.status === "fulfilled") {
        const data = result.value;
        validCities.push(data.name);
        temperatures.push(data.main.temp);
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


    resultDiv.innerHTML = cityCards.join("");
    if (validCities.length > 0) {
      updateChart(validCities, temperatures);
    }
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-danger">An error occurred while fetching weather data.</div>`;
  }
});

//barras
function updateChart(cities, temperatures) {
  if (weatherChart) {
    weatherChart.destroy(); 
  }

  weatherChart = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: cities,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temperatures,
          backgroundColor: cities.map(() => getRandomColor()),
          borderColor: "#333",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

// Función para generar colores aleatorios
function getRandomColor() {
  return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
    Math.random() * 255
  )}, ${Math.floor(Math.random() * 255)}, 0.7)`;
}
