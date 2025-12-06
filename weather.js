const API_KEY = 'e84a8261d3cd4786a8281927250707';
const WEATHER_URL = 'https://api.weatherapi.com/v1';
let searchHistory = [];

async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    const includeAqi = document.getElementById('aqiCheck').checked;
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        hideError();
        const aqiParam = includeAqi ? 'yes' : 'no';
        const url = `${WEATHER_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=${aqiParam}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch weather data');
        }
        
        displayWeather(data, includeAqi);
    } catch (error) {
        showError(error.message);
    }
}

function displayWeather(data, showAqi) {
    const { location, current } = data;
    
    document.getElementById('locationName').textContent = location.name;
    document.getElementById('locationDetails').textContent = `${location.region}, ${location.country}`;
    document.getElementById('lastUpdated').textContent = `Last updated: ${current.last_updated}`;
    
    document.getElementById('weatherIcon').src = `https:${current.condition.icon}`;
    document.getElementById('conditionText').textContent = current.condition.text;
    document.getElementById('temperature').textContent = `${current.temp_c}°C`;
    
    const weatherDetails = document.getElementById('weatherDetails');
    weatherDetails.innerHTML = `
        <div class="detail-item"><span>Feels like:</span><span>${current.feelslike_c}°C</span></div>
        <div class="detail-item"><span>Humidity:</span><span>${current.humidity}%</span></div>
        <div class="detail-item"><span>Wind:</span><span>${current.wind_kph} km/h ${current.wind_dir}</span></div>
        <div class="detail-item"><span>Pressure:</span><span>${current.pressure_mb} mb</span></div>
        <div class="detail-item"><span>Visibility:</span><span>${current.vis_km} km</span></div>
        <div class="detail-item"><span>UV Index:</span><span>${current.uv}</span></div>
    `;
    
    const aqiCard = document.getElementById('aqiCard');
    if (showAqi && current.air_quality) {
        const epaIndex = current.air_quality['us-epa-index'];
        const aqiStatus = document.getElementById('aqiStatus');
        let statusText = '';
        
        if (epaIndex === 1) {
            statusText = '✓ Good - Air quality is satisfactory';
            aqiStatus.style.background = '#d4edda';
            aqiStatus.style.color = '#155724';
        } else if (epaIndex === 2) {
            statusText = '⚠ Moderate - Acceptable for most people';
            aqiStatus.style.background = '#fff3cd';
            aqiStatus.style.color = '#856404';
        } else if (epaIndex === 3) {
            statusText = '⚠ Unhealthy for Sensitive Groups';
            aqiStatus.style.background = '#ffe5cc';
            aqiStatus.style.color = '#cc5200';
        } else if (epaIndex === 4) {
            statusText = '⚠ Unhealthy - Everyone may experience effects';
            aqiStatus.style.background = '#ffcccc';
            aqiStatus.style.color = '#cc0000';
        } else if (epaIndex === 5) {
            statusText = '⚠ Very Unhealthy - Health alert';
            aqiStatus.style.background = '#e6ccff';
            aqiStatus.style.color = '#660099';
        } else if (epaIndex === 6) {
            statusText = '⚠ Hazardous - Health warning';
            aqiStatus.style.background = '#cc99cc';
            aqiStatus.style.color = '#4d0066';
        }
        
        aqiStatus.innerHTML = `${statusText}<br><strong style="font-size: 24px; margin-top: 10px; display: inline-block;">AQI Level: ${epaIndex}</strong>`
        
        const aqiGrid = document.getElementById('aqiGrid');
        aqiGrid.innerHTML = `
            <div class="aqi-item"><strong>CO</strong><br>${current.air_quality.co}</div>
            <div class="aqi-item"><strong>NO2</strong><br>${current.air_quality.no2}</div>
            <div class="aqi-item"><strong>O3</strong><br>${current.air_quality.o3}</div>
            <div class="aqi-item"><strong>SO2</strong><br>${current.air_quality.so2}</div>
            <div class="aqi-item"><strong>PM2.5</strong><br>${current.air_quality.pm2_5}</div>
            <div class="aqi-item"><strong>PM10</strong><br>${current.air_quality.pm10}</div>
            <div class="aqi-item"><strong>US EPA</strong><br>${current.air_quality['us-epa-index']}</div>
            <div class="aqi-item"><strong>UK DEFRA</strong><br>${current.air_quality['gb-defra-index']}</div>
        `;
        aqiCard.style.display = 'block';
    } else {
        aqiCard.style.display = 'none';
    }
    
    document.getElementById('weatherDisplay').style.display = 'block';
    
    const historyItem = {
        city: `${location.name}, ${location.country}`,
        temperature: `${current.temp_c}°C`,
        condition: current.condition.text,
        time: new Date().toLocaleTimeString()
    };
    
    searchHistory.unshift(historyItem);
    if (searchHistory.length > 2) {
        searchHistory = searchHistory.slice(0, 2);
    }
    
    updateHistoryTable();
}

function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    document.getElementById('weatherDisplay').style.display = 'none';
}

function hideError() {
    document.getElementById('errorMsg').style.display = 'none';
}

function updateHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';
    
    searchHistory.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = item.city;
        row.insertCell(1).textContent = item.temperature;
        row.insertCell(2).textContent = item.condition;
        row.insertCell(3).textContent = item.time;
    });
    
    document.getElementById('searchHistory').style.display = searchHistory.length > 0 ? 'block' : 'none';
}

function startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice search not supported. Use Chrome or Edge.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    const micIcon = document.getElementById('micIcon');
    micIcon.setAttribute('fill', '#ea4335');
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('cityInput').value = transcript;
        micIcon.setAttribute('fill', '#4285f4');
    };

    recognition.onerror = function(event) {
        micIcon.setAttribute('fill', '#4285f4');
        if (event.error === 'no-speech') {
            alert('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access.');
        } else {
            alert('Speech recognition error: ' + event.error);
        }
    };

    recognition.onend = function() {
        micIcon.setAttribute('fill', '#4285f4');
    };

    try {
        recognition.start();
    } catch(e) {
        micIcon.setAttribute('fill', '#4285f4');
        alert('Error starting voice recognition.');
    }
}

function showPage(pageId) {
    const pages = ['home', 'about', 'contact', 'blog'];
    pages.forEach(page => {
        document.getElementById(page).classList.remove('active');
        const link = document.getElementById(page + 'Link');
        if (link) link.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    const activeLink = document.getElementById(pageId + 'Link');
    if (activeLink) activeLink.classList.add('active');
}

function showBlogPost(postId) {
    window.location.href = `blog-post.html?id=${postId}`;
}

async function handleContactSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    const successDiv = document.getElementById('contactSuccess');
    const errorDiv = document.getElementById('contactError');
    
    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    successDiv.textContent = `Thank you ${name}! Your message has been received. We'll get back to you at ${email} soon.`;
    successDiv.style.display = 'block';
    document.getElementById('contactForm').reset();
}

document.addEventListener('DOMContentLoaded', function() {
    showPage('home');
    
    document.getElementById('cityInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getWeather();
        }
    });
});
