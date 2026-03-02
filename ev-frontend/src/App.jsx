import { useState } from 'react'
import axios from 'axios'
import { FaBatteryFull, FaThermometerHalf, FaTachometerAlt, FaMapPin, FaBolt } from 'react-icons/fa'

// Components
import Header from './components/Header'
import CarSelector from './components/CarSelector'
import DrivingModeSelector from './components/DrivingModeSelector'
import AcToggle from './components/AcToggle'
import Slider from './components/Slider'
import TrafficBadge from './components/TrafficBadge'
import ResultDisplay from './components/ResultDisplay'
import MapDisplay from './components/MapDisplay'

function App() {
  const [battery, setBattery] = useState(85)
  const [temperature, setTemperature] = useState(-5)
  const [speed, setSpeed] = useState(80)
  const [acOn, setAcOn] = useState(false) 
  const [drivingMode, setDrivingMode] = useState(2) 
  const [carMultiplier, setCarMultiplier] = useState(1.0) 
  const [range, setRange] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const currentHour = new Date().getHours()
  let autoTrafficValue = 2
  let trafficLabel = "Moderate Traffic"
  let trafficColor = "text-yellow-400"

  if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 16 && currentHour <= 18)) {
    autoTrafficValue = 3
    trafficLabel = "Heavy (Rush Hour)"
    trafficColor = "text-red-500" 
  } else if (currentHour >= 20 || currentHour <= 5) {
    autoTrafficValue = 1
    trafficLabel = "Light (Clear Roads)"
    trafficColor = "text-green-500" 
  }

  const getPrediction = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/predict', {
        battery_percentage: battery,
        temperature_celsius: temperature,
        speed_kmh: speed,
        ac_on: acOn,
        driving_mode: drivingMode,
        traffic_condition: autoTrafficValue 
      });
      
      if (response.data && response.data.predicted_range_km !== undefined) {
        const finalRange = response.data.predicted_range_km * carMultiplier
        setRange(finalRange.toFixed(1))
      } else {
        throw new Error("Invalid response from server")
      }
      
    } catch (err) {
      console.error("API Error:", err)
      setError("Server connection failed. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-cyan-500/30">
      
      {/* LEFT SIDEBAR: Controls */}
      <aside className="w-full md:w-1/3 lg:w-1/4 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 shadow-2xl z-20 overflow-y-auto h-screen">
        
        <Header />

        <div className="flex flex-col gap-5">
          <CarSelector value={carMultiplier} onChange={setCarMultiplier} />
          <DrivingModeSelector value={drivingMode} onChange={setDrivingMode} />
          <AcToggle acOn={acOn} setAcOn={setAcOn} />
        </div>

        <hr className="border-slate-800 my-1" />

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <FaBatteryFull className="text-cyan-400 text-xl" /> 
            <div className="flex-grow">
              <Slider label="Battery Level" min="5" max="100" value={battery} unit="%" onChange={setBattery} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaThermometerHalf className="text-cyan-400 text-xl" /> 
            <div className="flex-grow">
              <Slider label="Outside Temp" min="-20" max="40" value={temperature} unit="°C" onChange={setTemperature} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaTachometerAlt className="text-cyan-400 text-xl" /> 
            <div className="flex-grow">
              <Slider label="Cruising Speed" min="30" max="160" value={speed} unit=" km/h" onChange={setSpeed} />
            </div>
          </div>
        </div>

        <TrafficBadge trafficLabel={trafficLabel} trafficColor={trafficColor} />

        {/* --- BOTTOM DASHBOARD SECTION --- */}
        <div className="mt-auto pt-4 flex flex-col gap-4">
          
          {/* THE NEW ESTIMATED RANGE BOX */}
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 shadow-inner flex items-center justify-center min-h-[100px]">
            <ResultDisplay range={range} error={error} />
          </div>

          <button
            onClick={getPrediction}
            disabled={loading}
            type="button"
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg cursor-pointer ${
              loading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-[1.02] active:scale-95'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <><FaBolt /> Calculate Range</>
            )}
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN AREA: Map Only */}
      <main className="w-full md:w-2/3 lg:w-3/4 flex flex-col relative h-screen bg-slate-950 overflow-hidden"> 
        
        {/* Floating results panel REMOVED entirely from here! */}

        {/* Map Container */}
        <div className="flex-grow relative z-0 h-full w-full">
          <MapDisplay range={range} />
          
          {!range && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 flex-col gap-4 bg-slate-950/80 backdrop-blur-sm z-10">
               <FaMapPin className="text-5xl opacity-50 text-cyan-500 animate-pulse"/>
               <p className="font-medium tracking-wide">Enter vehicle data and click Calculate</p>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

export default App