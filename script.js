/**
 * ============================================================================
 * SkyPulse — Professional Weather Dashboard
 * Syntecxhub Internship Project 1
 * 
 * Features:
 * - Live OpenWeatherMap REST API fetching with async/await
 * - Dynamic city search with Enter key & instant click handlers
 * - Geolocation API integration (one-click "My Location")
 * - Dynamic temperature unit toggle (°C / °F) with zero-latency math recalculation
 * - Theme switcher (Dark / Light) with localStorage persistence
 * - Recent search history (last 5 cities) stored in localStorage
 * - In-app API key modal (persisted in localStorage) + script-level fallback
 * - Granular error handling (404 city not found, 401 invalid/pending key, 429 rate limit, network down)
 * - Local time calculation using city's UTC timezone offset
 * ============================================================================
 */

'use strict';

// ----------------------------------------------------------------------------
// 1. Configuration & Constants
// ----------------------------------------------------------------------------
const CONFIG = {
  // If you prefer hardcoding your OpenWeatherMap key for local testing,
  // paste it between the quotes below. (Leave empty to use in-app Settings modal)
  STATIC_API_KEY: '',
  
  BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
  ICON_BASE_URL: 'https://openweathermap.org/img/wn',
  
  STORAGE_KEYS: {
    API_KEY: 'syntecx_weather_api_key',
    THEME: 'syntecx_weather_theme',
    UNIT: 'syntecx_weather_unit',
    HISTORY: 'syntecx_weather_history',
    LAST_CITY: 'syntecx_weather_last_city',
  },
  
  MAX_HISTORY: 5,
};

// ----------------------------------------------------------------------------
// 2. Application State
// ----------------------------------------------------------------------------
const state = {
  currentWeatherData: null, // Stores raw metric data from API
  currentUnit: 'metric',    // 'metric' (°C) or 'imperial' (°F)
  isLoading: false,
  activeCityQuery: '',
};

