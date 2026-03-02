import { FaSatelliteDish } from 'react-icons/fa'

export default function TrafficBadge({ trafficLabel, trafficColor }) {
  return (
    <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700 mt-2">
      <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
        <FaSatelliteDish className="animate-pulse text-cyan-500" />
        AI Live Context
      </div>
      <span className={`text-sm font-bold ${trafficColor}`}>
        {trafficLabel}
      </span>
    </div>
  )
}