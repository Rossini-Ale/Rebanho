import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import KPITile from '../components/ui/KPITile'
import Chip from '../components/ui/Chip'
import Button from '../components/ui/Button'
import { api } from '../lib/api'
import { fmtDataCurta } from '../lib/utils'
import { ChevronLeft } from 'lucide-react'

const urgenciaColors = { vencido: '#b54a2f', proximo: '#c9882a', agendado: '#588157' }

function classifyEvent(ev) {
  if (!ev.data_proxima_dose) return 'agendado'
  const diff = (new Date(ev.data_proxima_dose) - new Date()) / 86400000
  if (diff < 0) return 'vencido'
  if (diff <= 7) return 'proximo'
  return 'agendado'
}

function statusText(ev, urg) {
  if (!ev.data_proxima_dose) return fmtDataCurta(ev.data)
  const d = new Date(ev.data_proxima_dose)
  const diff = Math.round((d - new Date()) / 86400000)
  if (urg === 'vencido') return `Atrasado há ${Math.abs(diff)} dias`
  return `${fmtDataCurta(ev.data_proxima_dose)} · em ${diff} dias`
}

function MobileSanidade() {
  const [aba, setAba] = useState('proximas')
  const navigate = useNavigate()
  const { data: eventos, loading } = useApi(() => api.sanidade.listar(), [])

  const all = (eventos || []).map(ev => ({ ...ev, urgencia: classifyEvent(ev) }))
  const proximas = all.filter(e => e.data_proxima_dose)
  const historico = all.filter(e => !e.data_proxima_dose || new Date(e.data_proxima_dose) < new Date(e.data))

  const vencidos = proximas.filter(e => e.urgencia === 'vencido')
  const prox = proximas.filter(e => e.urgencia !== 'vencido')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[14px] px-[20px] pt-[8px] pb-[12px]">
        <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
        <span className="text-[19px] font-extrabold text-primary-dark">Sanidade</span>
      </div>

      <div className="flex bg-segmented-bg rounded-[13px] p-[4px] mx-[22px] mb-[14px]">
        {['proximas', 'historico'].map(a => (
          <button key={a} onClick={() => setAba(a)} className={`flex-1 text-center py-[9px] text-[14px] font-bold rounded-chip cursor-pointer border-none ${aba === a ? 'bg-primary text-white' : 'text-text-secondary bg-transparent'}`}>
            {a === 'proximas' ? 'Próximas' : 'Histórico'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[8px] flex flex-col gap-[11px]">
        {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
        {aba === 'proximas' ? (
          <>
            {vencidos.length > 0 && <div className="text-[12.5px] font-extrabold text-danger uppercase tracking-[.04em]">Vencido</div>}
            {vencidos.map(ev => (
              <div key={ev.id} className="bg-white border border-[#eee9df] rounded-[14px] py-[14px] px-[16px]" style={{ borderLeft: '4px solid #b54a2f' }}>
                <div className="text-[15px] font-bold text-primary-dark">{ev.produto}</div>
                <div className="text-[13px] text-text-secondary font-medium mt-[2px]">{ev.lote_nome ? `Lote ${ev.lote_nome}` : 'Individual'} · {ev.qtd_animais || 1} animais</div>
                <div className="text-[12.5px] font-bold text-danger mt-[5px]">{statusText(ev, 'vencido')}</div>
              </div>
            ))}
            {prox.length > 0 && <div className="text-[12.5px] font-extrabold text-text-secondary uppercase tracking-[.04em] mt-[4px]">Próximos 7 dias</div>}
            {prox.map(ev => (
              <div key={ev.id} className="bg-white border border-[#eee9df] rounded-[14px] py-[14px] px-[16px]" style={{ borderLeft: `4px solid ${urgenciaColors[ev.urgencia]}` }}>
                <div className="text-[15px] font-bold text-primary-dark">{ev.produto}</div>
                <div className="text-[13px] text-text-secondary font-medium mt-[2px]">{ev.lote_nome ? `Lote ${ev.lote_nome}` : 'Individual'} · {ev.qtd_animais || 1} animais</div>
                <div className="text-[12.5px] font-bold mt-[5px]" style={{ color: urgenciaColors[ev.urgencia] }}>{statusText(ev, ev.urgencia)}</div>
              </div>
            ))}
          </>
        ) : (
          all.map(ev => (
            <div key={ev.id} className="bg-white border border-[#eee9df] rounded-[14px] py-[14px] px-[16px]" style={{ borderLeft: '4px solid #588157' }}>
              <div className="text-[15px] font-bold text-primary-dark">{ev.produto}</div>
              <div className="text-[13px] text-text-secondary font-medium mt-[2px]">{ev.lote_nome ? `Lote ${ev.lote_nome}` : 'Individual'}</div>
              <div className="text-[12.5px] font-bold text-primary-medium mt-[5px]">{fmtDataCurta(ev.data)}</div>
            </div>
          ))
        )}
      </div>

      <div className="px-[22px] py-[10px] pb-[24px]">
        <Button fullWidth onClick={() => navigate('/sanidade/novo')}>+ Registrar evento</Button>
      </div>
    </div>
  )
}

function DesktopSanidade() {
  const [aba, setAba] = useState('proximas')
  const navigate = useNavigate()
  const { data: eventos } = useApi(() => api.sanidade.listar(), [])
  const all = (eventos || []).map(ev => ({ ...ev, urgencia: classifyEvent(ev) }))
  const vencidas = all.filter(e => e.urgencia === 'vencido').length
  const prox7 = all.filter(e => e.urgencia === 'proximo').length

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Sanidade</div>
          <div className="text-[13px] text-text-secondary font-medium">Calendário sanitário do rebanho</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <button className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer">Produtos</button>
          <button onClick={() => navigate('/sanidade/novo')} className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none">+ Registrar evento</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[22px_26px] bg-header-bg">
        <div className="grid grid-cols-3 gap-[14px] mb-[18px]">
          <KPITile label="Vencidas" value={String(vencidas)} subtitle="ação urgente" />
          <KPITile label="Próx. 7 dias" value={String(prox7)} subtitle="agendadas" />
          <KPITile label="Cobertura vacinal" value="94%" subtitle="do rebanho" variant="primary" />
        </div>

        <div className="flex gap-[10px] mb-[14px]">
          <Chip active={aba === 'proximas'} onClick={() => setAba('proximas')}>Próximas</Chip>
          <Chip active={aba === 'historico'} onClick={() => setAba('historico')}>Histórico</Chip>
        </div>

        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_.8fr] py-[10px] px-[4px] text-[12px] font-bold text-text-secondary uppercase">
            <span>Evento</span><span>Alvo</span><span>Data</span><span>Status</span>
          </div>
          {all.map(ev => (
            <div key={ev.id} className="grid grid-cols-[1.4fr_1fr_1fr_.8fr] py-[12px] px-[4px] text-[13.5px] border-t border-[#f0ede4] text-text-body items-center">
              <span className="font-bold text-primary-dark">{ev.produto}</span>
              <span>{ev.lote_nome || 'Individual'} · {ev.qtd_animais || 1}</span>
              <span className="font-mono">{fmtDataCurta(aba === 'proximas' ? ev.data_proxima_dose || ev.data : ev.data)}</span>
              <span className="text-[11.5px] font-bold" style={{ color: urgenciaColors[ev.urgencia] }}>
                {ev.urgencia === 'vencido' ? 'Vencido' : ev.urgencia === 'proximo' ? statusText(ev, ev.urgencia).split('·')[1]?.trim() || 'Próximo' : 'Agendado'}
              </span>
            </div>
          ))}
          {all.length === 0 && (
            <div className="py-[24px] text-center text-text-secondary text-[14px] border-t border-[#f0ede4]">Nenhum evento sanitário registrado.</div>
          )}
        </div>
      </div>
    </>
  )
}

export default function SanidadePage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopSanidade /> : <MobileSanidade />
}
