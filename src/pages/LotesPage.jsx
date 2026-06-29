import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import { api } from '../lib/api'

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
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark">Lotes & pastos</div>
          <div className="text-[13px] text-text-secondary font-medium">{(lotes || []).length} lotes · {totalAnimais} animais</div>
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

function DesktopLotes() {
  const navigate = useNavigate()
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
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
        <div className="grid grid-cols-3 gap-[14px]">
          {(lotes || []).length === 0 && (
            <div className="col-span-3 text-center text-text-secondary py-[40px] text-[14px]">Nenhum lote cadastrado.</div>
          )}
          {(lotes || []).map(lote => {
            const qtd = lote.qtd_animais || 0
            const area = lote.area_ha ? parseFloat(lote.area_ha) : null

            return (
              <button
                key={lote.id}
                onClick={() => navigate(`/lotes/${lote.id}`)}
                className="bg-white border border-border rounded-[14px] p-[16px] cursor-pointer text-left hover:shadow-card transition-shadow"
              >
                <div className="flex justify-between items-baseline mb-[12px]">
                  <span className="text-[17px] font-extrabold text-primary-dark">{lote.nome}</span>
                  <span className="text-[12.5px] text-text-secondary font-semibold">{area ? `${area} ha` : '—'}</span>
                </div>
                {lote.capacidade ? (
                  <OcupacaoBar atual={qtd} capacidade={lote.capacidade} />
                ) : (
                  <>
                    <div className="flex justify-between text-[12.5px] mb-[6px]">
                      <span className="text-text-secondary font-semibold">Lotação</span>
                      <span className="font-mono font-bold text-primary">{qtd}</span>
                    </div>
                    <div className="h-[8px] bg-segmented-bg rounded-[6px]">
                      <div className="h-full rounded-[6px] bg-primary" style={{ width: '15%' }} />
                    </div>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default function LotesPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopLotes /> : <MobileLotes />
}
