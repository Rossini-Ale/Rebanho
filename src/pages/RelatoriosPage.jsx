import { useState } from 'react'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import KPITile from '../components/ui/KPITile'
import Chip from '../components/ui/Chip'
import Button from '../components/ui/Button'
import { api } from '../lib/api'
import { fmtMoeda } from '../lib/utils'

function MobileRelatorios() {
  const [tipo, setTipo] = useState('Financeiro')
  const { data: resumo } = useApi(() => api.financeiro.resumo(), [])
  const { data: mensal } = useApi(() => api.dashboard.mensal(), [])
  const rec = resumo ? parseFloat(resumo.receita) : 0
  const desp = resumo ? parseFloat(resumo.despesa) : 0
  const res = rec - desp
  const porCategoria = resumo?.por_categoria || []

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-[20px] pt-[8px] pb-[12px]">
        <div className="flex items-center gap-[14px]">
          <span className="text-[19px] font-extrabold text-primary-dark">Relatórios</span>
        </div>
        <span className="text-[13px] font-bold text-text-secondary bg-chip-bg py-[6px] px-[12px] rounded-chip">{new Date().getFullYear()}</span>
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[8px]">
        <div className="flex gap-[8px] mb-[14px]">
          {['Financeiro', 'Rebanho', 'Sanidade'].map(t => (
            <Chip key={t} active={tipo === t} onClick={() => setTipo(t)}>{t}</Chip>
          ))}
        </div>

        <div className="bg-primary rounded-[16px] p-[18px] mb-[14px]">
          <div className="text-[13px] text-accent-light font-semibold">Resultado do semestre</div>
          <div className="font-mono text-[32px] font-bold text-white leading-[1.1]">+{fmtMoeda(res)}</div>
          <div className="text-[12.5px] text-accent-light font-semibold mt-[3px]">margem {rec ? `${Math.round((res / rec) * 100)}%` : '—'} · {new Date().getFullYear()}</div>
        </div>

        <div className="bg-white border border-[#eee9df] rounded-[14px] p-[16px] mb-[14px]">
          <div className="text-[13.5px] font-extrabold text-primary-dark mb-[12px]">Receita × Despesa</div>
          {(() => {
            const dados = (mensal || []).filter(m => m.receita > 0 || m.despesa > 0)
            if (dados.length === 0) {
              return <div className="flex items-center justify-center h-[130px] text-text-secondary text-[13px] font-medium">Sem dados suficientes</div>
            }
            const maxVal = Math.max(...dados.map(d => Math.max(d.receita, d.despesa))) || 1
            return (
              <>
                <svg viewBox="0 0 290 130" className="w-full h-[130px]">
                  <line x1="6" y1="110" x2="284" y2="110" stroke="#cfd4c7" strokeWidth="1.5" />
                  {dados.map((d, i) => {
                    const x = 20 + i * (250 / dados.length)
                    const h1 = Math.round((d.receita / maxVal) * 85)
                    const h2 = Math.round((d.despesa / maxVal) * 85)
                    return (
                      <g key={i}>
                        <rect x={x} y={110 - h1} width="11" height={h1} rx="2" fill={i === dados.length - 1 ? '#588157' : '#3a5a40'} />
                        <rect x={x + 13} y={110 - h2} width="11" height={h2} rx="2" fill="#b54a2f" />
                      </g>
                    )
                  })}
                </svg>
                <div className="flex gap-[16px] text-[11.5px] font-semibold mt-[6px]"><span className="text-primary">■ Receita</span><span className="text-danger">■ Despesa</span></div>
              </>
            )
          })()}
        </div>

        <div className="text-[13px] font-extrabold text-text-secondary uppercase tracking-[.04em] mb-[8px]">Por categoria</div>
        <div className="flex flex-col gap-[9px]">
          <div className="bg-white border border-[#eee9df] rounded-[12px] p-[12px_15px] flex justify-between">
            <span className="text-[14px] font-bold text-primary-dark">Venda de gado</span>
            <span className="font-mono text-[14px] font-bold text-primary-medium">+{fmtMoeda(rec)}</span>
          </div>
          {porCategoria.map(c => (
            <div key={c.categoria} className="bg-white border border-[#eee9df] rounded-[12px] p-[12px_15px] flex justify-between">
              <span className="text-[14px] font-bold text-primary-dark">{c.categoria}</span>
              <span className="font-mono text-[14px] font-bold text-danger">−{fmtMoeda(parseFloat(c.total))}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-[22px] py-[10px] pb-[24px]"><Button fullWidth onClick={() => window.print()}>Exportar PDF</Button></div>
    </div>
  )
}

const mesesNome = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function buildPeriodos() {
  const hoje = new Date()
  const anoAtual = hoje.getFullYear()
  const opcoes = []

  opcoes.push({ value: 'ultimos30', label: 'Últimos 30 dias' })
  opcoes.push({ value: 'ultimos90', label: 'Últimos 90 dias' })

  for (let m = 0; m < 12; m++) {
    opcoes.push({ value: `mes-${anoAtual}-${m + 1}`, label: `${mesesNome[m]} ${anoAtual}` })
  }

  opcoes.push({ value: `q1-${anoAtual}`, label: `1º Tri ${anoAtual} (Jan–Mar)` })
  opcoes.push({ value: `q2-${anoAtual}`, label: `2º Tri ${anoAtual} (Abr–Jun)` })
  opcoes.push({ value: `q3-${anoAtual}`, label: `3º Tri ${anoAtual} (Jul–Set)` })
  opcoes.push({ value: `q4-${anoAtual}`, label: `4º Tri ${anoAtual} (Out–Dez)` })

  opcoes.push({ value: `s1-${anoAtual}`, label: `1º Sem ${anoAtual} (Jan–Jun)` })
  opcoes.push({ value: `s2-${anoAtual}`, label: `2º Sem ${anoAtual} (Jul–Dez)` })

  opcoes.push({ value: `ano-${anoAtual}`, label: `${anoAtual} inteiro` })
  opcoes.push({ value: `ano-${anoAtual - 1}`, label: `${anoAtual - 1} inteiro` })

  opcoes.push({ value: 'tudo', label: 'Todo o período' })

  return opcoes
}

function getPeriodoLabel(value) {
  return buildPeriodos().find(p => p.value === value)?.label || value
}

function parsePeriodo(periodo) {
  if (!periodo || periodo === 'tudo' || periodo === 'ultimos30' || periodo === 'ultimos90') return {}
  const mesMatch = periodo.match(/^mes-(\d+)-(\d+)$/)
  if (mesMatch) return { mes: parseInt(mesMatch[2]), ano: parseInt(mesMatch[1]) }
  const qMatch = periodo.match(/^q[1-4]-(\d+)$/)
  if (qMatch) return { ano: parseInt(qMatch[1]) }
  const sMatch = periodo.match(/^s[12]-(\d+)$/)
  if (sMatch) return { ano: parseInt(sMatch[1]) }
  const anoMatch = periodo.match(/^ano-(\d+)$/)
  if (anoMatch) return { ano: parseInt(anoMatch[1]) }
  return {}
}

function DesktopRelatorios() {
  const [periodo, setPeriodo] = useState('tudo')
  const [loteFiltro, setLoteFiltro] = useState('todos')
  const params = parsePeriodo(periodo)
  const { data: lotesData } = useApi(() => api.lotes.listar(), [])
  const { data: resumo } = useApi(() => api.financeiro.resumo(params), [periodo])
  const { data: resultadoPorLote } = useApi(() => api.financeiro.porLote(), [])
  const { data: mensalDesktop } = useApi(() => api.dashboard.mensal(), [])
  const rec = resumo ? parseFloat(resumo.receita) : 0
  const desp = resumo ? parseFloat(resumo.despesa) : 0
  const res = rec - desp
  const porCategoria = resumo?.por_categoria || []
  const allLotes = resultadoPorLote || []
  const lotes = loteFiltro === 'todos' ? allLotes : allLotes.filter(l => l.nome === loteFiltro)

  const selectStyle = "appearance-none bg-white border-[1.5px] border-field-border rounded-chip py-[8px] px-[14px] pr-[30px] text-[13px] font-bold text-primary-dark outline-none cursor-pointer"
  const selectBg = { backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%237c8378\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Relatórios</div>
          <div className="text-[13px] text-text-secondary font-medium">Financeiro · {getPeriodoLabel(periodo)}</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <button onClick={() => window.print()} className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer">Exportar PDF</button>
          <button className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none opacity-50" disabled>Exportar Excel</button>
        </div>
      </div>

      <div className="flex gap-[10px] px-[26px] py-[14px] pb-[12px] bg-header-bg border-b border-border">
        <select value={periodo} onChange={e => setPeriodo(e.target.value)} className={selectStyle} style={selectBg}>
          {buildPeriodos().map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select value={loteFiltro} onChange={e => setLoteFiltro(e.target.value)} className={selectStyle} style={selectBg}>
          <option value="todos">Todos os lotes</option>
          {(lotesData || []).map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-auto p-[18px_26px] bg-header-bg">
        <div className="grid grid-cols-4 gap-[14px] mb-[16px]">
          <KPITile label="Receita" value={fmtMoeda(rec)} />
          <KPITile label="Despesa" value={fmtMoeda(desp)} />
          <KPITile label="Resultado" value={`+${fmtMoeda(res)}`} />
          <KPITile label="Margem" value={rec ? `${Math.round((res / rec) * 100)}%` : '—'} variant="primary" />
        </div>

        <div className="bg-white border border-border rounded-[14px] p-[18px] mb-[16px]">
          {(() => {
            const dados = (mensalDesktop || []).filter(m => m.receita > 0 || m.despesa > 0)
            if (dados.length === 0) {
              return (
                <>
                  <div className="flex justify-between items-center mb-[6px]">
                    <span className="text-[15px] font-extrabold text-primary-dark">Receita × Despesa por mês</span>
                  </div>
                  <div className="flex items-center justify-center h-[210px] text-text-secondary text-[14px] font-medium">Sem dados suficientes</div>
                </>
              )
            }
            const maxVal = Math.max(...dados.map(d => Math.max(d.receita, d.despesa))) || 1
            const barW = Math.min(15, Math.floor(460 / dados.length / 2.5))
            return (
              <>
                <div className="flex justify-between items-center mb-[6px]">
                  <span className="text-[15px] font-extrabold text-primary-dark">Receita × Despesa por mês</span>
                  <div className="flex gap-[16px] text-[12px] font-semibold"><span className="text-primary">■ Receita</span><span className="text-danger">■ Despesa</span></div>
                </div>
                <svg viewBox="0 0 560 210" className="w-full h-[210px]">
                  <line x1="46" y1="180" x2="548" y2="180" stroke="#cfd4c7" strokeWidth="1.5" />
                  {dados.map((d, i) => {
                    const x = 70 + i * (480 / dados.length)
                    const h1 = Math.round((d.receita / maxVal) * 140)
                    const h2 = Math.round((d.despesa / maxVal) * 140)
                    return (
                      <g key={i}>
                        <rect x={x} y={180 - h1} width={barW} height={h1} rx="2" fill={i === dados.length - 1 ? '#588157' : '#3a5a40'} />
                        <rect x={x + barW + 3} y={180 - h2} width={barW} height={h2} rx="2" fill="#b54a2f" />
                        <text x={x + barW / 2} y="196" fontFamily="Spline Sans Mono" fontSize="11" fill="#9aa295" textAnchor="middle">{d.nome}</text>
                      </g>
                    )
                  })}
                </svg>
              </>
            )
          })()}
        </div>

        <div className="grid grid-cols-[1.5fr_1fr] gap-[14px]">
          <div className="bg-white border border-border rounded-[14px] p-[18px]">
            <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Por categoria</div>
            <div className="flex flex-col gap-[13px]">
              <div>
                <div className="flex justify-between text-[13.5px] mb-[5px]"><span className="font-semibold text-text-body">Venda de gado</span><span className="font-mono font-bold text-primary-medium">{fmtMoeda(rec)}</span></div>
                <div className="h-[8px] bg-segmented-bg rounded-[6px]"><div className="h-full rounded-[6px] bg-primary" style={{ width: '100%' }} /></div>
              </div>
              {porCategoria.map((d, i) => (
                <div key={d.categoria}>
                  <div className="flex justify-between text-[13.5px] mb-[5px]"><span className="font-semibold text-text-body">{d.categoria}</span><span className="font-mono font-bold text-danger">{fmtMoeda(parseFloat(d.total))}</span></div>
                  <div className="h-[8px] bg-segmented-bg rounded-[6px]"><div className="h-full rounded-[6px]" style={{ width: `${Math.round((parseFloat(d.total) / (rec || 1)) * 100)}%`, background: i === 0 ? '#b54a2f' : '#c9882a' }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-border rounded-[14px] p-[18px]">
            <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Resultado por lote</div>
            <div className="flex flex-col gap-[11px]">
              {lotes.map((r, i) => (
                <div key={r.nome} className={`flex justify-between ${i < lotes.length - 1 ? 'pb-[10px] border-b border-[#f0ede4]' : ''}`}>
                  <span className="text-[13.5px] font-semibold text-text-body">{r.nome}</span>
                  <span className={`font-mono text-[13.5px] font-bold ${r.resultado >= 0 ? 'text-primary-medium' : 'text-danger'}`}>
                    {r.resultado >= 0 ? '+' : '−'}{fmtMoeda(r.resultado)}
                  </span>
                </div>
              ))}
              {lotes.length === 0 && <div className="text-center text-text-secondary text-[13px] py-[8px]">Sem dados</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function RelatoriosPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopRelatorios /> : <MobileRelatorios />
}
