export default function Button({ children, variant = 'primary', fullWidth = false, onClick, className = '', type = 'button', ...props }) {
  const base = 'rounded-button font-extrabold text-center transition-colors cursor-pointer'
  const sizes = fullWidth ? 'w-full py-[17px] text-[16.5px]' : 'py-[10px] px-[20px] text-[14px]'

  const variants = {
    primary: 'bg-primary text-white shadow-button hover:bg-primary-medium',
    secondary: 'bg-white border-[1.5px] border-[#cfd4c7] text-primary hover:bg-chip-bg',
    outline: 'bg-white border-[1.5px] border-primary text-primary hover:bg-chip-bg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${sizes} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
