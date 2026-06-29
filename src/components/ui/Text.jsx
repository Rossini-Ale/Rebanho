export default function Text({ children, size = 'base', weight = '600', color, as: Tag = 'span', className = '', ...props }) {
  return (
    <Tag
      className={`font-sans ${className}`}
      style={{ fontSize: size === 'base' ? undefined : size, fontWeight: weight, color }}
      {...props}
    >
      {children}
    </Tag>
  )
}
