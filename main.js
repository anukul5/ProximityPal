const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 5,
});

const searchBox = new google.maps.places.SearchBox(document.getElementById('search'));
const destinationMarker = new google.maps.Marker({ map: map, icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' });
const userMarker = new google.maps.Marker({ icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' });
let userLocationMarkerInterval;
let alarmInterval;

const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true, // Suppress default markers
});

document.getElementById('searchButton').addEventListener('click', function() {
    searchLocation();
});

document.getElementById('showUserLocationButton').addEventListener('click', function() {
    getUserLocation();
});

function searchLocation() {
    const places = searchBox.getPlaces();
    if (places.length === 0) {
        return;
    }

    const place = places[0];
    const destinationLocation = place.geometry.location;

    destinationMarker.setPosition(destinationLocation);
    map.setCenter(destinationLocation);
    document.getElementById('locationDetails').textContent = place.name;
    document.getElementById('locationCoordinates').textContent =
        destinationLocation.lat() + ', ' + destinationLocation.lng();

    // Calculate and display the route from the current location to the destination
    calculateAndDisplayRoute(destinationLocation);

    // Clear existing intervals before setting new ones
    clearInterval(userLocationMarkerInterval);
    clearInterval(alarmInterval);

    // Set intervals to regularly check the user's location and trigger the alarm if equal to the destination
    userLocationMarkerInterval = setInterval(function() {
        getUserLocation();
    }, 1000); // Update marker every 1 second (adjust as needed)

    alarmInterval = setInterval(function() {
        checkAndTriggerAlarm(destinationLocation);
    }, 1000); // Check and trigger alarm every 1 second (adjust as needed)
}

function getUserLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            if (!userMarker.getMap()) {
                userMarker.setMap(map);
            }

            userMarker.setPosition(userLocation);
            map.setCenter(userLocation);
            fetchLocationInfo(userLocation.lat, userLocation.lng);
            document.getElementById('currentCoordinates').textContent = userLocation.lat + ', ' + userLocation.lng;

        }, function(error) {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    alert("Location permission is denied by the user.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    alert("Location request timed out.");
                    break;
                default:
                    alert("An unknown error occurred.");
            }
        });
    } else {
        alert("Geolocation is not available in your browser.");
    }
}

function calculateAndDisplayRoute(destinationLocation) {
    const userLocation = new google.maps.LatLng(
        document.getElementById('currentCoordinates').textContent.split(', ')[0],
        document.getElementById('currentCoordinates').textContent.split(', ')[1]
    );

    directionsService.route({
        origin: userLocation,
        destination: destinationLocation,
        travelMode: 'DRIVING',
    }, function (response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        } else {
            alert('Directions request failed due to ' + status);
        }
    });
}

function playAlarmSound() {
    const alarmSound = document.getElementById('alarmSound');
    if (alarmSound) {
        alarmSound.play();
    }
}

function checkAndTriggerAlarm(destinationLocation) {
    const userLocation = new google.maps.LatLng(
        document.getElementById('currentCoordinates').textContent.split(', ')[0],
        document.getElementById('currentCoordinates').textContent.split(', ')[1]
    );

    if (userLocation.equals(destinationLocation)) {
       
        // Play the alarm sound
        playAlarmSound();
        console.log("playing sound,,youve reavhed...");

        // Clear intervals after triggering the alarm
        clearInterval(userLocationMarkerInterval);
        clearInterval(alarmInterval);
    }
}



// Function to fetch and display user-friendly location info
function fetchLocationInfo(lat, lng) {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat: lat, lng: lng };
    geocoder.geocode({ location: latlng }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                const locationInfo = results[0].formatted_address;
                document.getElementById('currentLocation').textContent = locationInfo;
            } else {
                document.getElementById('currentLocation').textContent = 'Location not found';
            }
        } else {
            document.getElementById('currentLocation').textContent = 'Error fetching location';
        }
    });
}
