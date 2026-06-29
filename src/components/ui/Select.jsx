import { ChevronDown } from 'lucide-react'

export default function Select({ label, value, onChange, options = [], error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <div className={`text-[12.5px] font-bold mb-[7px] uppercase tracking-[.04em] ${error ? 'text-danger' : 'text-text-secondary'}`}>
          {label}
        </div>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`w-full appearance-none bg-card border-[1.5px] rounded-button py-[14px] px-[16px] pr-[40px] text-[15.5px] font-semibold text-primary-dark outline-none cursor-pointer ${error ? 'border-danger' : 'border-field-border focus:border-primary'}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={18} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
      </div>
      {error && <div className="text-[12px] text-danger font-semibold mt-[5px]">{error}</div>}
    </div>
  )
}
