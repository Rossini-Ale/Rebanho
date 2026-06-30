import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import { api } from '../lib/api'
import { ChevronLeft, Bell, ShieldCheck, Heart, ArrowRight, CheckCircle } from 'lucide-react'

const urgenciaConfig = {
  vencido:  { label: 'Urgente', color: '#b54a2f', bg: '#fde8e4', border: '#b54a2f' },
  proximo:  { label: 'Atenção', color: '#a9711f', bg: '#f6eed9', border: '#c9882a' },
  agendado: { label: 'Informação', color: '#588157', bg: '#e7ece4', border: '#588157' },
}

function getIconAndRoute(alert) {
  const t = (alert.title + ' ' + (alert.subtitle || '')).toLowerCase()
  if (t.includes('parto') || t.includes('prenhez')) return { icon: Heart, route: '/reproducao', acao: 'Ver reprodução' }
  if (t.includes('vacin') || t.includes('vencido') || t.includes('produto')) return { icon: ShieldCheck, route: '/sanidade', acao: 'Ver sanidade' }
  return { icon: Bell, route: '/notificacoes', acao: 'Ver detalhes' }
}

function AlertCard({ alert, onClick }) {
  const cfg = urgenciaConfig[alert.urgency] || urgenciaConfig.agendado
  const { icon: Icon, acao } = getIconAndRoute(alert)

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#eee9df] rounded-[14px] py-[14px] px-[16px] mb-[10px] cursor-pointer hover:shadow-card transition-all group"
      style={{ borderLeft: `4px solid ${cfg.border}` }}
    >
      <div className="flex items-start gap-[12px]">
        <span className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 mt-[1px]" style={{ background: cfg.bg }}>
          <Icon size={16} color={cfg.color} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-[8px]">
            <div className="text-[14px] font-bold text-primary-dark">{alert.title}</div>
            <span className="text-[11px] font-bold shrink-0 py-[3px] px-[8px] rounded-[10px]" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
          </div>
          <div className="text-[12.5px] text-text-secondary font-medium mt-[2px]">{alert.subtitle}</div>
          <div className="flex justify-between items-center mt-[8px]">
            <span className="text-[12px] font-bold" style={{ color: cfg.color }}>{alert.deadline}</span>
            <span className="text-[12px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-[4px]">{acao} <ArrowRight size={12} /></span>
          </div>
        </div>
      </div>
    </div>
  )
}

function GrupoHeader({ label, count, color }) {
  return (
    <div className="flex items-center gap-[8px] mb-[10px] mt-[4px]">
      <span className="text-[12px] font-extrabold uppercase tracking-[.06em]" style={{ color }}>{label}</span>
      <span className="text-[11px] font-bold text-white rounded-full w-[18px] h-[18px] flex items-center justify-center" style={{ background: color }}>{count}</span>
    </div>
  )
}

function EmptyNotificacoes() {
  return (
    <div className="flex flex-col items-center justify-center py-[60px] text-center">
      <div className="w-[56px] h-[56px] rounded-full bg-[#e7ece4] flex items-center justify-center mb-[14px]">
        <CheckCircle size={28} className="text-primary-medium" />
      </div>
      <div className="text-[16px] font-extrabold text-primary-dark mb-[6px]">Tudo em dia!</div>
      <div className="text-[13.5px] text-text-secondary font-medium max-w-[240px]">Nenhuma pendência ou alerta no momento. Continue assim!</div>
    </div>
  )
}

function MobileNotificacoes() {
  const navigate = useNavigate()
  const { data: alertas, loading } = useApi(() => api.dashboard.alertas(), [])
  const lista = alertas || []
  const urgentes = lista.filter(a => a.urgency === 'vencido')
  const atencao = lista.filter(a => a.urgency === 'proximo')
  const info = lista.filter(a => a.urgency === 'agendado')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-[20px] pt-[8px] pb-[14px]">
        <div className="flex items-center gap-[14px]">
          <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0">
            <ChevronLeft size={24} />
          </button>
          <span className="text-[19px] font-extrabold text-primary-dark">Notificações</span>
        </div>
        {lista.length > 0 && <span className="text-[13px] font-bold text-white bg-danger rounded-full w-[22px] h-[22px] flex items-center justify-center">{lista.length}</span>}
      </div>
      <div className="flex-1 overflow-auto px-[20px] pb-[8px]">
        {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
        {!loading && lista.length === 0 && <EmptyNotificacoes />}
        {urgentes.length > 0 && <><GrupoHeader label="Urgente" count={urgentes.length} color="#b54a2f" />{urgentes.map((a, i) => <AlertCard key={i} alert={a} onClick={() => navigate(getIconAndRoute(a).route)} />)}</>}
        {atencao.length > 0 && <><GrupoHeader label="Atenção" count={atencao.length} color="#a9711f" />{atencao.map((a, i) => <AlertCard key={i} alert={a} onClick={() => navigate(getIconAndRoute(a).route)} />)}</>}
        {info.length > 0 && <><GrupoHeader label="Informação" count={info.length} color="#588157" />{info.map((a, i) => <AlertCard key={i} alert={a} onClick={() => navigate(getIconAndRoute(a).route)} />)}</>}
      </div>
    </div>
  )
}

function DesktopNotificacoes() {
  const navigate = useNavigate()
  const { data: alertas, loading } = useApi(() => api.dashboard.alertas(), [])
  const lista = alertas || []
  const urgentes = lista.filter(a => a.urgency === 'vencido')
  const atencao = lista.filter(a => a.urgency === 'proximo')
  const info = lista.filter(a => a.urgency === 'agendado')

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Notificações</div>
          <div className="text-[13px] text-text-secondary font-medium">
            {lista.length > 0 ? `${lista.length} alerta${lista.length !== 1 ? 's' : ''} pendente${lista.length !== 1 ? 's' : ''}` : 'Tudo em dia'}
          </div>
        </div>
        {urgentes.length > 0 && (
          <div className="flex items-center gap-[8px] bg-[#fde8e4] rounded-sidebar-item px-[16px] py-[10px]">
            <span className="w-[8px] h-[8px] rounded-full bg-danger animate-pulse" />
            <span className="text-[13.5px] font-bold text-danger">{urgentes.length} urgente{urgentes.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-[22px_26px] bg-header-bg">
        <div className="max-w-[640px]">
          {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
          {!loading && lista.length === 0 && <EmptyNotificacoes />}
          {urgentes.length > 0 && (
            <div className="mb-[8px]">
              <GrupoHeader label="Urgente — ação necessária" count={urgentes.length} color="#b54a2f" />
              {urgentes.map((a, i) => <AlertCard key={i} alert={a} onClick={() => navigate(getIconAndRoute(a).route)} />)}
            </div>
          )}
          {atencao.length > 0 && (
            <div className="mb-[8px]">
              <GrupoHeader label="Atenção" count={atencao.length} color="#a9711f" />
              {atencao.map((a, i) => <AlertCard key={i} alert={a} onClick={() => navigate(getIconAndRoute(a).route)} />)}
            </div>
          )}
          {info.length > 0 && (
            <div>
              <GrupoHeader label="Informação" count={info.length} color="#588157" />
              {info.map((a, i) => <AlertCard key={i} alert={a} onClick={() => navigate(getIconAndRoute(a).route)} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function NotificacoesPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopNotificacoes /> : <MobileNotificacoes />
}
