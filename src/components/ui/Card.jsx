export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-card border border-border rounded-[14px] shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
