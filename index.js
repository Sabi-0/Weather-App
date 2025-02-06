const form = document.getElementById("weatherForm");
const resultDiv = document.getElementById("weatherResult");
const chartCanvas = document.getElementById("weatherChart").getContext("2d");
let weatherChart = null; // Variable para almacenar la instancia del gráfico

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const apiKey = "b53935ed062d87ea3208581c9519246c";
  const cityInput = document.getElementById("cityInput").value.trim();

  if (!cityInput) {
    showError("Please enter at least one city name!");
    return;
  }

  const cities = cityInput
    .split(",")
    .map((city) => city.trim())
    .filter((city) => city !== "");

  if (cities.length === 0) {
    showError("Invalid input. Please enter valid city names.");
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

    if (validCities.length === 0) {
      showError("No valid cities found. Please check your input.");
    } else {
      resultDiv.innerHTML = cityCards.join("");
      updateChart(validCities, temperatures);
    }
  } catch (error) {
    showError(
      "An error occurred while fetching weather data. Please try again."
    );
  }
});

function showError(message) {
  resultDiv.innerHTML = `<div class="alert alert-danger">${message}</div>`;
  clearChart(); // Limpiar gráfico si hay error
}

function updateChart(cities, temperatures) {
  if (weatherChart) {
    weatherChart.destroy(); // Destruir gráfico anterior
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

// limpiar el gráfico cuando hay errores
function clearChart() {
  if (weatherChart) {
    weatherChart.destroy();
    weatherChart = null;
  }
}

// Función para generar colores aleatorios
function getRandomColor() {
  return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
    Math.random() * 255
  )}, ${Math.floor(Math.random() * 255)}, 0.7)`;
}