// ----------------------------------------------------------------------------
// 3. DOM Element References
// ----------------------------------------------------------------------------
const DOM = {
  // Navigation & Controls
  unitToggleBtn: document.getElementById('unitToggleBtn'),
  unitC: document.querySelector('.unit-c'),
  unitF: document.querySelector('.unit-f'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  apiSettingsBtn: document.getElementById('apiSettingsBtn'),

  // Search
  searchForm: document.getElementById('searchForm'),
  cityInput: document.getElementById('cityInput'),
  clearInputBtn: document.getElementById('clearInputBtn'),
  searchSubmitBtn: document.getElementById('searchSubmitBtn'),
  geoBtn: document.getElementById('geoBtn'),

  // Recent Searches
  recentSearchesContainer: document.getElementById('recentSearchesContainer'),
  recentChips: document.getElementById('recentChips'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),

  // Feedback & Banners
  alertBox: document.getElementById('alertBox'),
  alertMessage: document.getElementById('alertMessage'),
  alertCloseBtn: document.getElementById('alertCloseBtn'),
  apiKeyBanner: document.getElementById('apiKeyBanner'),
  openKeyModalBtn: document.getElementById('openKeyModalBtn'),
  loadingIndicator: document.getElementById('loadingIndicator'),

  // Dashboard Sections
  welcomeState: document.getElementById('welcomeState'),
  weatherDashboard: document.getElementById('weatherDashboard'),

  // Hero Card
  cityName: document.getElementById('cityName'),
  countryCode: document.getElementById('countryCode'),
  localDateTime: document.getElementById('localDateTime'),
  refreshBtn: document.getElementById('refreshBtn'),
  tempValue: document.getElementById('tempValue'),
  tempUnit: document.getElementById('tempUnit'),
  weatherDesc: document.getElementById('weatherDesc'),
  tempMax: document.getElementById('tempMax'),
  tempMin: document.getElementById('tempMin'),
  weatherIcon: document.getElementById('weatherIcon'),

  // Metrics Grid
  feelsLikeValue: document.getElementById('feelsLikeValue'),
  feelsLikeFeedback: document.getElementById('feelsLikeFeedback'),
  humidityValue: document.getElementById('humidityValue'),
  humidityFeedback: document.getElementById('humidityFeedback'),
  windValue: document.getElementById('windValue'),
  windDirection: document.getElementById('windDirection'),
  pressureValue: document.getElementById('pressureValue'),
  pressureFeedback: document.getElementById('pressureFeedback'),
  visibilityValue: document.getElementById('visibilityValue'),
  visibilityFeedback: document.getElementById('visibilityFeedback'),
  sunriseValue: document.getElementById('sunriseValue'),
  sunsetValue: document.getElementById('sunsetValue'),

  // API Key Modal
  apiKeyModal: document.getElementById('apiKeyModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  saveKeyBtn: document.getElementById('saveKeyBtn'),
  removeKeyBtn: document.getElementById('removeKeyBtn'),
  apiKeyInputField: document.getElementById('apiKeyInputField'),
  toggleKeyVisibilityBtn: document.getElementById('toggleKeyVisibilityBtn'),
  keyValidationMsg: document.getElementById('keyValidationMsg'),
};

// ----------------------------------------------------------------------------
// 4. Utility & Formatting Helpers
// ----------------------------------------------------------------------------

/**
 * Retrieves the active API key: prefers localStorage, falls back to script constant.
 */
function getApiKey() {
  const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
  if (stored && stored.trim().length > 0) {
    return stored.trim();
  }
  return CONFIG.STATIC_API_KEY.trim();
}

/**
 * Formats a Unix timestamp (seconds) into 12-hour local time considering city offset.
 * @param {number} unixSec - Unix timestamp in seconds
 * @param {number} timezoneOffsetSec - Timezone offset in seconds from UTC
 */
function formatLocalTime(unixSec, timezoneOffsetSec) {
  if (!unixSec) return '--:--';
  // Compute city time in UTC milliseconds + offset
  const dateUtc = new Date(unixSec * 1000);
  const localMillis = dateUtc.getTime() + (dateUtc.getTimezoneOffset() * 60000) + (timezoneOffsetSec * 1000);
  const cityDate = new Date(localMillis);

  let hours = cityDate.getHours();
  const minutes = cityDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour is 12 AM
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

/**
 * Formats current date and time for the city.
 * e.g. "Friday, Oct 9 • 6:30 PM"
 */
function formatLocalDateTime(timezoneOffsetSec) {
  const now = new Date();
  const localMillis = now.getTime() + (now.getTimezoneOffset() * 60000) + (timezoneOffsetSec * 1000);
  const cityDate = new Date(localMillis);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = days[cityDate.getDay()];
  const monthName = months[cityDate.getMonth()];
  const dateNum = cityDate.getDate();

  let hours = cityDate.getHours();
  const minutes = cityDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;

  return `${dayName}, ${monthName} ${dateNum} • ${hours}:${minutesStr} ${ampm}`;
}

/**
 * Converts degrees into 16-point cardinal compass direction.
 */
function degToCompass(num) {
  if (typeof num !== 'number') return '--';
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[(val % 16)];
}

/**
 * Converts Celsius to Fahrenheit.
 */
function toFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32;
}

/**
 * Capitalizes every word in a weather description string.
 */
function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// ----------------------------------------------------------------------------
// 5. User Feedback (Alerts, Loading & Banners)
// ----------------------------------------------------------------------------

function showAlert(message, type = 'error') {
  DOM.alertMessage.textContent = message;
  DOM.alertBox.className = 'alert-box';
  if (type === 'warning') {
    DOM.alertBox.style.background = 'var(--alert-warning-bg)';
    DOM.alertBox.style.borderColor = 'var(--alert-warning-border)';
    DOM.alertBox.style.color = 'var(--alert-warning-text)';
  } else {
    DOM.alertBox.style.background = 'var(--alert-error-bg)';
    DOM.alertBox.style.borderColor = 'var(--alert-error-border)';
    DOM.alertBox.style.color = 'var(--alert-error-text)';
  }
  DOM.alertBox.classList.remove('hidden');
}

function hideAlert() {
  DOM.alertBox.classList.add('hidden');
  DOM.alertMessage.textContent = '';
}

function setLoading(loading, message = 'Connecting to satellite network & fetching weather data...') {
  state.isLoading = loading;
  if (loading) {
    DOM.loadingIndicator.querySelector('.loading-text').textContent = message;
    DOM.loadingIndicator.classList.remove('hidden');
    DOM.welcomeState.classList.add('hidden');
    DOM.weatherDashboard.classList.add('hidden');
    DOM.searchSubmitBtn.disabled = true;
    DOM.geoBtn.disabled = true;
  } else {
    DOM.loadingIndicator.classList.add('hidden');
    DOM.searchSubmitBtn.disabled = false;
    DOM.geoBtn.disabled = false;
  }
}

function updateApiKeyBanner() {
  const key = getApiKey();
  if (!key) {
    DOM.apiKeyBanner.classList.remove('hidden');
  } else {
    DOM.apiKeyBanner.classList.add('hidden');
  }
}

// ----------------------------------------------------------------------------
// 6. Data Fetching (OpenWeatherMap API)
// ----------------------------------------------------------------------------

/**
 * Fetches current weather for a city query or coordinates.
 * Always requests units=metric; UI converts to Imperial instantly on demand.
 * 
 * @param {string|object} query - City name string OR { lat, lon }
 * @param {boolean} isCoords - True if query is coordinates object
 */
async function fetchWeatherData(query, isCoords = false) {
  const apiKey = getApiKey();

  // Validate API Key presence
  if (!apiKey) {
    showAlert('OpenWeatherMap API key is missing. Please click "Configure API Key" to add your key.', 'warning');
    updateApiKeyBanner();
    openApiKeyModal();
    return;
  }

  hideAlert();
  setLoading(true, isCoords ? 'Detecting local atmospheric conditions...' : `Fetching live weather for "${query}"...`);

  let url = '';
  if (isCoords) {
    url = `${CONFIG.BASE_URL}?lat=${query.lat}&lon=${query.lon}&appid=${apiKey}&units=metric`;
  } else {
    url = `${CONFIG.BASE_URL}?q=${encodeURIComponent(query.trim())}&appid=${apiKey}&units=metric`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      // Decode HTTP errors specifically
      if (response.status === 401) {
        throw new Error('Invalid API key or key not yet activated. (New OpenWeatherMap keys typically take 10 to 60 minutes to activate after signup). Please check Settings.');
      } else if (response.status === 404) {
        throw new Error(`City "${query}" was not found. Please check spelling and try again.`);
      } else if (response.status === 429) {
        throw new Error('API rate limit reached for OpenWeatherMap free tier. Please wait a minute and try again.');
      } else {
        throw new Error(data.message ? toTitleCase(data.message) : `HTTP error: ${response.status}`);
      }
    }

    // Success: store state & render
    state.currentWeatherData = data;
    state.activeCityQuery = data.name;

    // Save to history & last city
    addSearchHistory(data.name);
    localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_CITY, data.name);

    renderWeatherData();
    setLoading(false);

  } catch (error) {
    setLoading(false);
    // If no prior weather is loaded, show welcome state again
    if (!state.currentWeatherData) {
      DOM.welcomeState.classList.remove('hidden');
      DOM.weatherDashboard.classList.add('hidden');
    } else {
      DOM.weatherDashboard.classList.remove('hidden');
    }

    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Network error: Unable to connect to OpenWeatherMap. Please check your internet connection.');
    } else {
      showAlert(error.message);
    }
  }
}

