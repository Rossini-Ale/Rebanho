export default function Chip({ children, active = false, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-pill text-[12.5px] font-semibold py-[7px] px-[13px] cursor-pointer transition-colors ${
        active
          ? 'bg-primary text-white font-bold'
          : 'bg-chip-bg text-text-body hover:bg-primary hover:text-white'
      } ${className}`}
    >
      {children}
    </button>
  )
}
