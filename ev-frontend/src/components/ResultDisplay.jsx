export default function ResultDisplay({ range, error }) {
  if (error) {
    return <div className="text-red-400 text-sm font-medium p-3 bg-red-900/20 rounded-lg border border-red-900 w-full text-center">{error}</div>
  }

  if (!range) {
    return (
      <div className="text-slate-500 text-center w-full">
        <h2 className="text-sm font-bold text-slate-400 tracking-wider">AWAITING DATA</h2>
        <p className="text-xs mt-1">Run prediction to calculate.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full text-center">
      <h2 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Estimated Range</h2>
      
      <div className="flex items-baseline justify-center gap-2">
        {/* Shrunk slightly from 6xl to 5xl to ensure it fits mobile sidebars perfectly */}
        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-sm">
          {range}
        </span>
        <span className="text-2xl text-slate-300 font-bold">km</span>
      </div>
    </div>
  )
}