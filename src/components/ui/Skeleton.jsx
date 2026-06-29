export function SkeletonRow({ cols = 5 }) {
  return (
    <div className="grid px-[18px] py-[16px] border-b border-[#f0ede4] last:border-b-0 animate-pulse" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-[14px] bg-segmented-bg rounded-[6px]" style={{ width: `${50 + Math.random() * 40}%` }} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white border border-border rounded-[14px] overflow-hidden">
      <div className="grid px-[18px] py-[13px] border-b border-[#eee9df]" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-[12px] bg-segmented-bg rounded-[4px] w-[60%]" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </div>
  )
}

export function SkeletonKPI() {
  return (
    <div className="rounded-[14px] p-[16px] bg-card border border-border animate-pulse">
      <div className="h-[12px] bg-segmented-bg rounded-[4px] w-[70%] mb-[10px]" />
      <div className="h-[27px] bg-segmented-bg rounded-[6px] w-[50%] mb-[6px]" />
      <div className="h-[10px] bg-segmented-bg rounded-[4px] w-[40%]" />
    </div>
  )
}
