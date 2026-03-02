import { FaBolt, FaSpinner } from 'react-icons/fa'

export default function PredictButton({ onPredict, loading }) {
  return (
    <button
      onClick={onPredict}
      disabled={loading}
      className={`relative z-50 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
        loading
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-[1.02]'
      }`}
    >
      {loading ? (
        <><FaSpinner className="animate-spin" /> Predicting...</>
      ) : (
        <><FaBolt /> Calculate Range</>
      )}
    </button>
  )
}