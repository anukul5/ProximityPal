const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 5,
});

const searchBox = new google.maps.places.SearchBox(document.getElementById('search'));
const destinationMarker = new google.maps.Marker({ map: map, icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' });
const userMarker = new google.maps.Marker({ icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' });
let userLocationMarkerInterval;

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
    destinationMarker.setPosition(place.geometry.location);
    map.setCenter(place.geometry.location);
    document.getElementById('locationDetails').textContent = place.name;
    document.getElementById('locationCoordinates').textContent = place.geometry.location.lat() + ', ' + place.geometry.location.lng();
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

            if (userLocationMarkerInterval) {
                clearInterval(userLocationMarkerInterval);
            }

            userLocationMarkerInterval = setInterval(function() {
                userMarker.setPosition(userLocation);
                map.setCenter(userLocation);
            }, 1000); // Update marker every 1 second (adjust as needed)

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