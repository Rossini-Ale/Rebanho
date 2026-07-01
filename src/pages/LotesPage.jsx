import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import { api } from '../lib/api'
import { Fence, ChevronLeft } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonTable } from '../components/ui/Skeleton'

function OcupacaoBar({ atual, capacidade }) {
  if (!capacidade) return null
  const pct = Math.round((atual / capacidade) * 100)
  const color = pct >= 85 ? '#b54a2f' : pct >= 65 ? '#c9882a' : '#588157'

  return (
    <>
      <div className="flex justify-between text-[12.5px] mb-[6px]">
        <span className="text-text-secondary font-semibold">Lotação</span>
        <span className="font-mono font-bold" style={{ color }}>{atual} / {capacidade}</span>
      </div>
      <div className="h-[8px] bg-segmented-bg rounded-[6px]">
        <div className="h-full rounded-[6px]" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
    </>
  )
}

function MobileLotes() {
  const navigate = useNavigate()
  const { data: lotes, loading } = useApi(() => api.lotes.listar(), [])
  const totalAnimais = (lotes || []).reduce((s, l) => s + (l.qtd_animais || 0), 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-[22px] pt-[8px] pb-[14px]">
        <div className="flex items-center gap-[12px]">
          <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0">
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="text-[21px] font-extrabold text-primary-dark">Lotes & pastos</div>
            <div className="text-[13px] text-text-secondary font-medium">{(lotes || []).length} lotes · {totalAnimais} animais</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/lotes/novo')}
          className="w-[38px] h-[38px] rounded-sidebar-item bg-primary text-white text-[24px] font-semibold flex items-center justify-center cursor-pointer border-none leading-none"
        >+</button>
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[8px] flex flex-col gap-[11px]">
        {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
        {(lotes || []).map(lote => {
          const qtd = lote.qtd_animais || 0

          if (!lote.capacidade) {
            return (
              <button
                key={lote.id}
                onClick={() => navigate(`/lotes/${lote.id}`)}
                className="bg-white border border-[#eee9df] rounded-[14px] py-[14px] px-[16px] shadow-card flex justify-between items-center cursor-pointer w-full text-left"
              >
                <div>
                  <div className="text-[16px] font-extrabold text-primary-dark">{lote.nome}</div>
                  <div className="text-[12.5px] text-text-secondary font-semibold">manejo · sem lotação fixa</div>
                </div>
                <span className="font-mono text-[18px] font-bold text-primary-dark">{qtd}</span>
              </button>
            )
          }

          return (
            <button
              key={lote.id}
              onClick={() => navigate(`/lotes/${lote.id}`)}
              className="bg-white border border-[#eee9df] rounded-[14px] py-[14px] px-[16px] shadow-card cursor-pointer w-full text-left"
            >
              <div className="flex justify-between items-baseline mb-[9px]">
                <span className="text-[16px] font-extrabold text-primary-dark">{lote.nome}</span>
                <span className="text-[12.5px] text-text-secondary font-semibold">{lote.area_ha ? `${parseFloat(lote.area_ha)} ha` : ''}</span>
              </div>
              <OcupacaoBar atual={qtd} capacidade={lote.capacidade} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

const tipoStyle = {
  pasto: { label: 'Pasto', color: '#588157', bg: '#e7ece4' },
  curral: { label: 'Curral', color: '#a9711f', bg: '#f6eed9' },
  maternidade: { label: 'Maternidade', color: '#8b5cf6', bg: '#f0e7fb' },
}

function TipoBadge({ tipo }) {
  const s = tipoStyle[tipo] || { label: tipo || '—', color: '#7c8378', bg: '#eceadf' }
  return (
    <span className="text-[12px] font-bold py-[4px] px-[10px] rounded-[14px]" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  )
}

function OcupacaoCell({ qtd, capacidade }) {
  if (!capacidade) return <span className="text-text-secondary text-[13px]">&mdash;</span>
  const pct = Math.round((qtd / capacidade) * 100)
  const color = pct >= 85 ? '#b54a2f' : pct >= 65 ? '#c9882a' : '#588157'
  return (
    <div className="flex items-center gap-[10px]">
      <div className="flex-1 h-[8px] bg-segmented-bg rounded-[6px]">
        <div className="h-full rounded-[6px]" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <span className="font-mono text-[12px] font-bold shrink-0" style={{ color }}>{qtd}/{capacidade}</span>
    </div>
  )
}

function DesktopLotes() {
  const navigate = useNavigate()
  const { data: lotes, loading } = useApi(() => api.lotes.listar(), [])
  const totalAnimais = (lotes || []).reduce((s, l) => s + (l.qtd_animais || 0), 0)

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Lotes & pastos</div>
          <div className="text-[13px] text-text-secondary font-medium">{(lotes || []).length} lotes · {totalAnimais} animais</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <button
            onClick={() => navigate('/lotes/novo')}
            className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none"
          >+ Novo lote</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[22px_26px] bg-header-bg">
        {loading && <SkeletonTable rows={5} cols={5} />}
        {!loading && (lotes || []).length === 0 && (
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <EmptyState icon={Fence} title="Nenhum lote cadastrado" description="Crie lotes e pastos para organizar seus animais." actionLabel="Criar lote" onAction={() => navigate('/lotes/novo')} />
          </div>
        )}
        {!loading && (lotes || []).length > 0 && (
        <div className="bg-white border border-border rounded-[14px] overflow-hidden">
          <div className="grid grid-cols-[1.2fr_.8fr_.6fr_1.4fr_.8fr] px-[18px] py-[12px] text-[12px] font-semibold text-text-secondary border-b border-border">
            <span>Nome</span><span>Tipo</span><span>Animais</span><span>Ocupação</span><span>Peso médio</span>
          </div>
          {(lotes || []).map(lote => {
            const qtd = lote.qtd_animais || 0
            const pesoMedio = lote.peso_medio ? `${parseFloat(lote.peso_medio).toFixed(0)} kg` : '—'

            return (
              <button
                key={lote.id}
                onClick={() => navigate(`/lotes/${lote.id}`)}
                className="grid grid-cols-[1.2fr_.8fr_.6fr_1.4fr_.8fr] px-[18px] py-[14px] text-[14px] items-center cursor-pointer w-full text-left bg-transparent hover:bg-[#f5f3ec] transition-colors"
              >
                <span className="font-extrabold text-primary-dark">{lote.nome}</span>
                <span><TipoBadge tipo={lote.tipo} /></span>
                <span className="font-mono font-bold text-primary-dark">{qtd}</span>
                <span><OcupacaoCell qtd={qtd} capacidade={lote.capacidade} /></span>
                <span className="font-mono font-semibold text-text-body">{pesoMedio}</span>
              </button>
            )
          })}
        </div>
        )}
      </div>
    </>
  )
}

export default function LotesPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopLotes /> : <MobileLotes />
}
