// Weather API configuration
const API_KEY = 'e84a8261d3cd4786a8281927250707'; // API key for weatherapi.com
const WEATHER_URL = 'https://api.weatherapi.com/v1'; // Base URL for weather API
let searchHistory = []; // Array to store recent search history

// Main function to fetch weather data from API
async function getWeather() {
    // Get city name from input field and remove extra spaces
    const city = document.getElementById('cityInput').value.trim();
    // Check if user wants air quality data
    const includeAqi = document.getElementById('aqiCheck').checked;
    
    // Validate that city name is not empty
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        hideError(); // Hide any previous error messages
        // Set AQI parameter based on checkbox
        const aqiParam = includeAqi ? 'yes' : 'no';
        // Build API URL with city and AQI parameters
        const url = `${WEATHER_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=${aqiParam}`;
        
        // Fetch data from weather API
        const response = await fetch(url);
        const data = await response.json();
        
        // Check if API request was successful
        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch weather data');
        }
        
        // Display the weather data on page
        displayWeather(data, includeAqi);
    } catch (error) {
        // Show error message if something goes wrong
        showError(error.message);
    }
}

// Function to display weather data on the page
function displayWeather(data, showAqi) {
    // Extract location and current weather from API response
    const { location, current } = data;
    
    // Display location name (city)
    document.getElementById('locationName').textContent = location.name;
    // Display region and country
    document.getElementById('locationDetails').textContent = `${location.region}, ${location.country}`;
    // Display last update time
    document.getElementById('lastUpdated').textContent = `Last updated: ${current.last_updated}`;
    
    // Display weather icon
    document.getElementById('weatherIcon').src = `https:${current.condition.icon}`;
    // Display weather condition text (e.g., Sunny, Cloudy)
    document.getElementById('conditionText').textContent = current.condition.text;
    // Display temperature in Celsius
    document.getElementById('temperature').textContent = `${current.temp_c}°C`;
    
    // Display detailed weather information
    const weatherDetails = document.getElementById('weatherDetails');
    weatherDetails.innerHTML = `
        <div class="detail-item"><span>Feels like:</span><span>${current.feelslike_c}°C</span></div>
        <div class="detail-item"><span>Humidity:</span><span>${current.humidity}%</span></div>
        <div class="detail-item"><span>Wind:</span><span>${current.wind_kph} km/h ${current.wind_dir}</span></div>
        <div class="detail-item"><span>Pressure:</span><span>${current.pressure_mb} mb</span></div>
        <div class="detail-item"><span>Visibility:</span><span>${current.vis_km} km</span></div>
        <div class="detail-item"><span>UV Index:</span><span>${current.uv}</span></div>
    `;
    
    // Handle Air Quality Index (AQI) display
    const aqiCard = document.getElementById('aqiCard');
    // Only show AQI if checkbox was checked and data is available
    if (showAqi && current.air_quality) {
        // Get EPA air quality index (1-6 scale)
        const epaIndex = current.air_quality['us-epa-index'];
        const aqiStatus = document.getElementById('aqiStatus');
        let statusText = '';
        
        // Set status text and colors based on AQI level
        if (epaIndex === 1) {
            // Level 1: Good air quality (green)
            statusText = '✓ Good - Air quality is satisfactory';
            aqiStatus.style.background = '#d4edda';
            aqiStatus.style.color = '#155724';
        } else if (epaIndex === 2) {
            // Level 2: Moderate air quality (yellow)
            statusText = '⚠ Moderate - Acceptable for most people';
            aqiStatus.style.background = '#fff3cd';
            aqiStatus.style.color = '#856404';
        } else if (epaIndex === 3) {
            // Level 3: Unhealthy for sensitive groups (orange)
            statusText = '⚠ Unhealthy for Sensitive Groups';
            aqiStatus.style.background = '#ffe5cc';
            aqiStatus.style.color = '#cc5200';
        } else if (epaIndex === 4) {
            // Level 4: Unhealthy for everyone (red)
            statusText = '⚠ Unhealthy - Everyone may experience effects';
            aqiStatus.style.background = '#ffcccc';
            aqiStatus.style.color = '#cc0000';
        } else if (epaIndex === 5) {
            // Level 5: Very unhealthy (purple)
            statusText = '⚠ Very Unhealthy - Health alert';
            aqiStatus.style.background = '#e6ccff';
            aqiStatus.style.color = '#660099';
        } else if (epaIndex === 6) {
            // Level 6: Hazardous (maroon)
            statusText = '⚠ Hazardous - Health warning';
            aqiStatus.style.background = '#cc99cc';
            aqiStatus.style.color = '#4d0066';
        }
        
        // Display AQI status with level number
        aqiStatus.innerHTML = `${statusText}<br><strong style="font-size: 24px; margin-top: 10px; display: inline-block;">AQI Level: ${epaIndex}</strong>`
        
        // Display individual pollutant levels
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
        // Show the AQI card
        aqiCard.style.display = 'block';
    } else {
        // Hide AQI card if not requested or unavailable
        aqiCard.style.display = 'none';
    }
    
    // Show the weather display section
    document.getElementById('weatherDisplay').style.display = 'block';
    
    // Create history item with search details
    const historyItem = {
        city: `${location.name}, ${location.country}`,
        temperature: `${current.temp_c}°C`,
        condition: current.condition.text,
        time: new Date().toLocaleTimeString()
    };
    
    // Add to beginning of history array
    searchHistory.unshift(historyItem);
    // Keep only last 2 searches
    if (searchHistory.length > 2) {
        searchHistory = searchHistory.slice(0, 2);
    }
    
    // Update the history table display
    updateHistoryTable();
}