// ----------------------------------------------------------------------------
// 7. UI Rendering & Unit Conversion
// ----------------------------------------------------------------------------

/**
 * Renders current weather data to the DOM.
 * Seamlessly handles Metric (°C) and Imperial (°F) views based on state.currentUnit.
 */
function renderWeatherData() {
  const data = state.currentWeatherData;
  if (!data) return;

  const isMetric = state.currentUnit === 'metric';

  // 1. Hero Card - Header info
  DOM.cityName.textContent = data.name;
  DOM.countryCode.textContent = data.sys?.country || '';
  DOM.localDateTime.textContent = formatLocalDateTime(data.timezone || 0);

  // 2. Weather Condition & Icon
  const weather = data.weather && data.weather[0] ? data.weather[0] : {};
  DOM.weatherDesc.textContent = toTitleCase(weather.description || 'Clear');

  if (weather.icon) {
    DOM.weatherIcon.src = `${CONFIG.ICON_BASE_URL}/${weather.icon}@4x.png`;
    DOM.weatherIcon.alt = weather.description || 'Weather Icon';
  }

  // 3. Temperature & High/Low calculations
  const rawTemp = data.main.temp;
  const rawTempMin = data.main.temp_min;
  const rawTempMax = data.main.temp_max;
  const rawFeelsLike = data.main.feels_like;

  const displayTemp = isMetric ? Math.round(rawTemp) : Math.round(toFahrenheit(rawTemp));
  const displayMin = isMetric ? Math.round(rawTempMin) : Math.round(toFahrenheit(rawTempMin));
  const displayMax = isMetric ? Math.round(rawTempMax) : Math.round(toFahrenheit(rawTempMax));
  const displayFeelsLike = isMetric ? Math.round(rawFeelsLike) : Math.round(toFahrenheit(rawFeelsLike));
  const unitSymbol = isMetric ? '°C' : '°F';

  DOM.tempValue.textContent = displayTemp;
  DOM.tempUnit.textContent = unitSymbol;
  DOM.tempMax.textContent = `${displayMax}${unitSymbol}`;
  DOM.tempMin.textContent = `${displayMin}${unitSymbol}`;

  // 4. Metric 1: Feels Like
  DOM.feelsLikeValue.textContent = `${displayFeelsLike}${unitSymbol}`;
  const diff = Math.abs(rawTemp - rawFeelsLike);
  if (diff <= 1.5) {
    DOM.feelsLikeFeedback.textContent = 'Matches actual reading';
  } else if (rawFeelsLike > rawTemp) {
    DOM.feelsLikeFeedback.textContent = 'Feels warmer due to humidity';
  } else {
    DOM.feelsLikeFeedback.textContent = 'Feels cooler due to wind chill';
  }

  // 5. Metric 2: Humidity
  const humidity = data.main.humidity;
  DOM.humidityValue.textContent = `${humidity}%`;
  if (humidity < 30) {
    DOM.humidityFeedback.textContent = 'Dry air conditions';
  } else if (humidity <= 60) {
    DOM.humidityFeedback.textContent = 'Optimal comfort level';
  } else if (humidity <= 80) {
    DOM.humidityFeedback.textContent = 'Moderate humidity';
  } else {
    DOM.humidityFeedback.textContent = 'High mugginess / damp';
  }

  // 6. Metric 3: Wind Speed & Direction
  const rawSpeedMs = data.wind?.speed || 0;
  const windDeg = data.wind?.deg;
  const compassDir = degToCompass(windDeg);

  if (isMetric) {
    const speedKmh = (rawSpeedMs * 3.6).toFixed(1);
    DOM.windValue.textContent = `${speedKmh} km/h`;
  } else {
    const speedMph = (rawSpeedMs * 2.23694).toFixed(1);
    DOM.windValue.textContent = `${speedMph} mph`;
  }
  DOM.windDirection.textContent = `Direction: ${compassDir} (${windDeg != null ? windDeg + '°' : '--'})`;

  // 7. Metric 4: Pressure
  const pressure = data.main.pressure;
  DOM.pressureValue.textContent = `${pressure} hPa`;
  if (pressure < 1000) {
    DOM.pressureFeedback.textContent = 'Low (Stormy / Rain system)';
  } else if (pressure <= 1020) {
    DOM.pressureFeedback.textContent = 'Standard sea-level range';
  } else {
    DOM.pressureFeedback.textContent = 'High (Clear / Calm skies)';
  }

  // 8. Metric 5: Visibility
  const rawVisibility = data.visibility;
  if (rawVisibility != null) {
    if (isMetric) {
      const visKm = (rawVisibility / 1000).toFixed(1);
      DOM.visibilityValue.textContent = `${visKm} km`;
    } else {
      const visMiles = ((rawVisibility / 1000) * 0.621371).toFixed(1);
      DOM.visibilityValue.textContent = `${visMiles} mi`;
    }
    DOM.visibilityFeedback.textContent = rawVisibility >= 10000 ? 'Clear horizon' : 'Reduced sight distance';
  } else {
    DOM.visibilityValue.textContent = 'N/A';
    DOM.visibilityFeedback.textContent = 'Data unavailable';
  }

  // 9. Metric 6: Sunrise & Sunset
  const sunrise = data.sys?.sunrise;
  const sunset = data.sys?.sunset;
  const tzOffset = data.timezone || 0;
  DOM.sunriseValue.textContent = formatLocalTime(sunrise, tzOffset);
  DOM.sunsetValue.textContent = formatLocalTime(sunset, tzOffset);

  // Show dashboard, hide welcome card
  DOM.welcomeState.classList.add('hidden');
  DOM.weatherDashboard.classList.remove('hidden');
}

