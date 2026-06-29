const urgencyColors = {
  vencido: '#b54a2f',
  proximo: '#c9882a',
  agendado: '#588157',
}

export default function AlertCard({ urgency = 'agendado', title, subtitle, deadline, className = '' }) {
  const color = urgencyColors[urgency]

  return (
    <div
      className={`bg-card border border-[#eee9df] rounded-[14px] p-[14px_16px] shadow-card ${className}`}
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex justify-between items-center mb-[4px]">
        <span className="text-[15px] font-bold text-primary-dark">{title}</span>
        <span className="w-[9px] h-[9px] rounded-full" style={{ background: color }} />
      </div>
      {subtitle && (
        <div className="text-[13.5px] text-text-secondary font-medium">{subtitle}</div>
      )}
      {deadline && (
        <div className="text-[12.5px] font-bold mt-[5px]" style={{ color }}>
          {deadline}
        </div>
      )}
    </div>
  )
}
