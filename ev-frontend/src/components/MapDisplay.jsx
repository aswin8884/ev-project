// src/components/MapDisplay.jsx
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'

import { 
  FaLocationArrow, FaSpinner, FaCarSide, FaChargingStation, 
  FaMapPin, FaEuroSign 
} from 'react-icons/fa'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

function MapPanner({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 11);
  }, [center, map]);
  return null;
}

export default function MapDisplay({ range }) {
  const [location, setLocation] = useState([48.7758, 9.1829]) 
  const [hasLocation, setHasLocation] = useState(false) 
  const [stations, setStations] = useState([])
  const [loadingLoc, setLoadingLoc] = useState(false)

  // 1. Get GPS Location
  const getGPSLocation = () => {
    setLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.latitude, position.coords.longitude]);
          setHasLocation(true); 
          
        },
        (error) => {
          console.error("GPS Error:", error);
          setLoadingLoc(false);
        },
        { maximumAge: 60000, timeout: 5000, enableHighAccuracy: false } 
      );
    } else {
      setLoadingLoc(false);
    }
  };

  // 2. Fetch Local Stations (Only runs when 'location' changes, NOT when sliders change!)
  useEffect(() => {
    const fetchStations = async () => {
      setLoadingLoc(true);
      
      try {
        // FAST QUERY: We only search a tiny 10km radius around the car!
        const localSearchRadius = 10000; 
        const query = `[out:json];node[amenity=charging_station](around:${localSearchRadius},${location[0]},${location[1]});out 50;`;
        
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await response.json();
        setStations(data.elements || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoadingLoc(false);
      }
    };

    fetchStations();
  }, [location]); // <--- Only triggers when location changes!

  // Run GPS check only once when the component first appears
  useEffect(() => {
    if (!hasLocation && range) {
      getGPSLocation();
    }
  }, []); // Empty array means run once on mount

  if (!range) return null;

  return (
    <div className="w-full h-full relative z-0">
      
      <div className="map-status-overlay">
        {loadingLoc ? <><FaSpinner className="icon-spin" /> Finding Local Chargers...</> : `Predicted Range: ${range} km`}
      </div>

      <button 
        onClick={getGPSLocation} 
        disabled={loadingLoc}
        className="gps-btn"
      >
        <FaLocationArrow className="btn-icon" /> Center on Me
      </button>

      <MapContainer 
        center={location} 
        zoom={11} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
      >
        <MapPanner center={location} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <Marker position={location}>
          <Popup className="custom-popup">
            <div className="station-details">
              <h3><FaCarSide className="title-icon" /> Your EV</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Local Chargers (10km)</p>
            </div>
          </Popup>
        </Marker>

        <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
          {stations.map((station) => {
            const tags = station.tags || {};
            const operator = tags.operator || tags.brand || "EV Charger";
            const fee = tags.fee === "no" ? "Free" : "Paid";
            
            return (
              <Marker key={`station-${station.id}`} position={[station.lat, station.lon]}>
                <Popup className="custom-popup">
                  <div className="station-details">
                    <h3><FaChargingStation className="title-icon"/> {operator}</h3>
                    <hr/>
                    <div className="detail-row">
                      <strong><FaMapPin className="row-icon"/> Address:</strong> 
                      <span>{tags['addr:street'] || "Location data unavailable"}</span>
                    </div>
                    <div className="detail-row">
                      <strong><FaEuroSign className="row-icon"/> Cost:</strong> 
                      <span>{fee}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>

        {/* The circle still perfectly maps to your backend's calculation! */}
        <Circle
          key={`circle-${range}`} 
          center={location}
          pathOptions={{ fillColor: '#00e5ff', color: '#00e5ff', fillOpacity: 0.15, weight: 2 }}
          radius={range * 1000} 
        />
      </MapContainer>
    </div>
  )
}