/**
 * Toggles between Celsius and Fahrenheit.
 * Re-renders existing data instantly without sending a redundant network request.
 */
function toggleTemperatureUnit() {
  if (state.currentUnit === 'metric') {
    state.currentUnit = 'imperial';
    DOM.unitC.classList.remove('active');
    DOM.unitF.classList.add('active');
  } else {
    state.currentUnit = 'metric';
    DOM.unitF.classList.remove('active');
    DOM.unitC.classList.add('active');
  }

  localStorage.setItem(CONFIG.STORAGE_KEYS.UNIT, state.currentUnit);

  if (state.currentWeatherData) {
    renderWeatherData();
  }
}

// ----------------------------------------------------------------------------
// 8. Theme Management (Dark / Light)
// ----------------------------------------------------------------------------

function initTheme() {
  const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  } else if (savedTheme === 'dark') {
    document.body.classList.remove('light-theme');
  } else {
    // Check OS preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.body.classList.add('light-theme');
    }
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, isLight ? 'light' : 'dark');
}

// ----------------------------------------------------------------------------
// 9. Recent Search History Management
// ----------------------------------------------------------------------------

function loadSearchHistory() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveSearchHistory(historyArray) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(historyArray));
}

function addSearchHistory(cityName) {
  if (!cityName) return;
  const cleanedName = cityName.trim();
  let history = loadSearchHistory();

  // Deduplicate case-insensitively, insert at front
  history = history.filter(c => c.toLowerCase() !== cleanedName.toLowerCase());
  history.unshift(cleanedName);

  // Limit to MAX_HISTORY
  if (history.length > CONFIG.MAX_HISTORY) {
    history = history.slice(0, CONFIG.MAX_HISTORY);
  }

  saveSearchHistory(history);
  renderSearchHistory();
}

