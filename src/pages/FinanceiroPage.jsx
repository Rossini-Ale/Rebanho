import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import KPITile from '../components/ui/KPITile'
import { api } from '../lib/api'
import { fmtMoeda, fmtDataCurta } from '../lib/utils'
import { ChevronLeft, Download } from 'lucide-react'

const mesesAbrev = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
const mesAtual = meses[new Date().getMonth()]
const anoAtual = new Date().getFullYear()

function MobileFinanceiro() {
  const navigate = useNavigate()
  const { data: lancamentos, loading } = useApi(() => api.financeiro.listar(), [])
  const { data: resumo } = useApi(() => api.financeiro.resumo(), [])
  const lista = lancamentos || []
  const rec = resumo ? parseFloat(resumo.receita) : 0
  const desp = resumo ? parseFloat(resumo.despesa) : 0
  const res = rec - desp

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-[20px] pt-[8px] pb-[12px]">
        <div className="flex items-center gap-[14px]">
          <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
          <span className="text-[19px] font-extrabold text-primary-dark">Financeiro</span>
        </div>
        <span className="text-[13px] font-bold text-primary bg-chip-bg py-[6px] px-[12px] rounded-chip">{mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)} ▾</span>
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[8px]">
        <div className="bg-primary rounded-[16px] p-[18px] mb-[14px]">
          <div className="text-[13px] text-accent-light font-semibold">Resultado do mês</div>
          <div className="font-mono text-[34px] font-bold text-white leading-[1.1]">+{fmtMoeda(res)}</div>
          <div className="text-[12.5px] text-accent-light font-semibold mt-[3px]">vendas − (compras + custos)</div>
        </div>

        <div className="flex gap-[10px] mb-[16px]">
          <div className="flex-1 bg-white border border-[#eee9df] rounded-[14px] p-[12px_13px]">
            <div className="text-[11.5px] text-text-secondary font-bold">VENDAS</div>
            <div className="font-mono text-[16px] font-bold text-primary-medium">{fmtMoeda(rec)}</div>
          </div>
          <div className="flex-1 bg-white border border-[#eee9df] rounded-[14px] p-[12px_13px]">
            <div className="text-[11.5px] text-text-secondary font-bold">DESPESAS</div>
            <div className="font-mono text-[16px] font-bold text-danger">{fmtMoeda(desp)}</div>
          </div>
        </div>

        <div className="text-[13px] font-extrabold text-text-secondary uppercase tracking-[.04em] mb-[8px]">Lançamentos</div>
        {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
        <div className="flex flex-col gap-[9px]">
          {lista.map(l => (
            <div key={l.id} className="bg-white border border-[#eee9df] rounded-[13px] p-[13px_15px] flex justify-between items-center">
              <div>
                <div className="text-[14.5px] font-bold text-primary-dark">{l.descricao || l.categoria}</div>
                <div className="text-[12px] text-text-secondary">{l.categoria} · {fmtDataCurta(l.data)}</div>
              </div>
              <span className={`font-mono text-[14.5px] font-bold ${parseFloat(l.valor) > 0 ? 'text-primary-medium' : 'text-danger'}`}>
                {parseFloat(l.valor) > 0 ? '+' : '−'}{fmtMoeda(l.valor)}
              </span>
            </div>
          ))}
          {!loading && lista.length === 0 && (
            <div className="text-center text-text-secondary py-[20px] text-[14px]">Nenhum lançamento registrado.</div>
          )}
        </div>
      </div>

      <div className="px-[22px] py-[10px] pb-[24px]">
        <button onClick={() => navigate('/financeiro/custo')} className="w-full bg-white border-[1.5px] border-primary text-primary rounded-[15px] py-[15px] text-[15px] font-extrabold text-center cursor-pointer">+ Novo lançamento</button>
      </div>
    </div>
  )
}

