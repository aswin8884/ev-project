import { FaLeaf, FaCarSide, FaTachometerAlt, FaCogs } from 'react-icons/fa'

export default function DrivingModeSelector({ value, onChange }) {
  const modes = [
    { id: 1, label: 'Eco', icon: <FaLeaf /> },
    { id: 2, label: 'Normal', icon: <FaCarSide /> },
    { id: 3, label: 'Sport', icon: <FaTachometerAlt /> },
  ]

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
         <FaCogs className="text-cyan-400" /> Driving Mode
      </label>
      <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shadow-inner">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              value === mode.id
                ? 'bg-cyan-500/20 text-cyan-400 shadow-sm border border-cyan-500/50'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            {mode.icon} {mode.label}
          </button>
        ))}
      </div>
    </div>
  )
}