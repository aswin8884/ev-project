import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'

import { 
  FaLocationArrow, FaSpinner, FaCarSide, FaChargingStation, 
  FaMapPin, FaEuroSign, FaSatellite 
} from 'react-icons/fa'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix for default Leaflet marker icons in React
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

// Helper component to handle map movement
function MapPanner({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 12, { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function MapDisplay({ range }) {
  // Initialize as null to prevent "jumping" from a random location
  const [location, setLocation] = useState(null) 
  const [stations, setStations] = useState([])
  const [loadingLoc, setLoadingLoc] = useState(false)
  const [gpsError, setGpsError] = useState(false)

  // 1. Function to fetch GPS coordinates
  const getGPSLocation = () => {
    setLoadingLoc(true);
    setGpsError(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.latitude, position.coords.longitude]);
          setLoadingLoc(false);
        },
        (error) => {
          console.error("GPS Error:", error);
          setGpsError(true);
          setLoadingLoc(false);
          // Fallback to a default center (Stuttgart) if user denies permission
          setLocation([48.7758, 9.1829]);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGpsError(true);
      setLoadingLoc(false);
      setLocation([48.7758, 9.1829]); // Fallback
    }
  };

  // 2. Fetch location immediately when component mounts
  useEffect(() => {
    getGPSLocation();
  }, []);

  // 3. Fetch Local Charging Stations when location is found
  useEffect(() => {
    if (!location) return;

    const fetchStations = async () => {
      try {
        const localSearchRadius = 15000; // 15km search radius
        const query = `[out:json];node[amenity=charging_station](around:${localSearchRadius},${location[0]},${location[1]});out 50;`;
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await response.json();
        setStations(data.elements || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchStations();
  }, [location]);

  // If no range calculation has been made yet, keep the map hidden (Parent control)
  if (!range) return null;

  // Show a "Locating..." screen instead of a blank map or wrong city
  if (!location && !gpsError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-4">
        <FaSatellite className="text-5xl text-cyan-500 animate-pulse" />
        <div className="flex items-center gap-2">
          <FaSpinner className="animate-spin" />
          <p className="tracking-widest uppercase text-sm font-bold">Initializing GPS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative z-0 animate-in fade-in duration-700">
      
      {/* Top Status Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-6 py-2 rounded-full shadow-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-cyan-50 font-mono font-bold tracking-tight">
             MAX RANGE: {range} km
          </span>
        </div>
      </div>

      {/* Manual GPS Re-center Button */}
      <button 
        onClick={getGPSLocation} 
        disabled={loadingLoc}
        className="absolute bottom-10 right-10 z-[1000] p-4 bg-cyan-500 text-slate-900 rounded-2xl shadow-lg hover:bg-cyan-400 active:scale-90 transition-all group"
      >
        {loadingLoc ? <FaSpinner className="animate-spin text-xl" /> : <FaLocationArrow className="text-xl group-hover:rotate-12 transition-transform" />}
      </button>

      <MapContainer 
        center={location || [48.7758, 9.1829]} 
        zoom={12} 
        scrollWheelZoom={true} 
        zoomControl={false} // Clean look
        style={{ height: "100%", width: "100%", background: "#020617" }}
      >
        <MapPanner center={location} />
        
        {/* Dark Mode Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Your Car Marker */}
        {location && (
          <Marker position={location}>
            <Popup className="custom-popup">
              <div className="p-2">
                <h3 className="flex items-center gap-2 font-bold text-slate-900"><FaCarSide className="text-cyan-600" /> Your Vehicle</h3>
                <p className="text-xs text-slate-500">Currently analyzing nearby chargers...</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Charging Stations Cluster */}
        <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
          {stations.map((station) => {
            const tags = station.tags || {};
            const operator = tags.operator || tags.brand || "EV Charger";
            const fee = tags.fee === "no" ? "Free" : "Paid";
            
            return (
              <Marker key={`station-${station.id}`} position={[station.lat, station.lon]}>
                <Popup className="custom-popup">
                  <div className="min-w-[200px] font-sans">
                    <h3 className="flex items-center gap-2 font-bold text-slate-800 border-b pb-2 mb-2">
                      <FaChargingStation className="text-green-600"/> {operator}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-slate-600">
                        <FaMapPin className="mt-1 text-red-500 flex-shrink-0"/> 
                        <span>{tags['addr:street'] || "Unknown Street"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <FaEuroSign className="text-green-600"/> 
                        <span className="font-semibold uppercase text-xs px-2 py-0.5 bg-slate-100 rounded-md">{fee}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>

        {/* Range Coverage Circle */}
        {location && (
          <Circle
            key={`circle-${range}-${location[0]}`} 
            center={location}
            pathOptions={{ 
              fillColor: '#06b6d4', 
              color: '#06b6d4', 
              fillOpacity: 0.1, 
              weight: 1,
              dashArray: "5, 10" 
            }}
            radius={range * 1000} 
          />
        )}
      </MapContainer>
    </div>
  )
}