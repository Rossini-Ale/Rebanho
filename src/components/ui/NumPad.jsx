const KEYS = ['1','2','3','4','5','6','7','8','9',',','0','⌫']

export default function NumPad({ value = '', onChange }) {
  const press = (k) => {
    if (k === '⌫') return onChange(value.slice(0, -1))
    if (k === ',') return value.includes(',') ? null : onChange(value + k)
    onChange(value + k)
  }
  return (
    <div className="grid grid-cols-3 gap-[8px]">
      {KEYS.map(k => (
        <button
          key={k}
          type="button"
          onPointerDown={e => { e.preventDefault(); press(k) }}
          className="bg-white border border-[#e6e3da] rounded-[14px] py-[17px] text-[22px] font-bold text-primary-dark active:bg-chip-bg select-none cursor-pointer"
        >
          {k}
        </button>
      ))}
    </div>
  )
}
