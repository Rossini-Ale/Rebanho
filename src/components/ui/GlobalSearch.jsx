import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Search, Beef, Fence, ShieldCheck, CornerDownLeft } from 'lucide-react'
import { api } from '../../lib/api'

const CATEGORIAS = [
  { key: 'animais', label: 'Animais', icon: Beef, color: 'text-primary-medium', bg: 'bg-segmented-bg' },
  { key: 'lotes', label: 'Lotes', icon: Fence, color: 'text-warning', bg: 'bg-[#fdf6e7]' },
  { key: 'sanidade', label: 'Sanidade', icon: ShieldCheck, color: 'text-primary', bg: 'bg-chip-bg' },
]

export default function GlobalSearch({ onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [dados, setDados] = useState({ animais: [], lotes: [], sanidade: [] })
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    inputRef.current?.focus()
    Promise.all([
      api.animais.listar().catch(() => []),
      api.lotes.listar().catch(() => []),
      api.sanidade.listar().catch(() => []),
    ]).then(([animais, lotes, sanidade]) => setDados({ animais, lotes, sanidade }))
  }, [])

  const results = query.length >= 1 ? (() => {
    const q = query.toLowerCase()
    const animais = dados.animais
      .filter(a => a.brinco.toLowerCase().includes(q) || (a.raca || '').toLowerCase().includes(q) || (a.lote_nome || '').toLowerCase().includes(q))
      .slice(0, 5)
      .map(a => ({ tipo: 'animais', id: a.id, titulo: a.brinco, sub: `${a.raca} · ${a.sexo} · ${a.lote_nome || 'Sem lote'}`, extra: a.peso_atual ? `${parseFloat(a.peso_atual)} kg` : null }))

    const lotes = dados.lotes
      .filter(l => l.nome.toLowerCase().includes(q) || (l.tipo || '').toLowerCase().includes(q))
      .slice(0, 3)
      .map(l => ({ tipo: 'lotes', id: l.id, titulo: l.nome, sub: `${l.tipo || 'pasto'} · ${l.qtd_animais || 0} animais`, extra: l.area_ha ? `${parseFloat(l.area_ha)} ha` : null }))

    const sanidade = dados.sanidade
      .filter(e => (e.produto || '').toLowerCase().includes(q) || (e.lote_nome || '').toLowerCase().includes(q))
      .slice(0, 3)
      .map(e => ({ tipo: 'sanidade', id: e.id, titulo: e.produto, sub: `${e.tipo} · ${e.lote_nome || 'Individual'}`, extra: null }))

    return [...animais, ...lotes, ...sanidade]
  })() : []

  const goToResult = (r) => {
    onClose()
    if (r.tipo === 'animais') navigate(`/animais/${r.id}`)
    else if (r.tipo === 'lotes') navigate(`/lotes/${r.id}`)
    else navigate('/sanidade')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) goToResult(results[selected])
  }

  useEffect(() => { setSelected(0) }, [query])

  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-start justify-center pt-[15vh]" style={{ animation: 'modalFadeIn 0.15s ease-out' }}>
      <div className="absolute inset-0 bg-[rgba(15,22,16,0.25)]" style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div className="relative bg-white rounded-[18px] w-[540px] shadow-[0_24px_64px_rgba(0,0,0,0.2)] overflow-hidden" style={{ animation: 'modalSlideUp 0.2s ease-out' }}>
        <div className="flex items-center gap-[12px] px-[20px] py-[16px] border-b border-border">
          <Search size={18} className="text-text-secondary shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar animais, lotes, produtos sanitários…"
            className="flex-1 border-none outline-none bg-transparent text-[15px] font-medium text-primary-dark placeholder:text-text-secondary"
          />
          <kbd className="text-[11px] font-mono font-bold text-text-secondary bg-segmented-bg rounded-[6px] py-[3px] px-[7px]">ESC</kbd>
        </div>

        {results.length > 0 && (
          <div className="max-h-[400px] overflow-auto py-[6px]">
            {results.map((r, i) => {
              const cat = CATEGORIAS.find(c => c.key === r.tipo)
              const Icon = cat?.icon || Beef
              return (
                <button
                  key={`${r.tipo}-${r.id}`}
                  onClick={() => goToResult(r)}
                  onMouseEnter={() => setSelected(i)}
                  className={`w-full flex items-center gap-[12px] px-[20px] py-[11px] border-none cursor-pointer text-left transition-colors ${i === selected ? 'bg-chip-bg' : 'bg-transparent hover:bg-[#faf9f5]'}`}
                >
                  <span className={`w-[34px] h-[34px] rounded-[10px] ${cat?.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={17} className={cat?.color} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[14.5px] font-bold text-primary-dark leading-tight">{r.titulo}</div>
                    <div className="text-[12px] text-text-secondary font-medium mt-[1px]">{r.sub}</div>
                  </div>
                  <div className="flex items-center gap-[8px] shrink-0">
                    {r.extra && <span className="font-mono text-[12.5px] font-bold text-text-body">{r.extra}</span>}
                    <span className="text-[11px] font-bold text-text-secondary bg-segmented-bg rounded-[6px] py-[2px] px-[6px]">{cat?.label}</span>
                    {i === selected && <CornerDownLeft size={13} className="text-text-secondary" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {query.length >= 1 && results.length === 0 && (
          <div className="py-[28px] text-center text-text-secondary text-[14px] font-medium">Nenhum resultado para "{query}"</div>
        )}

        {query.length === 0 && (
          <div className="py-[20px] px-[20px]">
            <div className="text-[12px] font-bold text-text-secondary uppercase tracking-[.04em] mb-[10px]">Buscar em</div>
            <div className="flex gap-[8px]">
              {CATEGORIAS.map(c => {
                const Icon = c.icon
                return (
                  <div key={c.key} className={`flex items-center gap-[6px] ${c.bg} rounded-chip py-[7px] px-[12px]`}>
                    <Icon size={14} className={c.color} />
                    <span className="text-[12.5px] font-bold text-text-body">{c.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>,
    document.body,
  )
}
