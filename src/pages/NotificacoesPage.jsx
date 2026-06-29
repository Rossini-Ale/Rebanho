import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import { api } from '../lib/api'
import { ChevronLeft } from 'lucide-react'

const urgenciaColors = { vencido: '#b54a2f', proximo: '#c9882a', agendado: '#588157' }

function MobileNotificacoes() {
  const navigate = useNavigate()
  const { data: alertas, loading } = useApi(() => api.dashboard.alertas(), [])
  const lista = alertas || []

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-[20px] pt-[8px] pb-[14px]">
        <div className="flex items-center gap-[14px]">
          <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0">
            <ChevronLeft size={24} />
          </button>
          <span className="text-[19px] font-extrabold text-primary-dark">Notificações</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[8px] flex flex-col gap-[10px]">
        {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
        {lista.map((n, i) => (
          <div
            key={i}
            className="bg-white border border-[#eee9df] rounded-[13px] py-[13px] px-[15px]"
            style={{ borderLeft: `4px solid ${urgenciaColors[n.urgency] || '#588157'}` }}
          >
            <div className="text-[14.5px] font-bold text-primary-dark">{n.title}</div>
            <div className="text-[12.5px] text-text-secondary font-medium mt-[2px]">{n.subtitle}</div>
            <div className="text-[11.5px] font-bold mt-[4px]" style={{ color: urgenciaColors[n.urgency] || '#588157' }}>{n.deadline}</div>
          </div>
        ))}
        {!loading && lista.length === 0 && (
          <div className="text-center text-text-secondary py-[40px] text-[14px]">Nenhuma notificação pendente.</div>
        )}
      </div>
    </div>
  )
}

const getAlertAction = (alert) => {
  if (alert.title.toLowerCase().includes('parto')) return '/reproducao'
  if (alert.title.toLowerCase().includes('vencido') || (alert.subtitle || '').toLowerCase().includes('lote')) return '/sanidade'
  return '/animais'
}

function DesktopNotificacoes() {
  const navigate = useNavigate()
  const { data: alertas, loading } = useApi(() => api.dashboard.alertas(), [])
  const lista = alertas || []

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Notificações</div>
          <div className="text-[13px] text-text-secondary font-medium">Alertas e atualizações do sistema</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[22px_26px] bg-header-bg">
        <div className="max-w-[640px]">
          {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
          {lista.map((n, i) => (
            <div
              key={i}
              onClick={() => navigate(getAlertAction(n))}
              className="bg-white border border-[#eee9df] rounded-[14px] py-[14px] px-[18px] mb-[10px] cursor-pointer hover:bg-[#f5f3ec] hover:shadow-card transition-all"
              style={{ borderLeft: `4px solid ${urgenciaColors[n.urgency] || '#588157'}` }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[14.5px] font-bold text-primary-dark">{n.title}</div>
                  <div className="text-[13px] text-text-secondary font-medium mt-[2px]">{n.subtitle}</div>
                </div>
                <span className="text-[11.5px] font-bold shrink-0 ml-[12px]" style={{ color: urgenciaColors[n.urgency] || '#588157' }}>{n.deadline}</span>
              </div>
            </div>
          ))}
          {!loading && lista.length === 0 && (
            <div className="text-center text-text-secondary py-[40px] text-[14px]">Nenhuma notificação pendente.</div>
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
