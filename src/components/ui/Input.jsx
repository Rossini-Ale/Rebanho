export default function Input({ label, value, onChange, mono = false, placeholder, type = 'text', className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">
          {label}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-card border-[1.5px] border-field-border rounded-button py-[14px] px-[16px] text-[15.5px] font-semibold text-primary-dark outline-none focus:border-primary ${mono ? 'font-mono text-[22px] font-bold' : ''}`}
        {...props}
      />
    </div>
  )
}