function clearSearchHistory() {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.HISTORY);
  renderSearchHistory();
}

function renderSearchHistory() {
  const history = loadSearchHistory();
  DOM.recentChips.innerHTML = '';

  if (history.length === 0) {
    DOM.recentSearchesContainer.classList.add('hidden');
    return;
  }

  DOM.recentSearchesContainer.classList.remove('hidden');
  history.forEach(city => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = city;
    chip.title = `View weather for ${city}`;
    chip.addEventListener('click', () => {
      DOM.cityInput.value = city;
      DOM.clearInputBtn.classList.remove('hidden');
      fetchWeatherData(city);
    });
    DOM.recentChips.appendChild(chip);
  });
}

// ----------------------------------------------------------------------------
// 10. Geolocation ("My Location")
// ----------------------------------------------------------------------------

function handleGeolocation() {
  if (!('geolocation' in navigator)) {
    showAlert('Geolocation is not supported by your browser.', 'warning');
    return;
  }

  hideAlert();
  setLoading(true, 'Detecting your GPS location...');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };
      fetchWeatherData(coords, true);
    },
    (geoError) => {
      setLoading(false);
      let errorMsg = 'Unable to determine your location.';
      if (geoError.code === geoError.PERMISSION_DENIED) {
        errorMsg = 'Location access was denied. You can search your city manually above.';
      } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
        errorMsg = 'Location information is currently unavailable.';
      } else if (geoError.code === geoError.TIMEOUT) {
        errorMsg = 'Location request timed out. Please try again or search manually.';
      }
      showAlert(errorMsg, 'warning');
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    }
  );
}

// ----------------------------------------------------------------------------
// 11. API Key Modal Dialog Logic
// ----------------------------------------------------------------------------

function openApiKeyModal() {
  const currentKey = getApiKey();
  DOM.apiKeyInputField.value = currentKey || '';
  DOM.keyValidationMsg.textContent = '';
  DOM.keyValidationMsg.className = 'validation-msg';
  DOM.apiKeyModal.classList.remove('hidden');
  DOM.apiKeyInputField.focus();
}

function closeApiKeyModal() {
  DOM.apiKeyModal.classList.add('hidden');
}

function toggleApiKeyVisibility() {
  const input = DOM.apiKeyInputField;
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

function saveApiKeyFromModal() {
  const inputKey = DOM.apiKeyInputField.value.trim();

  if (!inputKey) {
    DOM.keyValidationMsg.textContent = 'Please enter an API key or click Clear.';
    DOM.keyValidationMsg.className = 'validation-msg error';
    return;
  }

  // OpenWeatherMap keys are 32 hexadecimal characters
  if (inputKey.length !== 32) {
    DOM.keyValidationMsg.textContent = 'Warning: OpenWeatherMap keys are usually 32 characters long. Saving anyway...';
    DOM.keyValidationMsg.className = 'validation-msg error';
  }

  localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, inputKey);
  updateApiKeyBanner();
  hideAlert();

  DOM.keyValidationMsg.textContent = 'API key saved successfully!';
  DOM.keyValidationMsg.className = 'validation-msg success';

  setTimeout(() => {
    closeApiKeyModal();
    // If a city was previously searched or user inputs a query, re-try fetch
    if (state.activeCityQuery) {
      fetchWeatherData(state.activeCityQuery);
    } else {
      const lastCity = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_CITY);
      if (lastCity) {
        fetchWeatherData(lastCity);
      }
    }
  }, 600);
}

