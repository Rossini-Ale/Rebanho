import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import AlertCard from '../components/ui/AlertCard'
import KPITile from '../components/ui/KPITile'
import { api } from '../lib/api'
import { fmtMoeda } from '../lib/utils'
import { Search } from 'lucide-react'
import { SkeletonKPI } from '../components/ui/Skeleton'

function MobileInicio() {
  const navigate = useNavigate()
  const { data: alertas, loading } = useApi(() => api.dashboard.alertas(), [])
  const lista = alertas || []
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-[22px] pt-[10px] pb-[16px]">
        <div>
          <div className="text-[14px] text-text-secondary font-medium">{(() => { const h = new Date().getHours(); return h < 12 ? 'Bom dia,' : h < 18 ? 'Boa tarde,' : 'Boa noite,'; })()}</div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.02em]">{user.fazenda_nome || 'Minha Fazenda'}</div>
        </div>
        <div className="w-[42px] h-[42px] rounded-full bg-primary text-white flex items-center justify-center font-bold text-[15px]">
          {(user.nome || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      </div>

      <div
        onClick={() => navigate('/animais')}
        className="mx-[22px] mb-[18px] flex items-center gap-[12px] bg-white border border-border rounded-[16px] py-[14px] px-[16px] shadow-card cursor-pointer"
      >
        <Search size={18} className="text-text-secondary shrink-0" />
        <span className="flex-1 text-text-secondary text-[15px] font-medium">Buscar por brinco…</span>
      </div>

      <div className="flex items-center justify-between px-[24px] pb-[12px]">
        <span className="text-[17px] font-extrabold text-primary-dark">Hoje</span>
        {lista.length > 0 && (
          <span className="text-[13px] font-bold text-danger bg-danger-bg py-[3px] px-[10px] rounded-pill">{lista.length} pendências</span>
        )}
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[10px] flex flex-col gap-[11px]">
        {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
        {lista.map((a, i) => <AlertCard key={i} {...a} />)}
        {!loading && lista.length === 0 && (
          <div className="text-center text-text-secondary py-[40px] text-[14px]">Nenhum alerta pendente hoje.</div>
        )}
      </div>
    </div>
  )
}

function DesktopInicio() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { data: stats } = useApi(() => api.dashboard.stats(), [])
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const { data: mensal } = useApi(() => api.dashboard.mensal(), [])
  const { data: alertas } = useApi(() => api.dashboard.alertas(), [])
  const s = stats || {}

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Visão geral</div>
          <div className="text-[13px] text-text-secondary font-medium">{user.fazenda_nome || 'Minha Fazenda'}</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <div onClick={() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true })) }} className="bg-white border border-field-border rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] text-text-secondary font-medium w-[240px] cursor-pointer flex items-center justify-between">
            <span>Buscar por brinco…</span>
            <kbd className="text-[11px] font-mono font-bold text-text-secondary bg-segmented-bg rounded-[5px] py-[2px] px-[6px]">⌘K</kbd>
          </div>
          <button onClick={() => navigate('/animais/novo')} className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none">+ Novo animal</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[20px_26px]">
        <div className="grid grid-cols-4 gap-[14px] mb-[18px]">
          {!stats ? (
            <>
              <SkeletonKPI />
              <SkeletonKPI />
              <SkeletonKPI />
              <SkeletonKPI />
            </>
          ) : (
            <>
              <div onClick={() => navigate('/animais')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                <KPITile label="Total de animais" value={String(s.total_animais || 0)} subtitle={`${s.ativos || 0} ativos`} />
              </div>
              <div onClick={() => navigate('/animais')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                <KPITile label="Peso médio" value={<>{s.peso_medio || 0}<span className="text-[15px]"> kg</span></>} />
              </div>
              <div onClick={() => navigate('/reproducao')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                <KPITile label="Prenhez confirmada" value={String(s.prenhes || 0)} />
              </div>
              <div onClick={() => navigate('/financeiro')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                <KPITile label="Resultado do mês" value={s.resultado_mes != null ? `${s.resultado_mes >= 0 ? '+' : ''}${fmtMoeda(s.resultado_mes)}` : '—'} subtitle="venda − custo" variant="primary" />
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-[1.6fr_1fr] gap-[14px]">
          <div className="bg-card border border-border rounded-[14px] p-[18px]">
            {(() => {
              const dados = (mensal || []).filter(m => m.peso_medio > 0)
              if (dados.length < 2) {
                return (
                  <>
                    <div className="flex justify-between items-center mb-[14px]">
                      <span className="text-[15px] font-extrabold text-primary-dark">Peso médio do rebanho</span>
                    </div>
                    <div className="flex items-center justify-center h-[200px] text-text-secondary text-[14px] font-medium">Sem dados suficientes</div>
                  </>
                )
              }
              const pesos = dados.map(d => d.peso_medio)
              const minP = Math.min(...pesos)
              const maxP = Math.max(...pesos)
              const range = maxP - minP || 1
              const pts = dados.map((d, i) => {
                const x = 40 + (i / (dados.length - 1)) * 470
                const y = 160 - ((d.peso_medio - minP) / range) * 130 + 20
                return `${x},${y}`
              })
              return (
                <>
                  <div className="flex justify-between items-center mb-[14px]">
                    <span className="text-[15px] font-extrabold text-primary-dark">Peso médio do rebanho</span>
                    <span className="text-[12px] text-text-secondary font-semibold">{dados[0].nome} – {dados[dados.length - 1].nome}</span>
                  </div>
                  <svg viewBox="0 0 520 200" className="w-full h-[200px]">
                    <line x1="40" y1="20" x2="40" y2="170" stroke="#e6e3da" strokeWidth="1"/>
                    <line x1="40" y1="170" x2="510" y2="170" stroke="#e6e3da" strokeWidth="1"/>
                    <polyline points={pts.join(' ')} fill="none" stroke="#3a5a40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    {pts.map((pt, i) => {
                      const [cx, cy] = pt.split(',')
                      return (
                        <circle key={i} cx={cx} cy={cy} r={i === pts.length - 1 ? 5 : 3} fill={i === pts.length - 1 ? '#588157' : '#3a5a40'}>
                          <title>{dados[i].nome}: {dados[i].peso_medio} kg</title>
                        </circle>
                      )
                    })}
                    <text x="40" y="188" fontFamily="Spline Sans Mono" fontSize="11" fill="#9aa295">{dados[0].nome}</text>
                    <text x="475" y="188" fontFamily="Spline Sans Mono" fontSize="11" fill="#9aa295">{dados[dados.length - 1].nome}</text>
                  </svg>
                </>
              )
            })()}
          </div>

          <div className="bg-card border border-border rounded-[14px] p-[18px]">
            <div className="text-[15px] font-extrabold text-primary-dark mb-[12px]">Animais por lote</div>
            {(lotes || []).slice(0, 5).map(l => (
              <div key={l.id} className="mb-[12px]">
                <div className="flex justify-between text-[13px] mb-[5px]">
                  <span className="font-semibold text-text-body">{l.nome}</span>
                  <span className="font-mono font-bold text-primary-dark">{l.qtd_animais || 0}</span>
                </div>
                <div className="h-[8px] bg-segmented-bg rounded-[6px]">
                  <div className="h-full rounded-[6px]" style={{
                    width: `${l.capacidade ? Math.min(100, Math.round(((l.qtd_animais || 0) / l.capacidade) * 100)) : 15}%`,
                    background: l.capacidade && (l.qtd_animais || 0) / l.capacidade > 0.8 ? '#3a5a40' : '#588157'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-[14px] p-[18px] mt-[14px]">
          <div className="flex justify-between items-center mb-[14px]">
            <span className="text-[15px] font-extrabold text-primary-dark">Pendências</span>
            {(alertas || []).length > 0 && (
              <span className="text-[12px] font-bold text-danger bg-danger-bg py-[3px] px-[10px] rounded-pill">{(alertas || []).length} alertas</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-[10px]">
            {(alertas || []).slice(0, 6).map((a, i) => <AlertCard key={i} {...a} />)}
          </div>
          {(alertas || []).length === 0 && (
            <div className="text-center text-text-secondary text-[14px] py-[16px]">Nenhuma pendência no momento.</div>
          )}
        </div>
      </div>
    </>
  )
}

export default function InicioPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopInicio /> : <MobileInicio />
}
