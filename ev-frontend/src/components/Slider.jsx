import { useState } from "react";

export default function Slider({ label, min, max, value, unit, onChange }) {
  const [isSliding, setIsSliding] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  let activeColor = '#00e5ff';

  if (label === 'Battery Level') {
    if (value <= 20) activeColor = '#ef4444';
    else if (value <= 50) activeColor = '#f59e0b';
    else activeColor = '#22c55e';
  } 
  else if (label === 'Cruising Speed') {
    if (value >= 120) activeColor = '#ef4444';
    else if (value >= 90) activeColor = '#f59e0b';
    else activeColor = '#22c55e';
  } 
  else if (label === 'Outside Temp') {
    if (value < 0) activeColor = '#3b82f6';       
    else if (value >= 35) activeColor = '#ef4444'; 
    else activeColor = '#22c55e';                
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      
      {/* Label */}
      <div className="flex justify-between text-sm font-medium">
        <span className="text-slate-400">{label}</span>
        <span
          className="font-semibold transition-colors duration-200"
          style={{ color: activeColor }}
        >
          {value}{unit}
        </span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseDown={() => setIsSliding(true)}
        onMouseUp={() => setIsSliding(false)}
        onTouchStart={() => setIsSliding(true)}
        onTouchEnd={() => setIsSliding(false)}
        className="w-full h-2 rounded-full appearance-none cursor-pointer transition-all duration-200"
        style={{
          background: `linear-gradient(to right, ${activeColor} ${percentage}%, #1e293b ${percentage}%)`,
          accentColor: activeColor,
          boxShadow: isSliding ? `0 0 8px ${activeColor}55` : 'none'
        }}
      />
    </div>
  );
}