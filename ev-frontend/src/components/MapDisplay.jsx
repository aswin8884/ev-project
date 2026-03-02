import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'

import { 
  FaLocationArrow, FaSpinner, FaCarSide, FaChargingStation, 
  FaMapPin, FaEuroSign, FaSatellite, FaPlus, FaMinus 
} from 'react-icons/fa'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix for default Leaflet marker icons
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

// Helper component to handle map movement and zoom
function MapController({ center, zoomLevel }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) map.flyTo(center, map.getZoom(), { duration: 1.5 });
  }, [center, map]);

  return null;
}

export default function MapDisplay({ range }) {
  const [location, setLocation] = useState(null) 
  const [stations, setStations] = useState([])
  const [loadingLoc, setLoadingLoc] = useState(false)
  const [gpsError, setGpsError] = useState(false)
  const [mapInstance, setMapInstance] = useState(null); // Reference to the actual map

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
          setLocation([48.7758, 9.1829]); // Fallback to Stuttgart
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGpsError(true);
      setLoadingLoc(false);
      setLocation([48.7758, 9.1829]);
    }
  };

  useEffect(() => {
    getGPSLocation();
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchStations = async () => {
      try {
        const localSearchRadius = 15000; 
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

  // Zoom Handlers
  const handleZoomIn = () => {
    if (mapInstance) mapInstance.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstance) mapInstance.zoomOut();
  };

  if (!range) return null;

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

      {/* Control Group: Zoom & GPS */}
      <div className="absolute bottom-10 right-10 z-[1000] flex flex-col gap-3">
        {/* Zoom Controls */}
        <div className="flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <button 
            onClick={handleZoomIn}
            className="p-4 text-cyan-400 hover:bg-slate-800 transition-colors border-b border-slate-700"
            title="Zoom In"
          >
            <FaPlus />
          </button>
          <button 
            onClick={handleZoomOut}
            className="p-4 text-cyan-400 hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <FaMinus />
          </button>
        </div>

        {/* GPS Button */}
        <button 
          onClick={getGPSLocation} 
          disabled={loadingLoc}
          className="p-4 bg-cyan-500 text-slate-900 rounded-2xl shadow-lg hover:bg-cyan-400 active:scale-90 transition-all group"
          title="Re-center Map"
        >
          {loadingLoc ? <FaSpinner className="animate-spin text-xl" /> : <FaLocationArrow className="text-xl group-hover:rotate-12 transition-transform" />}
        </button>
      </div>

      <MapContainer 
        center={location || [48.7758, 9.1829]} 
        zoom={12} 
        scrollWheelZoom={true} 
        zoomControl={false} 
        ref={setMapInstance} // Capture the map instance
        style={{ height: "100%", width: "100%", background: "#020617" }}
      >
        <MapController center={location} />
        
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {location && (
          <Marker position={location}>
            <Popup className="custom-popup">
              <div className="p-2">
                <h3 className="flex items-center gap-2 font-bold text-slate-900"><FaCarSide className="text-cyan-600" /> Your Vehicle</h3>
                <p className="text-xs text-slate-500">Telemetry Active</p>
              </div>
            </Popup>
          </Marker>
        )}

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