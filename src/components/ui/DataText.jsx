export default function DataText({ children, size = 'base', weight = '700', color, as: Tag = 'span', className = '', ...props }) {
  return (
    <Tag
      className={`font-mono ${className}`}
      style={{ fontSize: size === 'base' ? undefined : size, fontWeight: weight, color }}
      {...props}
    >
      {children}
    </Tag>
  )
}
