const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");

settingsBtn.addEventListener("click", openSettings);

function openSettings() {
  loadSavedSettings();
  settingsModal.classList.remove("hidden");
}

function closeSettings() {
  settingsModal.classList.add("hidden");
}

function saveSettings() {
  const weatherKey = document.getElementById("weatherApiKey").value;
  const newsKey = document.getElementById("newsApiKey").value;
  const aiKey = document.getElementById("aiApiKey").value;
  const city = document.getElementById("defaultCity").value;

  localStorage.setItem("weatherApiKey", weatherKey);
  localStorage.setItem("newsApiKey", newsKey);
  localStorage.setItem("aiApiKey", aiKey);
  localStorage.setItem("defaultCity", city);

  closeSettings();
}

function loadSavedSettings() {
  document.getElementById("weatherApiKey").value =
    localStorage.getItem("weatherApiKey") || "";

  document.getElementById("newsApiKey").value =
    localStorage.getItem("newsApiKey") || "";

  document.getElementById("aiApiKey").value =
    localStorage.getItem("aiApiKey") || "";

  document.getElementById("defaultCity").value =
    localStorage.getItem("defaultCity") || "Helsinki";
}

async function loadJoke() {
  const jokeContent = document.getElementById("jokeContent");

  jokeContent.innerHTML = "<p class='placeholder-text'>Loading cosmic joke...</p>";

  try {
    const response = await fetch("https://official-joke-api.appspot.com/random_joke");
    const data = await response.json();

    jokeContent.innerHTML = `
      <p class="data-line"><strong>${data.setup}</strong></p>
      <p class="data-line data-soft">${data.punchline}</p>
    `;
  } catch (error) {
    jokeContent.innerHTML = "<p class='data-line'>Could not load a joke.</p>";
  }
}

async function loadCurrency() {
  const currencyContent = document.getElementById("currencyContent");

  currencyContent.innerHTML = "<p class='placeholder-text'>Loading exchange rates...</p>";

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/EUR");

    if (!response.ok) {
      throw new Error("Currency request failed");
    }

    const data = await response.json();

    currencyContent.innerHTML = `
      <p class="data-line"><strong>Base:</strong> EUR</p>
      <p class="data-line"><strong>USD:</strong> ${data.rates.USD.toFixed(2)}</p>
      <p class="data-line"><strong>VND:</strong> ${Math.round(data.rates.VND)}</p>
      <p class="data-line"><strong>SEK:</strong> ${data.rates.SEK.toFixed(2)}</p>
    `;
  } catch (error) {
    currencyContent.innerHTML = `
      <p class="data-line">Could not load exchange rates.</p>
      <p class="data-line data-soft">Please try again later.</p>
    `;
  }
}

async function loadWeather() {
  const weatherContent = document.getElementById("weatherContent");
  const apiKey = localStorage.getItem("weatherApiKey");
  const city = localStorage.getItem("defaultCity") || "Helsinki";

  if (!apiKey) {
    weatherContent.innerHTML = `
      <p class="data-line"><strong>City:</strong> ${city}</p>
      <p class="data-line">No weather API key found.</p>
      <p class="data-line data-soft">Open Settings and add your key.</p>
    `;
    return;
  }

  weatherContent.innerHTML = "<p class='placeholder-text'>Loading weather data...</p>";

  try {
    const url =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      encodeURIComponent(city) +
      "&appid=" +
      apiKey +
      "&units=metric";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const data = await response.json();

    weatherContent.innerHTML = `
      <p class="data-line"><strong>City:</strong> ${data.name}</p>
      <p class="data-line"><strong>Temperature:</strong> ${data.main.temp} °C</p>
      <p class="data-line"><strong>Condition:</strong> ${data.weather[0].description}</p>
      <p class="data-line"><strong>Wind:</strong> ${data.wind.speed} m/s</p>
    `;
  } catch (error) {
    weatherContent.innerHTML = `
      <p class="data-line">Could not load weather data.</p>
      <p class="data-line data-soft">Check the city name or API key.</p>
    `;
  }
}

async function loadNews() {
  const newsContent = document.getElementById("newsContent");

  newsContent.innerHTML = "<p class='placeholder-text'>Loading news signals...</p>";

  try {
    const response = await fetch("https://api.spaceflightnewsapi.net/v4/articles/?limit=3");

    if (!response.ok) {
      throw new Error("News request failed");
    }

    const data = await response.json();
    const articles = data.results;

    if (!articles || articles.length === 0) {
      newsContent.innerHTML = "<p class='data-line'>No news found.</p>";
      return;
    }

    let html = "<ul class='news-list'>";

    for (let i = 0; i < articles.length; i++) {
      html += `
        <li>
          <a href="${articles[i].url}" target="_blank" rel="noopener noreferrer">
            ${articles[i].title}
          </a>
        </li>
      `;
    }

    html += "</ul>";

    newsContent.innerHTML = html;
  } catch (error) {
    newsContent.innerHTML = `
      <p class="data-line">Could not load news.</p>
      <p class="data-line data-soft">Please try again later.</p>
    `;
  }
}

async function sendMessage() {
  const chatInput = document.getElementById("chatInput");
  const chatResponse = document.getElementById("chatResponse");
  const apiKey = localStorage.getItem("aiApiKey");
  const message = chatInput.value.trim();

  if (message === "") {
    chatResponse.textContent = "Please type a message first.";
    return;
  }

  if (!apiKey) {
    chatResponse.textContent = "No AI API key found. Please add it in Settings.";
    return;
  }

  chatResponse.textContent = "Sending message to AI Navigator...";

  try {
    const response = await fetch("https://iip-86-50-229-119.kaj.poutavm.fi/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "qwen3.5:9b",
        stream: false,
        messages: [
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error("AI request failed");
    }

    const data = await response.json();

    if (data.message && data.message.content) {
      chatResponse.textContent = data.message.content;
    } else {
      chatResponse.textContent = "No response from AI Navigator.";
    }

    chatInput.value = "";
  } catch (error) {
    chatResponse.innerHTML = `
      <p class="data-line"><strong>AI Navigator is currently unavailable.</strong></p>
      <p class="data-line data-soft">The course AI server could not be reached. Please try again later.</p>
    `;
  }
}

window.addEventListener("click", function (event) {
  if (event.target === settingsModal) {
    closeSettings();
  }
});

window.addEventListener("DOMContentLoaded", function () {
  loadSavedSettings();
  loadCurrency();
  loadWeather();
  loadNews();
});