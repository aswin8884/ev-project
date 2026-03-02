import { FaSnowflake } from 'react-icons/fa'

export default function AcToggle({ acOn, setAcOn }) {
  return (
    <div 
      className="flex items-center justify-between bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer" 
      onClick={() => setAcOn(!acOn)}
    >
      <label className="font-medium flex items-center gap-3 text-slate-200 cursor-pointer pointer-events-none">
        <FaSnowflake className={`text-lg transition-colors duration-300 ${acOn ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-slate-600'}`}/>
        AC / Climate Control
      </label>
      
      <div 
        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 ${
          acOn ? 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-slate-700'
        }`}
      >
        <span 
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
            acOn ? 'translate-x-7' : 'translate-x-1'
          }`} 
        />
      </div>
    </div>
  )
}