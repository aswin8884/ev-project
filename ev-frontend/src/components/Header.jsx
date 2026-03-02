import { FaBolt } from 'react-icons/fa'

export default function Header() {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-white">
        <FaBolt className="text-cyan-400" /> EV Simulator
      </h1>
      <p className="text-slate-400 text-sm mt-1">Telemetry & Range Prediction</p>
    </div>
  )
}