export default function KPITile({ label, value, subtitle, variant = 'default', className = '' }) {
  const isGreen = variant === 'primary'

  return (
    <div className={`rounded-[14px] p-[16px] ${
      isGreen
        ? 'bg-primary border border-primary'
        : 'bg-card border border-border'
    } ${className}`}>
      <div className={`text-[12.5px] font-semibold ${isGreen ? 'text-accent-light' : 'text-text-secondary'}`}>
        {label}
      </div>
      <div className={`font-mono text-[27px] font-extrabold ${isGreen ? 'text-white' : 'text-primary-dark'}`}>
        {value}
      </div>
      {subtitle && (
        <div className={`text-[12px] font-bold ${isGreen ? 'text-accent-light' : 'text-primary-medium'}`}>
          {subtitle}
        </div>
      )}
    </div>
  )
}
