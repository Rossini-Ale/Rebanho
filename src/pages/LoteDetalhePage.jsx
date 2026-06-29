import { useParams, useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import KPITile from '../components/ui/KPITile'
import { api } from '../lib/api'
import { ChevronLeft } from 'lucide-react'

const situacaoStyle = {
  ativo: { color: '#588157', bg: '#e7ece4' },
  prenhe: { color: '#a9711f', bg: '#f6eed9' },
  quarentena: { color: '#b54a2f', bg: '#f6e7e1' },
}

function AnimalThumbSmall() {
  return (
    <span className="shrink-0 rounded-[9px]" style={{ width: 34, height: 34, background: 'repeating-linear-gradient(135deg,#e7e3d8,#e7e3d8 6px,#ddd8ca 6px,#ddd8ca 12px)' }} />
  )
}

function MobileDetalhe({ lote, animaisDoLote }) {
  const navigate = useNavigate()
  const qtd = animaisDoLote.length
  const area = lote.area_ha ? parseFloat(lote.area_ha) : null

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-[20px] pt-[8px] pb-[14px]">
        <div className="flex items-center gap-[14px]">
          <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
          <span className="text-[19px] font-extrabold text-primary-dark">{lote.nome}</span>
        </div>
        <span className="text-[13px] font-bold text-primary cursor-pointer">Editar</span>
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[8px]">
        <div className="bg-primary rounded-[16px] p-[16px_18px] mb-[14px] flex justify-between">
          <div>
            <div className="text-[12px] text-accent-light font-semibold">Lotação</div>
            <div className="font-mono text-[24px] font-bold text-white">
              {lote.capacidade ? `${qtd} / ${lote.capacidade}` : qtd}
            </div>
          </div>
          {area && (
            <div className="text-right">
              <div className="text-[12px] text-accent-light font-semibold">Área</div>
              <div className="text-[18px] font-bold text-white">{area} ha</div>
            </div>
          )}
        </div>

        <div className="flex gap-[10px] mb-[16px]">
          <button onClick={() => navigate('/sanidade/novo')} className="flex-1 bg-white border border-[#eee9df] rounded-[13px] py-[13px] px-[8px] text-center text-[13px] font-bold text-primary cursor-pointer">Vacinar</button>
          <button onClick={() => navigate(`/registrar-peso?lote=${lote.id}`)} className="flex-1 bg-white border border-[#eee9df] rounded-[13px] py-[13px] px-[8px] text-center text-[13px] font-bold text-primary cursor-pointer">Pesar</button>
          <button onClick={() => navigate(`/mover-lote?lote=${lote.id}`)} className="flex-1 bg-white border border-[#eee9df] rounded-[13px] py-[13px] px-[8px] text-center text-[13px] font-bold text-primary cursor-pointer">Mover</button>
        </div>

        <div className="text-[13px] font-extrabold text-text-secondary uppercase tracking-[.04em] mb-[8px]">Animais ({qtd})</div>
        {animaisDoLote.map(a => (
          <button key={a.id} onClick={() => navigate(`/animais/${a.id}`)} className="w-full bg-white border border-[#eee9df] rounded-[12px] py-[11px] px-[14px] mb-[8px] flex items-center gap-[12px] cursor-pointer text-left">
            <AnimalThumbSmall />
            <span className="font-mono text-[16px] font-bold text-primary-dark">{a.brinco}</span>
            <span className="flex-1 text-[12.5px] text-text-secondary font-medium text-right">{a.raca} · {a.peso_atual ? `${parseFloat(a.peso_atual)}kg` : '—'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function DesktopDetalhe({ lote, animaisDoLote }) {
  const navigate = useNavigate()
  const qtd = animaisDoLote.length
  const area = lote.area_ha ? parseFloat(lote.area_ha) : null
  const pesos = animaisDoLote.filter(a => a.peso_atual).map(a => parseFloat(a.peso_atual))
  const pm = pesos.length ? Math.round(pesos.reduce((s, p) => s + p, 0) / pesos.length) : 0
  const pctOcupado = lote.capacidade ? Math.round((qtd / lote.capacidade) * 100) : null

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">{lote.nome}</div>
          <div className="text-[13px] text-text-secondary font-medium">
            {area ? `${area} ha · ` : ''}{qtd} animais{lote.capacidade ? ` · capacidade ${lote.capacidade}` : ''}
          </div>
        </div>
        <div className="flex gap-[10px] items-center">
          <button onClick={() => navigate('/sanidade/novo')} className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none">Vacinar lote</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[22px_26px] bg-header-bg">
        <div className="grid grid-cols-4 gap-[14px] mb-[16px]">
          <KPITile label="Lotação" value={lote.capacidade ? `${qtd} / ${lote.capacidade}` : String(qtd)} subtitle={pctOcupado !== null ? `${pctOcupado}% ocupado` : ''} />
          <KPITile label="Área" value={area ? `${area} ha` : '—'} />
          <KPITile label="Peso médio" value={pm ? `${pm} kg` : '—'} />
          <KPITile label="Tipo" value={lote.tipo || '—'} variant="primary" />
        </div>

        <div className="flex gap-[10px] mb-[16px]">
          <button onClick={() => navigate('/sanidade/novo')} className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer">Vacinar lote</button>
          <button onClick={() => navigate(`/registrar-peso?lote=${lote.id}`)} className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer">Pesar lote</button>
          <button onClick={() => navigate(`/mover-lote?lote=${lote.id}`)} className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer">Mover animais</button>
        </div>

        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="grid grid-cols-[90px_1fr_.8fr_.9fr_1fr] py-[10px] px-[4px] text-[12px] font-bold text-text-secondary uppercase">
            <span>Brinco</span><span>Raça</span><span>Sexo</span><span>Peso</span><span>Situação</span>
          </div>
          {animaisDoLote.map(a => {
            const s = situacaoStyle[a.situacao] || situacaoStyle.ativo
            return (
              <button key={a.id} onClick={() => navigate(`/animais/${a.id}`)} className="grid grid-cols-[90px_1fr_.8fr_.9fr_1fr] py-[11px] px-[4px] text-[13.5px] border-t border-[#f0ede4] text-text-body items-center cursor-pointer w-full text-left bg-transparent hover:bg-[#faf9f5] transition-colors">
                <span className="font-mono font-bold text-primary-dark">{a.brinco}</span>
                <span>{a.raca}</span>
                <span>{a.sexo}</span>
                <span className="font-mono">{a.peso_atual ? `${parseFloat(a.peso_atual)} kg` : '—'}</span>
                <span><span className="text-[11.5px] font-bold py-[3px] px-[9px] rounded-[12px]" style={{ color: s.color, background: s.bg }}>{a.situacao.charAt(0).toUpperCase() + a.situacao.slice(1)}</span></span>
              </button>
            )
          })}
          {animaisDoLote.length === 0 && (
            <div className="py-[24px] text-center text-text-secondary text-[14px]">Nenhum animal neste lote.</div>
          )}
        </div>
      </div>
    </>
  )
}

export default function LoteDetalhePage() {
  const { id } = useParams()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { data: lote, loading } = useApi(() => api.lotes.buscar(id), [id])
  const { data: animaisDoLote } = useApi(() => api.lotes.animais(id), [id])

  if (loading) return <div className="flex-1 flex items-center justify-center text-text-secondary">Carregando…</div>
  if (!lote) return <div className="flex-1 flex items-center justify-center text-text-secondary">Lote não encontrado.</div>

  return isDesktop
    ? <DesktopDetalhe lote={lote} animaisDoLote={animaisDoLote || []} />
    : <MobileDetalhe lote={lote} animaisDoLote={animaisDoLote || []} />
}
