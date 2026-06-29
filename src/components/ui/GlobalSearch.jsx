import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Search, Beef, CornerDownLeft } from 'lucide-react'
import { api } from '../../lib/api'
import { calcularIdade } from '../../lib/utils'

export default function GlobalSearch({ onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [animais, setAnimais] = useState([])
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    inputRef.current?.focus()
    api.animais.listar().then(setAnimais).catch(() => {})
  }, [])

  const results = query.length >= 1
    ? animais.filter(a => {
        const q = query.toLowerCase()
        return a.brinco.toLowerCase().includes(q) || (a.raca || '').toLowerCase().includes(q) || (a.lote_nome || '').toLowerCase().includes(q)
      }).slice(0, 8)
    : []

  const go = (id) => {
    onClose()
    navigate(`/animais/${id}`)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) go(results[selected].id)
  }

  useEffect(() => { setSelected(0) }, [query])

  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-start justify-center pt-[15vh]" style={{ animation: 'modalFadeIn 0.15s ease-out' }}>
      <div className="absolute inset-0 bg-[rgba(15,22,16,0.25)]" style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div
        className="relative bg-white rounded-[18px] w-[520px] shadow-[0_24px_64px_rgba(0,0,0,0.2)] overflow-hidden"
        style={{ animation: 'modalSlideUp 0.2s ease-out' }}
      >
        <div className="flex items-center gap-[12px] px-[20px] py-[16px] border-b border-border">
          <Search size={18} className="text-text-secondary shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar animal por brinco, raça ou lote…"
            className="flex-1 border-none outline-none bg-transparent text-[15px] font-medium text-primary-dark placeholder:text-text-secondary"
          />
          <kbd className="text-[11px] font-mono font-bold text-text-secondary bg-segmented-bg rounded-[6px] py-[3px] px-[7px]">ESC</kbd>
        </div>

        {results.length > 0 && (
          <div className="max-h-[360px] overflow-auto py-[6px]">
            {results.map((a, i) => (
              <button
                key={a.id}
                onClick={() => go(a.id)}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center gap-[12px] px-[20px] py-[12px] border-none cursor-pointer text-left transition-colors ${
                  i === selected ? 'bg-chip-bg' : 'bg-transparent hover:bg-[#faf9f5]'
                }`}
              >
                <span className="w-[36px] h-[36px] rounded-[10px] bg-segmented-bg flex items-center justify-center shrink-0">
                  <Beef size={18} className="text-primary-medium" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[15px] font-bold text-primary-dark">{a.brinco}</div>
                  <div className="text-[12.5px] text-text-secondary font-medium">{a.raca} · {a.sexo} · {a.lote_nome || 'Sem lote'}</div>
                </div>
                {a.peso_atual && <span className="font-mono text-[13px] font-bold text-text-body shrink-0">{parseFloat(a.peso_atual)} kg</span>}
                {i === selected && <CornerDownLeft size={14} className="text-text-secondary shrink-0 ml-[4px]" />}
              </button>
            ))}
          </div>
        )}

        {query.length >= 1 && results.length === 0 && (
          <div className="py-[32px] text-center text-text-secondary text-[14px] font-medium">Nenhum animal encontrado</div>
        )}

        {query.length === 0 && (
          <div className="py-[24px] text-center text-text-secondary text-[13px] font-medium">
            Digite para buscar animais…
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