function DesktopFinanceiro() {
  const navigate = useNavigate()
  const { data: lancamentos } = useApi(() => api.financeiro.listar(), [])
  const { data: resumo } = useApi(() => api.financeiro.resumo(), [])
  const { data: mensal } = useApi(() => api.dashboard.mensal(), [])
  const lista = lancamentos || []
  const rec = resumo ? parseFloat(resumo.receita) : 0
  const desp = resumo ? parseFloat(resumo.despesa) : 0
  const res = rec - desp
  const porCategoria = resumo?.por_categoria || []
  const maxCat = porCategoria.length ? Math.max(...porCategoria.map(c => parseFloat(c.total))) : 1

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Financeiro</div>
          <div className="text-[13px] text-text-secondary font-medium">Resultado de {mesAtual} {anoAtual}</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <button
            onClick={() => {
              const dados = { exportado_em: new Date().toISOString(), lancamentos: lista, resumo: { receita: rec, despesa: desp, resultado: res } }
              const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `financeiro-${mesAtual}-${anoAtual}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer flex items-center gap-[6px]"
          ><Download size={15} /> Exportar</button>
          <button onClick={() => navigate('/financeiro/custo')} className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none">+ Lançamento</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[22px_26px] bg-header-bg">
        <div className="grid grid-cols-4 gap-[14px] mb-[16px]">
          <KPITile label="Receita" value={fmtMoeda(rec)} subtitle={mesAtual} />
          <KPITile label="Despesa" value={fmtMoeda(desp)} subtitle={mesAtual} />
          <KPITile label="Resultado" value={`+${fmtMoeda(res)}`} subtitle={mesAtual} />
          <KPITile label="Margem" value={rec ? `${Math.round((res / rec) * 100)}%` : '—'} subtitle={`acum. ${new Date().getFullYear()}`} variant="primary" />
        </div>

        <div className="grid grid-cols-[1.5fr_1fr] gap-[14px]">
          <div className="bg-white border border-border rounded-[14px] p-[18px]">
            {(() => {
              const dados = (mensal || []).filter(m => m.receita > 0 || m.despesa > 0)
              if (dados.length === 0) {
                return (
                  <>
                    <div className="flex justify-between items-center mb-[14px]">
                      <span className="text-[15px] font-extrabold text-primary-dark">Receita × Despesa</span>
                    </div>
                    <div className="flex items-center justify-center h-[180px] text-text-secondary text-[14px] font-medium">Sem dados suficientes</div>
                  </>
                )
              }
              const maxVal = Math.max(...dados.map(d => Math.max(d.receita, d.despesa))) || 1
              const barW = Math.min(15, Math.floor(400 / dados.length / 2.5))
              return (
                <>
                  <div className="flex justify-between items-center mb-[14px]">
                    <span className="text-[15px] font-extrabold text-primary-dark">Receita × Despesa</span>
                    <span className="text-[12px] text-text-secondary font-semibold">{dados[0].nome} – {dados[dados.length - 1].nome}</span>
                  </div>
                  <svg viewBox="0 0 560 180" className="w-full h-[180px]">
                    <line x1="40" y1="150" x2="548" y2="150" stroke="#cfd4c7" strokeWidth="1.5" />
                    {dados.map((d, i) => {
                      const x = 64 + i * (500 / dados.length)
                      const h1 = Math.round((d.receita / maxVal) * 120)
                      const h2 = Math.round((d.despesa / maxVal) * 120)
                      return (
                        <g key={i}>
                          <rect x={x} y={150 - h1} width={barW} height={h1} rx="2" fill={i === dados.length - 1 ? '#588157' : '#3a5a40'} />
                          <rect x={x + barW + 3} y={150 - h2} width={barW} height={h2} rx="2" fill="#b54a2f" />
                        </g>
                      )
                    })}
                  </svg>
                  <div className="flex gap-[16px] text-[12px] font-semibold mt-[6px]"><span className="text-primary">■ Receita</span><span className="text-danger">■ Despesa</span></div>
                </>
              )
            })()}
          </div>

          <div className="bg-white border border-border rounded-[14px] p-[18px]">
            <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Despesa por categoria</div>
            <div className="flex flex-col gap-[12px]">
              {porCategoria.map((d, i) => (
                <div key={d.categoria}>
                  <div className="flex justify-between text-[13px] mb-[5px]">
                    <span className="font-semibold text-text-body">{d.categoria}</span>
                    <span className="font-mono font-bold text-primary-dark">{fmtMoeda(parseFloat(d.total))}</span>
                  </div>
                  <div className="h-[8px] bg-segmented-bg rounded-[6px]">
                    <div className="h-full rounded-[6px]" style={{ width: `${Math.round((parseFloat(d.total) / maxCat) * 100)}%`, background: i === 0 ? '#b54a2f' : '#c9882a' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[14px] bg-white border border-border rounded-[14px] p-[18px]">
          <div className="flex justify-between items-center mb-[14px]">
            <span className="text-[15px] font-extrabold text-primary-dark">Lançamentos recentes</span>
          </div>
          <div className="grid grid-cols-[1.6fr_0.7fr_0.8fr_1fr] py-[10px] px-[4px] text-[12px] font-bold text-text-secondary uppercase"><span>Descrição</span><span>Tipo</span><span>Data</span><span className="text-right">Valor</span></div>
          {lista.slice(0, 4).map(l => {
            const val = parseFloat(l.valor)
            const isPositive = val > 0
            const tipoLabel = isPositive ? 'Receita' : (l.tipo === 'compra' ? 'Compra' : 'Custo')
            const tipoColor = isPositive ? 'text-primary-medium' : 'text-danger'
            return (
              <div key={l.id} className="grid grid-cols-[1.6fr_0.7fr_0.8fr_1fr] py-[11px] px-[4px] text-[13.5px] border-t border-[#f0ede4] text-text-body items-center">
                <span className="font-bold text-primary-dark">{l.descricao || l.categoria}</span>
                <span className={`text-[12px] font-bold ${tipoColor}`}>{tipoLabel}</span>
                <span className="font-mono">{fmtDataCurta(l.data)}</span>
                <span className={`font-mono font-bold text-right ${isPositive ? 'text-primary-medium' : 'text-danger'}`}>{isPositive ? '+' : '−'}{fmtMoeda(l.valor)}</span>
              </div>
            )
          })}
          {lista.length === 0 && (
            <div className="py-[24px] text-center text-text-secondary text-[14px] border-t border-[#f0ede4]">Nenhum lançamento registrado.</div>
          )}
        </div>
      </div>
    </>
  )
}

export default function FinanceiroPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopFinanceiro /> : <MobileFinanceiro />
}
