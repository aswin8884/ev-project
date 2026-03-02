import { FaCar } from 'react-icons/fa'

export default function CarSelector({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <FaCar className="text-cyan-400"/> Vehicle Model
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-3 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors appearance-none cursor-pointer shadow-inner"
      >
        <option value="1.0">Standard EV (e.g. VW ID.4)</option>
        <option value="1.15">High Efficiency (e.g. Tesla Model 3)</option>
        <option value="0.85">Performance EV (e.g. Porsche Taycan)</option>
      </select>
    </div>
  )
}