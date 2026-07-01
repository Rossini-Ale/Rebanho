import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import AlertCard from '../components/ui/AlertCard'
import KPITile from '../components/ui/KPITile'
import { api } from '../lib/api'
import { fmtMoeda, fmtDataCurta } from '../lib/utils'
import { Search, Scale, Heart, ShieldCheck, Wallet, TrendingUp } from 'lucide-react'
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

const acoes = [
  { icon: Scale, label: 'Registrar peso', to: '/registrar-peso', color: '#3a5a40', bg: '#e7ece4' },
  { icon: Heart, label: 'Nova cobertura', to: '/reproducao/cobertura', color: '#8b5cf6', bg: '#f0e7fb' },
  { icon: ShieldCheck, label: 'Evento sanitário', to: '/sanidade/novo', color: '#588157', bg: '#e7ece4' },
  { icon: Wallet, label: 'Novo lançamento', to: '/financeiro/custo', color: '#a9711f', bg: '#f6eed9' },
]

function DesktopInicio() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { data: stats } = useApi(() => api.dashboard.stats(), [])
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const { data: mensal } = useApi(() => api.dashboard.mensal(), [])
  const { data: alertas } = useApi(() => api.dashboard.alertas(), [])
  const { data: coberturas } = useApi(() => api.reproducao.listar(), [])
  const { data: gmdData } = useApi(() => api.relatorios.gmd({}), [])
  const s = stats || {}

  const proximosPartos = (coberturas || [])
    .filter(c => c.status !== 'concluida' && c.data_prevista_parto)
    .sort((a, b) => a.data_prevista_parto.localeCompare(b.data_prevista_parto))
    .slice(0, 5)

  const rec = s.receita_mes || 0
  const desp = s.despesa_mes || 0
  const res = rec - desp
  const margem = rec > 0 ? Math.round((res / rec) * 100) : 0

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Visão geral</div>
          <div className="text-[13px] text-text-secondary font-medium">{user.fazenda_nome || 'Minha Fazenda'}</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <div onClick={() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true })) }} className="bg-white border border-field-border rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] text-text-secondary font-medium w-[240px] cursor-pointer flex items-center justify-between">
            <span>Buscar…</span>
            <kbd className="text-[11px] font-mono font-bold text-text-secondary bg-segmented-bg rounded-[5px] py-[2px] px-[6px]">⌘K</kbd>
          </div>
          <button onClick={() => navigate('/animais/novo')} className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none">+ Novo animal</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[18px_26px] bg-header-bg">
        {/* KPIs */}
        <div className="grid grid-cols-5 gap-[14px] mb-[14px]">
          {!stats ? (
            <><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /></>
          ) : (
            <>
              <div onClick={() => navigate('/animais')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                <KPITile label="Total de animais" value={String(s.total_animais || 0)} subtitle={`${s.ativos || 0} ativos`} />
              </div>
              <div onClick={() => navigate('/animais')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                <KPITile label="Peso médio" value={<>{s.peso_medio || 0}<span className="text-[15px]"> kg</span></>} />
              </div>
              <div onClick={() => navigate('/relatorios')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                <KPITile label="GMD médio" value={gmdData?.gmd_medio ? `${gmdData.gmd_medio} kg/d` : '—'} subtitle={gmdData?.animais_com_dados ? `${gmdData.animais_com_dados} animais` : 'sem dados'} />
              </div>
              <div onClick={() => navigate('/reproducao')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                <KPITile label="Prenhez" value={String(s.prenhes || 0)} subtitle="fêmeas prenhes" />
              </div>
              <div onClick={() => navigate('/financeiro')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                <KPITile label="Resultado do mês" value={res != null ? `${res >= 0 ? '+' : ''}${fmtMoeda(res)}` : '—'} subtitle={`margem ${margem}%`} variant="primary" />
              </div>
            </>
          )}
        </div>

        {/* Ações rápidas */}
        <div className="bg-white border border-border rounded-[14px] mb-[14px] flex overflow-hidden">
          {acoes.map((a, idx) => {
            const Icon = a.icon
            return (
              <button
                key={a.to}
                onClick={() => navigate(a.to)}
                className={`flex-1 flex items-center gap-[10px] py-[13px] px-[16px] cursor-pointer hover:bg-[#f5f9f5] transition-colors text-left${idx < acoes.length - 1 ? ' border-r border-border' : ''}`}
              >
                <span className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center shrink-0" style={{ background: a.bg }}>
                  <Icon size={16} color={a.color} />
                </span>
                <span className="text-[13px] font-bold text-primary-dark leading-tight">{a.label}</span>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-[1.5fr_1fr] gap-[14px] mb-[14px]">
          {/* Gráfico peso médio */}
          <div className="bg-card border border-border rounded-[14px] p-[18px]">
            {(() => {
              const dados = (mensal || []).filter(m => m.peso_medio > 0)
              if (dados.length < 2) {
                return (
                  <>
                    <div className="flex justify-between items-center mb-[14px]">
                      <span className="text-[15px] font-extrabold text-primary-dark">Peso médio do rebanho</span>
                    </div>
                    <div className="flex items-center justify-center h-[180px] text-text-secondary text-[14px] font-medium">Sem dados suficientes</div>
                  </>
                )
              }
              const pesos = dados.map(d => d.peso_medio)
              const minP = Math.min(...pesos)
              const maxP = Math.max(...pesos)
              const range = maxP - minP || 1
              const pts = dados.map((d, i) => {
                const x = 40 + (i / (dados.length - 1)) * 440
                const y = 140 - ((d.peso_medio - minP) / range) * 110 + 20
                return `${x},${y}`
              })
              return (
                <>
                  <div className="flex justify-between items-center mb-[10px]">
                    <span className="text-[15px] font-extrabold text-primary-dark">Peso médio do rebanho</span>
                    <span className="text-[12px] text-text-secondary font-semibold">{dados[0].nome} – {dados[dados.length - 1].nome}</span>
                  </div>
                  <svg viewBox="0 0 490 180" className="w-full h-[180px]">
                    <line x1="40" y1="20" x2="40" y2="155" stroke="#e6e3da" strokeWidth="1"/>
                    <line x1="40" y1="155" x2="480" y2="155" stroke="#e6e3da" strokeWidth="1"/>
                    <polyline points={pts.join(' ')} fill="none" stroke="#3a5a40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    {pts.map((pt, i) => {
                      const [cx, cy] = pt.split(',')
                      return (
                        <circle key={i} cx={cx} cy={cy} r={i === pts.length - 1 ? 5 : 3} fill={i === pts.length - 1 ? '#588157' : '#3a5a40'}>
                          <title>{dados[i].nome}: {dados[i].peso_medio} kg</title>
                        </circle>
                      )
                    })}
                    <text x="40" y="172" fontFamily="Spline Sans Mono" fontSize="11" fill="#9aa295">{dados[0].nome}</text>
                    <text x="445" y="172" fontFamily="Spline Sans Mono" fontSize="11" fill="#9aa295">{dados[dados.length - 1].nome}</text>
                  </svg>
                </>
              )
            })()}
          </div>

          {/* Próximos partos + meta financeira */}
          <div className="flex flex-col gap-[14px]">
            <div className="bg-card border border-border rounded-[14px] p-[18px] flex-1">
              <div className="flex justify-between items-center mb-[12px]">
                <span className="text-[15px] font-extrabold text-primary-dark">Próximos partos</span>
                <button onClick={() => navigate('/reproducao')} className="text-[12.5px] font-bold text-primary bg-transparent border-none cursor-pointer">Ver todos</button>
              </div>
              {proximosPartos.length === 0 && (
                <div className="text-center text-text-secondary text-[13px] py-[16px]">Nenhum parto previsto.</div>
              )}
              {proximosPartos.map((c, i) => {
                const dias = Math.round((new Date(c.data_prevista_parto) - new Date()) / 86400000)
                const urgente = dias <= 7
                return (
                  <div key={c.id} className={`flex justify-between items-center py-[9px] ${i < proximosPartos.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
                    <div>
                      <span className="font-mono text-[14px] font-bold text-primary-dark">{c.brinco}</span>
                      <span className="text-[12px] text-text-secondary ml-[6px]">{c.raca}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[12.5px] font-bold" style={{ color: urgente ? '#a9711f' : '#588157' }}>{fmtDataCurta(c.data_prevista_parto)}</div>
                      <div className="text-[11px] text-text-secondary">{dias <= 0 ? 'hoje' : `em ${dias}d`}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Meta financeira do mês */}
            {stats && (
              <div className="bg-card border border-border rounded-[14px] p-[16px]">
                <div className="flex items-center gap-[8px] mb-[10px]">
                  <TrendingUp size={16} className="text-primary-medium" />
                  <span className="text-[14px] font-extrabold text-primary-dark">Financeiro do mês</span>
                </div>
                <div className="flex justify-between text-[12.5px] mb-[6px]">
                  <span className="font-semibold text-text-secondary">Receita</span>
                  <span className="font-mono font-bold text-primary-medium">{fmtMoeda(rec)}</span>
                </div>
                <div className="flex justify-between text-[12.5px] mb-[8px]">
                  <span className="font-semibold text-text-secondary">Despesa</span>
                  <span className="font-mono font-bold text-danger">{fmtMoeda(desp)}</span>
                </div>
                <div className="h-[8px] bg-segmented-bg rounded-[6px] overflow-hidden">
                  <div className="h-full rounded-[6px]" style={{
                    width: `${rec > 0 ? Math.min(100, Math.round((desp / rec) * 100)) : 0}%`,
                    background: desp > rec ? '#b54a2f' : desp > rec * 0.7 ? '#c9882a' : '#588157',
                  }} />
                </div>
                <div className="text-[11.5px] text-text-secondary mt-[6px]">
                  {desp > rec ? 'Despesa acima da receita' : `${Math.round((desp / (rec || 1)) * 100)}% da receita em despesas`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pendências */}
        <div className="bg-card border border-border rounded-[14px] p-[18px]">
          <div className="flex justify-between items-center mb-[14px]">
            <span className="text-[15px] font-extrabold text-primary-dark">Pendências</span>
            <div className="flex gap-[8px] items-center">
              {(alertas || []).length > 0 && (
                <span className="text-[12px] font-bold text-danger bg-danger-bg py-[3px] px-[10px] rounded-pill">{(alertas || []).length} alertas</span>
              )}
              {(alertas || []).length > 0 && (
                <button onClick={() => navigate('/notificacoes')} className="text-[12.5px] font-bold text-primary bg-transparent border-none cursor-pointer">Ver todos</button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-[10px]">
            {(alertas || []).slice(0, 6).map((a, i) => (
              <div
                key={i}
                onClick={() => navigate((() => {
                  if (a.title.toLowerCase().includes('parto')) return '/reproducao'
                  if (a.title.toLowerCase().includes('vencido') || (a.subtitle || '').toLowerCase().includes('lote')) return '/sanidade'
                  return '/animais'
                })())}
                className="cursor-pointer hover:bg-[#f5f3ec] transition-colors rounded-[14px]"
              >
                <AlertCard {...a} />
              </div>
            ))}
          </div>
          {(alertas || []).length === 0 && (
            <div className="text-center text-text-secondary text-[14px] py-[12px]">Nenhuma pendência no momento.</div>
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
