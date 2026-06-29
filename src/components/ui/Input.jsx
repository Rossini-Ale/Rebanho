export default function Input({ label, value, onChange, mono = false, placeholder, type = 'text', error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <div className={`text-[12.5px] font-bold mb-[7px] uppercase tracking-[.04em] ${error ? 'text-danger' : 'text-text-secondary'}`}>
          {label}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-card border-[1.5px] rounded-button py-[14px] px-[16px] text-[15.5px] font-semibold text-primary-dark outline-none ${error ? 'border-danger' : 'border-field-border focus:border-primary'} ${mono ? 'font-mono text-[22px] font-bold' : ''}`}
        {...props}
      />
      {error && <div className="text-[12px] text-danger font-semibold mt-[5px]">{error}</div>}
    </div>
  )
}
