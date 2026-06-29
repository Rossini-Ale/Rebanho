import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import KPITile from '../components/ui/KPITile'
import Button from '../components/ui/Button'
import { api } from '../lib/api'
import { fmtDataCurta } from '../lib/utils'
import { ChevronLeft } from 'lucide-react'

const statusStyle = {
  parto_proximo: { label: 'PARTO AMANHÃ', color: '#a9711f', bg: '#f6eed9' },
  confirmada: { label: 'CONFIRMADA', color: '#588157', bg: '#e7ece4' },
  aguardando: { label: 'AGUARDANDO', color: '#7c8378', bg: '#eceadf' },
  concluida: { label: 'CONCLUÍDA', color: '#588157', bg: '#e7ece4' },
}

function MobileReproducao() {
  const navigate = useNavigate()
  const { data: coberturas, loading } = useApi(() => api.reproducao.listar(), [])
  const { data: stats } = useApi(() => api.reproducao.stats(), [])
  const lista = coberturas || []
  const st = stats || {}

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[14px] px-[20px] pt-[8px] pb-[12px]">
        <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
        <span className="text-[19px] font-extrabold text-primary-dark">Reprodução</span>
      </div>
      <div className="flex gap-[10px] px-[22px] pb-[14px]">
        <div className="flex-1 bg-white border border-[#eee9df] rounded-[14px] p-[12px_14px]">
          <div className="font-mono text-[24px] font-bold text-primary">{st.prenhes || 0}</div>
          <div className="text-[12px] text-text-secondary font-semibold">prenhes</div>
        </div>
        <div className="flex-1 bg-white border border-[#eee9df] rounded-[14px] p-[12px_14px]">
          <div className="font-mono text-[24px] font-bold text-warning">{st.partos_30d || 0}</div>
          <div className="text-[12px] text-text-secondary font-semibold">partos &lt; 30d</div>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-[22px] pb-[8px] flex flex-col gap-[10px]">
        {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
        {lista.filter(c => c.status !== 'concluida').map(c => {
          const s = statusStyle[c.status] || statusStyle.aguardando
          return (
            <div key={c.id} className="bg-white border border-[#eee9df] rounded-[14px] p-[13px_16px]">
              <div className="flex justify-between items-center mb-[5px]">
                <span className="font-mono text-[16px] font-bold text-primary-dark">{c.brinco}</span>
                <span className="text-[11.5px] font-extrabold py-[3px] px-[9px] rounded-[14px]" style={{ color: s.color, background: s.bg }}>{s.label}</span>
              </div>
              <div className="text-[13px] text-text-secondary font-medium">{c.metodo} · cobertura {fmtDataCurta(c.data_cobertura)} · {c.raca}</div>
            </div>
          )
        })}
      </div>
      <div className="px-[22px] py-[10px] pb-[24px]">
        <Button fullWidth onClick={() => navigate('/reproducao/cobertura')}>+ Nova cobertura</Button>
      </div>
    </div>
  )
}

function DesktopReproducao() {
  const navigate = useNavigate()
  const { data: coberturas } = useApi(() => api.reproducao.listar(), [])
  const { data: stats } = useApi(() => api.reproducao.stats(), [])
  const lista = coberturas || []
  const st = stats || {}
  const ativas = lista.filter(c => c.status !== 'concluida')
  const proximosPartos = ativas.filter(c => c.status !== 'aguardando').sort((a, b) => (a.data_prevista_parto || '').localeCompare(b.data_prevista_parto || ''))

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Reprodução</div>
          <div className="text-[13px] text-text-secondary font-medium">Coberturas, prenhez e partos</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <button onClick={() => navigate('/reproducao/cobertura')} className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none">+ Nova cobertura</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-[22px_26px] bg-header-bg">
        <div className="grid grid-cols-4 gap-[14px] mb-[18px]">
          <KPITile label="Prenhes" value={String(st.prenhes || 0)} subtitle={`de ${st.total_femeas || 0} fêmeas`} />
          <KPITile label="Taxa prenhez" value={`${st.taxa_prenhez || 0}%`} />
          <KPITile label="Partos < 30d" value={String(st.partos_30d || 0)} subtitle={`${st.partos_semana || 0} esta semana`} />
          <KPITile label="Nascimentos ano" value={String(st.nascimentos_ano || 0)} subtitle={st.diff_nascimentos != null ? `${st.diff_nascimentos >= 0 ? '+' : ''}${st.diff_nascimentos} vs ano ant.` : ''} variant="primary" />
        </div>
        <div className="grid grid-cols-2 gap-[14px]">
          <div className="bg-white border border-border rounded-[14px] p-[18px]">
            <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Próximos partos</div>
            {proximosPartos.map((c, i) => (
              <div key={c.id} className={`flex justify-between items-center py-[12px] ${i < proximosPartos.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
                <span className="font-mono text-[15px] font-bold text-primary-dark">{c.brinco}</span>
                <span className="text-[13px] font-bold" style={{ color: c.status === 'parto_proximo' ? '#a9711f' : '#588157' }}>{fmtDataCurta(c.data_prevista_parto)}</span>
              </div>
            ))}
            {proximosPartos.length === 0 && <div className="py-[12px] text-center text-text-secondary text-[14px]">Nenhum parto previsto.</div>}
          </div>
          <div className="bg-white border border-border rounded-[14px] p-[18px]">
            <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Coberturas recentes</div>
            {ativas.map((c, i) => {
              const s = statusStyle[c.status] || statusStyle.aguardando
              return (
                <div key={c.id} className={`flex justify-between items-center py-[12px] ${i < ativas.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
                  <div>
                    <div className="font-mono text-[14.5px] font-bold text-primary-dark">{c.brinco}</div>
                    <div className="text-[12px] text-text-secondary">{c.metodo} · {fmtDataCurta(c.data_cobertura)}</div>
                  </div>
                  <span className="text-[11.5px] font-bold" style={{ color: s.color }}>{s.label}</span>
                </div>
              )
            })}
            {ativas.length === 0 && <div className="py-[12px] text-center text-text-secondary text-[14px]">Nenhuma cobertura ativa.</div>}
          </div>
        </div>
      </div>
    </>
  )
}

export default function ReproducaoPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopReproducao /> : <MobileReproducao />
}