function removeApiKeyFromModal() {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.API_KEY);
  DOM.apiKeyInputField.value = '';
  DOM.keyValidationMsg.textContent = 'API key cleared from browser storage.';
  DOM.keyValidationMsg.className = 'validation-msg error';
  updateApiKeyBanner();
}

// ----------------------------------------------------------------------------
// 12. Event Listeners & Initialization
// ----------------------------------------------------------------------------

function setupEventListeners() {
  // Search Form Submit
  DOM.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = DOM.cityInput.value.trim();
    if (!city) {
      showAlert('Please enter a city name to search.', 'warning');
      DOM.cityInput.focus();
      return;
    }
    fetchWeatherData(city);
  });

  // Clear Input Button
  DOM.cityInput.addEventListener('input', () => {
    if (DOM.cityInput.value.length > 0) {
      DOM.clearInputBtn.classList.remove('hidden');
    } else {
      DOM.clearInputBtn.classList.add('hidden');
    }
  });

  DOM.clearInputBtn.addEventListener('click', () => {
    DOM.cityInput.value = '';
    DOM.clearInputBtn.classList.add('hidden');
    DOM.cityInput.focus();
  });

  // Geolocation Button
  DOM.geoBtn.addEventListener('click', handleGeolocation);

  // Unit Toggle
  DOM.unitToggleBtn.addEventListener('click', toggleTemperatureUnit);

  // Theme Toggle
  DOM.themeToggleBtn.addEventListener('click', toggleTheme);

  // Refresh Button
  DOM.refreshBtn.addEventListener('click', () => {
    if (state.activeCityQuery) {
      fetchWeatherData(state.activeCityQuery);
    }
  });

  // Quick suggestion pills on welcome screen
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const city = btn.dataset.city;
      DOM.cityInput.value = city;
      DOM.clearInputBtn.classList.remove('hidden');
      fetchWeatherData(city);
    });
  });

  // Search History Clear
  DOM.clearHistoryBtn.addEventListener('click', clearSearchHistory);

  // Alert dismiss button
  DOM.alertCloseBtn.addEventListener('click', hideAlert);

  // API Key Modal Triggers
  DOM.apiSettingsBtn.addEventListener('click', openApiKeyModal);
  DOM.openKeyModalBtn.addEventListener('click', openApiKeyModal);
  DOM.closeModalBtn.addEventListener('click', closeApiKeyModal);
  DOM.cancelModalBtn.addEventListener('click', closeApiKeyModal);
  DOM.saveKeyBtn.addEventListener('click', saveApiKeyFromModal);
  DOM.removeKeyBtn.addEventListener('click', removeApiKeyFromModal);
  DOM.toggleKeyVisibilityBtn.addEventListener('click', toggleApiKeyVisibility);

  // Close modal when clicking outside of card
  DOM.apiKeyModal.addEventListener('click', (e) => {
    if (e.target === DOM.apiKeyModal) {
      closeApiKeyModal();
    }
  });

  // Escape key closes modal & alerts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!DOM.apiKeyModal.classList.contains('hidden')) {
        closeApiKeyModal();
      }
    }
  });
}

/**
 * Initializes the application on DOMContentLoaded.
 */
function init() {
  initTheme();

  // Load Unit preference
  const savedUnit = localStorage.getItem(CONFIG.STORAGE_KEYS.UNIT);
  if (savedUnit === 'imperial') {
    state.currentUnit = 'imperial';
    DOM.unitC.classList.remove('active');
    DOM.unitF.classList.add('active');
  }

  // Render search history
  renderSearchHistory();

  // Update API key banner visibility
  updateApiKeyBanner();

  // Register listeners
  setupEventListeners();

  // If an API key is present and a last searched city exists, automatically restore it
  const key = getApiKey();
  const lastCity = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_CITY);
  if (key && lastCity) {
    DOM.cityInput.value = lastCity;
    DOM.clearInputBtn.classList.remove('hidden');
    fetchWeatherData(lastCity);
  }
}

// Run on ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