// Function to display error messages
function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    // Hide weather display when showing error
    document.getElementById('weatherDisplay').style.display = 'none';
}

// Function to hide error messages
function hideError() {
    document.getElementById('errorMsg').style.display = 'none';
}

// Function to update the search history table
function updateHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = ''; // Clear existing rows
    
    // Add each history item as a table row
    searchHistory.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = item.city;
        row.insertCell(1).textContent = item.temperature;
        row.insertCell(2).textContent = item.condition;
        row.insertCell(3).textContent = item.time;
    });
    
    // Show history table only if there are searches
    document.getElementById('searchHistory').style.display = searchHistory.length > 0 ? 'block' : 'none';
}

// Function to enable voice search using Web Speech API
function startVoiceSearch() {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice search not supported. Use Chrome or Edge.');
        return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Set language to English
    recognition.continuous = false; // Stop after one result
    recognition.interimResults = false; // Only final results
    recognition.maxAlternatives = 1; // Return only best match
    
    // Change mic icon color to red when listening
    const micIcon = document.getElementById('micIcon');
    micIcon.setAttribute('fill', '#ea4335');
    
    // Handle successful speech recognition
    recognition.onresult = function(event) {
        // Get the spoken text
        const transcript = event.results[0][0].transcript;
        // Put it in the city input field
        document.getElementById('cityInput').value = transcript;
        // Reset mic icon color
        micIcon.setAttribute('fill', '#4285f4');
    };

    // Handle speech recognition errors
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

    // Reset mic icon when recognition ends
    recognition.onend = function() {
        micIcon.setAttribute('fill', '#4285f4');
    };

    // Start speech recognition
    try {
        recognition.start();
    } catch(e) {
        micIcon.setAttribute('fill', '#4285f4');
        alert('Error starting voice recognition.');
    }
}

// Function to switch between different pages (Home, About, Contact, Blog)
function showPage(pageId) {
    const pages = ['home', 'about', 'contact', 'blog'];
    // Hide all pages and remove active class from all links
    pages.forEach(page => {
        document.getElementById(page).classList.remove('active');
        const link = document.getElementById(page + 'Link');
        if (link) link.classList.remove('active');
    });
    
    // Show selected page and mark its link as active
    document.getElementById(pageId).classList.add('active');
    const activeLink = document.getElementById(pageId + 'Link');
    if (activeLink) activeLink.classList.add('active');
}

// Function to navigate to individual blog post page
function showBlogPost(postId) {
    // Redirect to blog post page with post ID in URL
    window.location.href = `blog-post.html?id=${postId}`;
}

// Function to handle contact form submission
async function handleContactSubmit(event) {
    event.preventDefault(); // Prevent default form submission
    
    // Get form values
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    // WhatsApp number to send message to
    const whatsappNumber = '918618079219';
    // Format message with form data (URL encoded for WhatsApp)
    const whatsappMessage = `*New Contact Form Submission*%0A%0A*Name:* ${encodeURIComponent(name)}%0A*Email:* ${encodeURIComponent(email)}%0A*Subject:* ${encodeURIComponent(subject)}%0A*Message:* ${encodeURIComponent(message)}`;
    
    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
    
    // Show success message
    const successDiv = document.getElementById('contactSuccess');
    successDiv.style.display = 'none';
    successDiv.textContent = `Thank you ${name}! Opening WhatsApp to send your message.`;
    successDiv.style.display = 'block';
    // Clear the form
    document.getElementById('contactForm').reset();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Show home page by default
    showPage('home');
    
    // Allow Enter key to trigger weather search
    document.getElementById('cityInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getWeather();
        }
    });
});
