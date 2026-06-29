import { ChevronDown } from 'lucide-react'

export default function Select({ label, value, onChange, options = [], className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">
          {label}
        </div>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none bg-card border-[1.5px] border-field-border rounded-button py-[14px] px-[16px] pr-[40px] text-[15.5px] font-semibold text-primary-dark outline-none focus:border-primary cursor-pointer"
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={18} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
      </div>
    </div>
  )
}
