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
        <span className="text-[13px] font-bold text-primary bg-chip-bg py-[6px] px-[12px] rounded-chip">Semestre ▾</span>
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
          <div className="text-[12.5px] text-accent-light font-semibold mt-[3px]">margem {rec ? `${Math.round((res / rec) * 100)}%` : '—'} · jan–jun</div>
        </div>

        <div className="bg-white border border-[#eee9df] rounded-[14px] p-[16px] mb-[14px]">
          <div className="text-[13.5px] font-extrabold text-primary-dark mb-[12px]">Receita × Despesa</div>
          <svg viewBox="0 0 290 130" className="w-full h-[130px]">
            <line x1="6" y1="110" x2="284" y2="110" stroke="#cfd4c7" strokeWidth="1.5" />
            {[{ x: 20, h1: 38, h2: 18 }, { x: 66, h1: 32, h2: 15 }, { x: 112, h1: 52, h2: 22 }, { x: 158, h1: 45, h2: 18 }, { x: 204, h1: 66, h2: 25 }, { x: 250, h1: 90, h2: 25 }].map((b, i) => (
              <g key={i}><rect x={b.x} y={110 - b.h1} width="11" height={b.h1} rx="2" fill={i === 5 ? '#588157' : '#3a5a40'} /><rect x={b.x + 13} y={110 - b.h2} width="11" height={b.h2} rx="2" fill="#b54a2f" /></g>
            ))}
          </svg>
          <div className="flex gap-[16px] text-[11.5px] font-semibold mt-[6px]"><span className="text-primary">■ Receita</span><span className="text-danger">■ Despesa</span></div>
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

      <div className="px-[22px] py-[10px] pb-[24px]"><Button fullWidth>Exportar PDF</Button></div>
    </div>
  )
}

const periodos = [
  { value: 'semestre1', label: 'Jan–Jun', meses: [1,2,3,4,5,6] },
  { value: 'semestre2', label: 'Jul–Dez', meses: [7,8,9,10,11,12] },
  { value: 'ano', label: 'Ano inteiro', meses: null },
]

function DesktopRelatorios() {
  const [periodo, setPeriodo] = useState('semestre1')
  const [loteFiltro, setLoteFiltro] = useState('todos')
  const { data: lotesData } = useApi(() => api.lotes.listar(), [])
  const { data: resumo } = useApi(() => api.financeiro.resumo(), [])
  const { data: resultadoPorLote } = useApi(() => api.financeiro.porLote(), [])
  const rec = resumo ? parseFloat(resumo.receita) : 0
  const desp = resumo ? parseFloat(resumo.despesa) : 0
  const res = rec - desp
  const porCategoria = resumo?.por_categoria || []
  const allLotes = resultadoPorLote || []
  const lotes = loteFiltro === 'todos' ? allLotes : allLotes.filter(l => l.nome === loteFiltro)
  const periodoAtual = periodos.find(p => p.value === periodo)
  const ano = new Date().getFullYear()

  const selectStyle = "appearance-none bg-white border-[1.5px] border-field-border rounded-chip py-[8px] px-[14px] pr-[30px] text-[13px] font-bold text-primary-dark outline-none cursor-pointer"
  const selectBg = { backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%237c8378\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Relatórios</div>
          <div className="text-[13px] text-text-secondary font-medium">Financeiro · {periodoAtual?.label} {ano}</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <button className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer">Exportar PDF</button>
          <button className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none">Exportar Excel</button>
        </div>
      </div>

      <div className="flex gap-[10px] px-[26px] py-[14px] pb-[12px] bg-header-bg border-b border-border">
        <select value={periodo} onChange={e => setPeriodo(e.target.value)} className={selectStyle} style={selectBg}>
          {periodos.map(p => <option key={p.value} value={p.value}>{p.label} {ano}</option>)}
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
          <div className="flex justify-between items-center mb-[6px]">
            <span className="text-[15px] font-extrabold text-primary-dark">Receita × Despesa por mês</span>
            <div className="flex gap-[16px] text-[12px] font-semibold"><span className="text-primary">■ Receita</span><span className="text-danger">■ Despesa</span></div>
          </div>
          <svg viewBox="0 0 560 210" className="w-full h-[210px]">
            <line x1="46" y1="180" x2="548" y2="180" stroke="#cfd4c7" strokeWidth="1.5" />
            <line x1="46" y1="140" x2="548" y2="140" stroke="#f0ede4" /><text x="20" y="144" fontFamily="Spline Sans Mono" fontSize="10" fill="#9aa295">30k</text>
            <line x1="46" y1="100" x2="548" y2="100" stroke="#f0ede4" /><text x="20" y="104" fontFamily="Spline Sans Mono" fontSize="10" fill="#9aa295">60k</text>
            <line x1="46" y1="60" x2="548" y2="60" stroke="#f0ede4" /><text x="20" y="64" fontFamily="Spline Sans Mono" fontSize="10" fill="#9aa295">90k</text>
            {[{ x: 70, h1: 53, h2: 29 }, { x: 150, h1: 47, h2: 24 }, { x: 230, h1: 73, h2: 33 }, { x: 310, h1: 64, h2: 27 }, { x: 390, h1: 93, h2: 37 }, { x: 470, h1: 149, h2: 37 }].map((b, i) => (
              <g key={i}><rect x={b.x} y={180 - b.h1} width="15" height={b.h1} rx="2" fill={i === 5 ? '#588157' : '#3a5a40'} /><rect x={b.x + 18} y={180 - b.h2} width="15" height={b.h2} rx="2" fill="#b54a2f" /></g>
            ))}
            {['jan', 'fev', 'mar', 'abr', 'mai', 'jun'].map((m, i) => (
              <text key={m} x={78 + i * 80} y="196" fontFamily="Spline Sans Mono" fontSize="11" fill="#9aa295">{m}</text>
            ))}
          </svg>
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
