export default function SegmentedControl({ options = [], value, onChange, className = '' }) {
  return (
    <div className={`flex bg-segmented-bg rounded-[13px] p-[4px] ${className}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 text-center py-[11px] text-[14.5px] font-bold rounded-chip cursor-pointer transition-colors ${
            value === opt.value
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:text-text-body'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
