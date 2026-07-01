import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import KPITile from '../components/ui/KPITile'
import Chip from '../components/ui/Chip'
import Button from '../components/ui/Button'
import { api } from '../lib/api'
import { fmtMoeda, fmtDataCurta } from '../lib/utils'
import { Download, ChevronLeft } from 'lucide-react'

// ── período ──────────────────────────────────────────────────────────────────

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function buildPeriodos() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  return [
    { value: 'tudo',       label: 'Todo o período' },
    { value: 'ultimos30',  label: 'Últimos 30 dias' },
    { value: 'ultimos90',  label: 'Últimos 90 dias' },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: `mes-${ano}-${i + 1}`, label: `${MESES[i]} ${ano}`,
    })),
    { value: `q1-${ano}`, label: `1º Tri ${ano} (Jan–Mar)` },
    { value: `q2-${ano}`, label: `2º Tri ${ano} (Abr–Jun)` },
    { value: `q3-${ano}`, label: `3º Tri ${ano} (Jul–Set)` },
    { value: `q4-${ano}`, label: `4º Tri ${ano} (Out–Dez)` },
    { value: `s1-${ano}`, label: `1º Sem ${ano} (Jan–Jun)` },
    { value: `s2-${ano}`, label: `2º Sem ${ano} (Jul–Dez)` },
    { value: `ano-${ano}`, label: `${ano} inteiro` },
    { value: `ano-${ano - 1}`, label: `${ano - 1} inteiro` },
  ]
}

function periodoToRange(value) {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const fmt = (d) => d.toISOString().slice(0, 10)
  if (!value || value === 'tudo') return {}
  if (value === 'ultimos30') {
    const d = new Date(); d.setDate(d.getDate() - 30)
    return { dataInicio: fmt(d), dataFim: fmt(hoje) }
  }
  if (value === 'ultimos90') {
    const d = new Date(); d.setDate(d.getDate() - 90)
    return { dataInicio: fmt(d), dataFim: fmt(hoje) }
  }
  const mesM = value.match(/^mes-(\d+)-(\d+)$/)
  if (mesM) {
    const [, y, m] = mesM
    return { dataInicio: `${y}-${String(m).padStart(2,'0')}-01`, dataFim: fmt(new Date(+y, +m, 0)) }
  }
  const qM = value.match(/^q([1-4])-(\d+)$/)
  if (qM) {
    const q = +qM[1], y = +qM[2]
    const starts = [[1,1],[4,1],[7,1],[10,1]]
    const ends   = [[3,31],[6,30],[9,30],[12,31]]
    const [sm, sd] = starts[q-1]; const [em, ed] = ends[q-1]
    return { dataInicio: `${y}-${String(sm).padStart(2,'0')}-${String(sd).padStart(2,'0')}`, dataFim: `${y}-${String(em).padStart(2,'0')}-${String(ed).padStart(2,'0')}` }
  }
  const sM = value.match(/^s([12])-(\d+)$/)
  if (sM) {
    const s = +sM[1], y = +sM[2]
    return s === 1
      ? { dataInicio: `${y}-01-01`, dataFim: `${y}-06-30` }
      : { dataInicio: `${y}-07-01`, dataFim: `${y}-12-31` }
  }
  const aM = value.match(/^ano-(\d+)$/)
  if (aM) return { dataInicio: `${aM[1]}-01-01`, dataFim: `${aM[1]}-12-31` }
  return {}
}

function getPeriodoLabel(v) {
  return buildPeriodos().find(p => p.value === v)?.label || v
}

// ── helpers ──────────────────────────────────────────────────────────────────

const selectStyle = "appearance-none bg-white border-[1.5px] border-field-border rounded-chip py-[8px] px-[14px] pr-[30px] text-[13px] font-bold text-primary-dark outline-none cursor-pointer"
const selectBg = { backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%237c8378\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }

function exportCSV(nome, headers, rows) {
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `${nome}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// ── relatório financeiro ──────────────────────────────────────────────────────

function RelFinanceiro({ params, periodoLabel }) {
  const { data, loading } = useApi(() => api.relatorios.financeiro(params), [JSON.stringify(params)])
  const { data: mensal } = useApi(() => api.dashboard.mensal(), [])
  const rec = data ? data.receita : 0
  const desp = data ? data.despesa : 0
  const res = rec - desp
  const cats = data?.por_categoria || []
  const maxCat = cats.length ? Math.max(...cats.map(c => c.receita + c.despesa)) : 1

  const handleExport = () => {
    if (!data) return
    exportCSV(`financeiro-${periodoLabel}`,
      ['Categoria', 'Tipo', 'Receita', 'Despesa'],
      cats.map(c => [c.categoria, c.tipo, c.receita.toFixed(2), c.despesa.toFixed(2)])
    )
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-[14px] mb-[16px]">
        <KPITile label="Receita" value={fmtMoeda(rec)} subtitle={periodoLabel} />
        <KPITile label="Despesa" value={fmtMoeda(desp)} subtitle={periodoLabel} />
        <KPITile label="Resultado" value={(res >= 0 ? '+' : '') + fmtMoeda(res)} subtitle={periodoLabel} />
        <KPITile label="Margem" value={rec > 0 ? `${Math.round((res / rec) * 100)}%` : '—'} variant="primary" />
      </div>

      <div className="bg-white border border-border rounded-[14px] p-[18px] mb-[14px]">
        {(() => {
          const dados = (mensal || []).filter(m => m.receita > 0 || m.despesa > 0)
          if (!dados.length) return (
            <>
              <div className="text-[15px] font-extrabold text-primary-dark mb-[6px]">Receita × Despesa por mês</div>
              <div className="flex items-center justify-center h-[190px] text-text-secondary text-[14px]">Sem dados suficientes</div>
            </>
          )
          const maxVal = Math.max(...dados.map(d => Math.max(d.receita, d.despesa))) || 1
          const barW = Math.min(16, Math.floor(460 / dados.length / 2.5))
          return (
            <>
              <div className="flex justify-between items-center mb-[10px]">
                <span className="text-[15px] font-extrabold text-primary-dark">Receita × Despesa por mês</span>
                <div className="flex gap-[16px] text-[12px] font-semibold"><span className="text-primary">■ Receita</span><span className="text-danger">■ Despesa</span></div>
              </div>
              <svg viewBox="0 0 560 190" className="w-full h-[190px]">
                <line x1="46" y1="160" x2="548" y2="160" stroke="#cfd4c7" strokeWidth="1.5" />
                {dados.map((d, i) => {
                  const x = 70 + i * (480 / dados.length)
                  const h1 = Math.round((d.receita / maxVal) * 130)
                  const h2 = Math.round((d.despesa / maxVal) * 130)
                  return (
                    <g key={i}>
                      <rect x={x} y={160 - h1} width={barW} height={h1} rx="2" fill="#3a5a40">
                        <title>Receita {d.nome}: R$ {d.receita.toLocaleString('pt-BR')}</title>
                      </rect>
                      <rect x={x + barW + 3} y={160 - h2} width={barW} height={h2} rx="2" fill="#b54a2f">
                        <title>Despesa {d.nome}: R$ {d.despesa.toLocaleString('pt-BR')}</title>
                      </rect>
                      <text x={x + barW} y="176" fontFamily="Spline Sans Mono" fontSize="10" fill="#9aa295" textAnchor="middle">{d.nome}</text>
                    </g>
                  )
                })}
              </svg>
            </>
          )
        })()}
      </div>

      <div className="grid grid-cols-2 gap-[14px]">
        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="flex justify-between items-center mb-[14px]">
            <span className="text-[15px] font-extrabold text-primary-dark">Por categoria</span>
            <button onClick={handleExport} className="flex items-center gap-[5px] text-[12.5px] font-bold text-primary bg-chip-bg border-none rounded-chip py-[5px] px-[10px] cursor-pointer"><Download size={12} /> CSV</button>
          </div>
          {loading && <div className="text-text-secondary text-[14px] py-[12px]">Carregando…</div>}
          {cats.map((c, i) => {
            const val = c.receita > 0 ? c.receita : c.despesa
            const isRec = c.receita > 0
            const pct = Math.round((val / maxCat) * 100)
            return (
              <div key={c.categoria + c.tipo} className={i < cats.length - 1 ? 'mb-[14px]' : ''}>
                <div className="flex justify-between text-[13.5px] mb-[5px]">
                  <span className="font-semibold text-text-body">{c.categoria}</span>
                  <span className={`font-mono font-bold ${isRec ? 'text-primary-medium' : 'text-danger'}`}>{isRec ? '+' : '−'}{fmtMoeda(val)}</span>
                </div>
                <div className="h-[7px] bg-segmented-bg rounded-[6px]">
                  <div className="h-full rounded-[6px]" style={{ width: `${pct}%`, background: isRec ? '#3a5a40' : '#b54a2f' }} />
                </div>
              </div>
            )
          })}
          {!loading && !cats.length && <div className="text-center text-text-secondary text-[13px] py-[12px]">Sem lançamentos no período</div>}
        </div>

        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Maiores lançamentos</div>
          {(data?.top_lancamentos || []).map((l, i) => {
            const val = parseFloat(l.valor)
            const isPos = val > 0
            return (
              <div key={l.id} className={`flex justify-between items-center py-[10px] ${i < (data?.top_lancamentos?.length - 1) ? 'border-b border-[#f0ede4]' : ''}`}>
                <div>
                  <div className="text-[13.5px] font-bold text-primary-dark">{l.descricao || l.categoria}</div>
                  <div className="text-[12px] text-text-secondary">{l.categoria} · {fmtDataCurta(l.data)}</div>
                </div>
                <span className={`font-mono text-[13.5px] font-bold ${isPos ? 'text-primary-medium' : 'text-danger'}`}>
                  {isPos ? '+' : '−'}{fmtMoeda(l.valor)}
                </span>
              </div>
            )
          })}
          {!loading && !data?.top_lancamentos?.length && <div className="text-center text-text-secondary text-[13px] py-[12px]">Sem lançamentos no período</div>}
        </div>
      </div>
    </>
  )
}

// ── relatório de rebanho ──────────────────────────────────────────────────────

function RelRebanho({ params, periodoLabel }) {
  const { data, loading } = useApi(() => api.relatorios.rebanho(params), [JSON.stringify(params)])
  const totais = data?.totais || {}
  const porRaca = data?.por_raca || []
  const porLote = data?.por_lote || []
  const maxRaca = porRaca.length ? Math.max(...porRaca.map(r => r.total)) : 1

  const handleExport = () => {
    if (!data) return
    exportCSV(`rebanho-${periodoLabel}`,
      ['Lote', 'Total', 'Peso Médio (kg)'],
      porLote.map(l => [l.nome, l.total, l.peso_medio || '—'])
    )
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-[14px] mb-[16px]">
        <KPITile label="Total animais" value={String(totais.total || 0)} subtitle="no cadastro" />
        <KPITile label="Ativos" value={String(totais.ativos || 0)} subtitle={`${totais.femeas || 0} F · ${totais.machos || 0} M`} />
        <KPITile label="Peso médio" value={data?.peso_medio ? `${data.peso_medio} kg` : '—'} subtitle="rebanho ativo" />
        <KPITile label="Prenhes" value={String(totais.prenhes || 0)} subtitle={`${totais.total ? Math.round((totais.prenhes / totais.total) * 100) : 0}% do total`} variant="primary" />
      </div>

      <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Composição do rebanho</div>
          <div className="grid grid-cols-3 gap-[10px]">
            {[
              { label: 'Ativos', value: totais.ativos || 0, color: '#3a5a40', bg: '#e7ece4' },
              { label: 'Prenhes', value: totais.prenhes || 0, color: '#a9711f', bg: '#f6eed9' },
              { label: 'Vendidos', value: totais.vendidos || 0, color: '#588157', bg: '#e7ece4' },
              { label: 'Mortos', value: totais.mortos || 0, color: '#b54a2f', bg: '#fde8e4' },
              { label: 'Machos', value: totais.machos || 0, color: '#7c8378', bg: '#eceadf' },
              { label: 'Fêmeas', value: totais.femeas || 0, color: '#8b5cf6', bg: '#f0e7fb' },
            ].map(item => (
              <div key={item.label} className="rounded-[12px] p-[12px]" style={{ background: item.bg }}>
                <div className="font-mono text-[22px] font-bold" style={{ color: item.color }}>{item.value}</div>
                <div className="text-[12px] font-bold text-text-secondary mt-[2px]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Por raça</div>
          {porRaca.map((r, i) => (
            <div key={r.raca} className={i < porRaca.length - 1 ? 'mb-[12px]' : ''}>
              <div className="flex justify-between text-[13.5px] mb-[5px]">
                <span className="font-semibold text-text-body">{r.raca}</span>
                <span className="font-mono font-bold text-primary-dark">{r.total} cab.</span>
              </div>
              <div className="h-[7px] bg-segmented-bg rounded-[6px]">
                <div className="h-full rounded-[6px] bg-primary" style={{ width: `${Math.round((r.total / maxRaca) * 100)}%` }} />
              </div>
            </div>
          ))}
          {!loading && !porRaca.length && <div className="text-center text-text-secondary text-[13px] py-[8px]">Sem dados</div>}
        </div>
      </div>

      <div className="bg-white border border-border rounded-[14px] p-[18px]">
        <div className="flex justify-between items-center mb-[14px]">
          <span className="text-[15px] font-extrabold text-primary-dark">Por lote</span>
          <button onClick={handleExport} className="flex items-center gap-[5px] text-[12.5px] font-bold text-primary bg-chip-bg border-none rounded-chip py-[5px] px-[10px] cursor-pointer"><Download size={12} /> CSV</button>
        </div>
        <div className="grid grid-cols-[1.5fr_0.6fr_0.8fr] py-[8px] text-[12px] font-bold text-text-secondary uppercase">
          <span>Lote</span><span>Animais</span><span>Peso médio</span>
        </div>
        {porLote.map((l, i) => (
          <div key={l.nome} className={`grid grid-cols-[1.5fr_0.6fr_0.8fr] py-[11px] text-[14px] border-t border-[#f0ede4] items-center`}>
            <span className="font-bold text-primary-dark">{l.nome}</span>
            <span className="font-mono font-bold text-primary-dark">{l.total}</span>
            <span className="font-mono text-text-body">{l.peso_medio ? `${l.peso_medio} kg` : '—'}</span>
          </div>
        ))}
        {!loading && !porLote.length && <div className="text-center text-text-secondary text-[13px] py-[12px]">Nenhum lote cadastrado</div>}
      </div>
    </>
  )
}

// ── relatório GMD ────────────────────────────────────────────────────────────

function RelGMD({ params, periodoLabel }) {
  const { data, loading } = useApi(() => api.relatorios.gmd(params), [JSON.stringify(params)])
  const porLote = data?.por_lote || []
  const porRaca = data?.por_raca || []
  const top = data?.top_performers || []
  const bottom = data?.bottom_performers || []
  const maxLote = porLote.length ? Math.max(...porLote.map(l => l.gmd_medio)) : 1
  const maxRaca = porRaca.length ? Math.max(...porRaca.map(r => r.gmd_medio)) : 1

  const handleExport = () => {
    if (!data) return
    exportCSV(`gmd-${periodoLabel}`,
      ['Lote', 'GMD Médio (kg/dia)', 'Animais'],
      porLote.map(l => [l.lote_nome, l.gmd_medio, l.qtd_animais])
    )
  }

  const fmtGmd = (v) => v != null ? `${parseFloat(v).toFixed(3)} kg/dia` : '—'

  if (loading) return <div className="text-text-secondary text-[14px] py-[20px]">Carregando…</div>

  if (!data || data.animais_com_dados === 0) return (
    <div className="bg-white border border-border rounded-[14px] p-[32px] text-center">
      <div className="text-[15px] font-bold text-primary-dark mb-[8px]">Sem dados de GMD</div>
      <div className="text-[13px] text-text-secondary">É necessário pelo menos 2 pesagens por animal para calcular o ganho médio diário.</div>
    </div>
  )

  return (
    <>
      <div className="grid grid-cols-4 gap-[14px] mb-[16px]">
        <KPITile label="GMD médio" value={fmtGmd(data.gmd_medio)} subtitle="rebanho" variant="primary" />
        <KPITile label="Animais" value={String(data.animais_com_dados)} subtitle="com 2+ pesagens" />
        <KPITile label="Melhor GMD" value={top[0] ? fmtGmd(top[0].gmd) : '—'} subtitle={top[0] ? `#${top[0].brinco}` : '—'} />
        <KPITile label="Pior GMD" value={bottom[0] ? fmtGmd(bottom[0].gmd) : '—'} subtitle={bottom[0] ? `#${bottom[0].brinco}` : '—'} />
      </div>

      <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="flex justify-between items-center mb-[14px]">
            <span className="text-[15px] font-extrabold text-primary-dark">GMD por lote</span>
            <button onClick={handleExport} className="flex items-center gap-[5px] text-[12.5px] font-bold text-primary bg-chip-bg border-none rounded-chip py-[5px] px-[10px] cursor-pointer"><Download size={12} /> CSV</button>
          </div>
          {porLote.map((l, i) => (
            <div key={l.lote_nome} className={i < porLote.length - 1 ? 'mb-[14px]' : ''}>
              <div className="flex justify-between text-[13.5px] mb-[5px]">
                <span className="font-semibold text-text-body">{l.lote_nome}</span>
                <span className="font-mono font-bold text-primary-dark">{l.gmd_medio.toFixed(3)} <span className="text-text-secondary font-normal">kg/dia · {l.qtd_animais} cab.</span></span>
              </div>
              <div className="h-[7px] bg-segmented-bg rounded-[6px]">
                <div className="h-full rounded-[6px] bg-primary" style={{ width: `${Math.round((l.gmd_medio / maxLote) * 100)}%` }} />
              </div>
            </div>
          ))}
          {!porLote.length && <div className="text-center text-text-secondary text-[13px] py-[8px]">Sem dados por lote</div>}
        </div>

        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">GMD por raça</div>
          {porRaca.map((r, i) => (
            <div key={r.raca} className={i < porRaca.length - 1 ? 'mb-[14px]' : ''}>
              <div className="flex justify-between text-[13.5px] mb-[5px]">
                <span className="font-semibold text-text-body">{r.raca}</span>
                <span className="font-mono font-bold text-primary-dark">{r.gmd_medio.toFixed(3)} <span className="text-text-secondary font-normal">kg/dia · {r.qtd_animais} cab.</span></span>
              </div>
              <div className="h-[7px] bg-segmented-bg rounded-[6px]">
                <div className="h-full rounded-[6px] bg-primary" style={{ width: `${Math.round((r.gmd_medio / maxRaca) * 100)}%` }} />
              </div>
            </div>
          ))}
          {!porRaca.length && <div className="text-center text-text-secondary text-[13px] py-[8px]">Sem dados por raça</div>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[14px]">
        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Top 5 — Maior GMD</div>
          <div className="grid grid-cols-[0.5fr_1fr_0.8fr_0.9fr] text-[11.5px] font-bold text-text-secondary uppercase tracking-[.04em] py-[6px] border-b border-[#f0ede4]">
            <span>Brinco</span><span>Raça</span><span>Lote</span><span className="text-right">GMD</span>
          </div>
          {top.map((a, i) => (
            <div key={a.id} className={`grid grid-cols-[0.5fr_1fr_0.8fr_0.9fr] items-center py-[10px] text-[13.5px] ${i < top.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
              <span className="font-bold text-primary-dark">#{a.brinco}</span>
              <span className="text-text-body font-medium truncate">{a.raca}</span>
              <span className="text-text-secondary text-[12.5px]">{a.lote_nome || '—'}</span>
              <span className="font-mono font-bold text-primary-medium text-right">{parseFloat(a.gmd).toFixed(3)}</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Bottom 5 — Menor GMD</div>
          <div className="grid grid-cols-[0.5fr_1fr_0.8fr_0.9fr] text-[11.5px] font-bold text-text-secondary uppercase tracking-[.04em] py-[6px] border-b border-[#f0ede4]">
            <span>Brinco</span><span>Raça</span><span>Lote</span><span className="text-right">GMD</span>
          </div>
          {bottom.map((a, i) => (
            <div key={a.id} className={`grid grid-cols-[0.5fr_1fr_0.8fr_0.9fr] items-center py-[10px] text-[13.5px] ${i < bottom.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
              <span className="font-bold text-primary-dark">#{a.brinco}</span>
              <span className="text-text-body font-medium truncate">{a.raca}</span>
              <span className="text-text-secondary text-[12.5px]">{a.lote_nome || '—'}</span>
              <span className="font-mono font-bold text-danger text-right">{parseFloat(a.gmd).toFixed(3)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── relatório de sanidade ─────────────────────────────────────────────────────

function RelSanidade({ params, periodoLabel }) {
  const { data, loading } = useApi(() => api.relatorios.sanidade(params), [JSON.stringify(params)])
  const porTipo = data?.por_tipo || []
  const porProduto = data?.por_produto || []
  const proximas = data?.proximas_vacinas || []
  const maxProd = porProduto.length ? Math.max(...porProduto.map(p => p.eventos)) : 1

  const tipoLabel = { vacina: 'Vacinas', vermifugo: 'Vermífugos', exame: 'Exames' }
  const tipoColor = { vacina: '#3a5a40', vermifugo: '#a9711f', exame: '#8b5cf6' }
  const tipoBg = { vacina: '#e7ece4', vermifugo: '#f6eed9', exame: '#f0e7fb' }

  const handleExport = () => {
    if (!data) return
    exportCSV(`sanidade-${periodoLabel}`,
      ['Produto', 'Eventos', 'Animais afetados'],
      porProduto.map(p => [p.produto, p.eventos, p.animais_afetados])
    )
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-[14px] mb-[16px]">
        <KPITile label="Total de eventos" value={String(data?.total_eventos || 0)} subtitle={periodoLabel} />
        {porTipo.map(t => (
          <KPITile key={t.tipo} label={tipoLabel[t.tipo] || t.tipo} value={String(t.total)} subtitle="aplicações" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-[14px]">
        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="flex justify-between items-center mb-[14px]">
            <span className="text-[15px] font-extrabold text-primary-dark">Por produto</span>
            <button onClick={handleExport} className="flex items-center gap-[5px] text-[12.5px] font-bold text-primary bg-chip-bg border-none rounded-chip py-[5px] px-[10px] cursor-pointer"><Download size={12} /> CSV</button>
          </div>
          {loading && <div className="text-text-secondary text-[14px] py-[12px]">Carregando…</div>}
          {porProduto.map((p, i) => (
            <div key={p.produto} className={i < porProduto.length - 1 ? 'mb-[14px]' : ''}>
              <div className="flex justify-between text-[13.5px] mb-[5px]">
                <span className="font-semibold text-text-body">{p.produto}</span>
                <span className="font-mono font-bold text-primary-dark">{p.eventos}x · {p.animais_afetados} animais</span>
              </div>
              <div className="h-[7px] bg-segmented-bg rounded-[6px]">
                <div className="h-full rounded-[6px] bg-primary" style={{ width: `${Math.round((p.eventos / maxProd) * 100)}%` }} />
              </div>
            </div>
          ))}
          {!loading && !porProduto.length && <div className="text-center text-text-secondary text-[13px] py-[12px]">Nenhum evento no período</div>}
        </div>

        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Próximas vacinações</div>
          {proximas.map((v, i) => (
            <div key={i} className={`flex justify-between items-center py-[11px] ${i < proximas.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
              <div>
                <div className="text-[13.5px] font-bold text-primary-dark">{v.produto}</div>
                <div className="text-[12px] text-text-secondary">{v.lote_nome} · {v.qtd_animais} animais</div>
              </div>
              <span className="text-[12.5px] font-bold font-mono text-warning">{fmtDataCurta(v.data_proxima_dose)}</span>
            </div>
          ))}
          {!proximas.length && <div className="text-center text-text-secondary text-[13px] py-[12px]">Nenhuma vacinação agendada</div>}
        </div>
      </div>
    </>
  )
}

// ── mobile ────────────────────────────────────────────────────────────────────

function MobileRelatorios() {
  const navigate = useNavigate()
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
        <div className="flex items-center gap-[12px]">
          <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0">
            <ChevronLeft size={24} />
          </button>
          <span className="text-[19px] font-extrabold text-primary-dark">Relatórios</span>
        </div>
        <span className="text-[13px] font-bold text-text-secondary bg-chip-bg py-[6px] px-[12px] rounded-chip">{new Date().getFullYear()}</span>
      </div>
      <div className="flex gap-[8px] px-[20px] mb-[14px]">
        {['Financeiro', 'Rebanho', 'Sanidade'].map(t => (
          <Chip key={t} active={tipo === t} onClick={() => setTipo(t)}>{t}</Chip>
        ))}
      </div>
      <div className="flex-1 overflow-auto px-[20px] pb-[8px]">
        <div className="bg-primary rounded-[16px] p-[16px] mb-[14px]">
          <div className="text-[12.5px] text-accent-light font-semibold">Resultado — {new Date().getFullYear()}</div>
          <div className="font-mono text-[30px] font-bold text-white">{res >= 0 ? '+' : ''}{fmtMoeda(res)}</div>
          <div className="text-[12px] text-accent-light font-semibold mt-[2px]">margem {rec ? `${Math.round((res / rec) * 100)}%` : '—'}</div>
        </div>
        <div className="flex flex-col gap-[9px]">
          {tipo === 'Financeiro' && porCategoria.map(c => (
            <div key={c.categoria} className="bg-white border border-[#eee9df] rounded-[12px] p-[12px_15px] flex justify-between">
              <span className="text-[14px] font-bold text-primary-dark">{c.categoria}</span>
              <span className="font-mono text-[14px] font-bold text-danger">−{fmtMoeda(parseFloat(c.total))}</span>
            </div>
          ))}
          {tipo === 'Rebanho' && <div className="text-center text-text-secondary text-[14px] py-[20px]">Ver no desktop para relatório completo</div>}
          {tipo === 'Sanidade' && <div className="text-center text-text-secondary text-[14px] py-[20px]">Ver no desktop para relatório completo</div>}
        </div>
      </div>
      <div className="px-[20px] py-[10px] pb-[24px]"><Button fullWidth onClick={() => window.print()}>Exportar PDF</Button></div>
    </div>
  )
}

// ── desktop ───────────────────────────────────────────────────────────────────

function DesktopRelatorios() {
  const [aba, setAba] = useState('Financeiro')
  const [periodo, setPeriodo] = useState('tudo')
  const params = useMemo(() => periodoToRange(periodo), [periodo])
  const periodoLabel = getPeriodoLabel(periodo).replace(/\s/g, '-').toLowerCase()

  const handleExportPDF = () => window.print()

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Relatórios</div>
          <div className="text-[13px] text-text-secondary font-medium">{aba} · {getPeriodoLabel(periodo)}</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <button onClick={handleExportPDF} className="flex items-center gap-[6px] bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer">
            <Download size={15} /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="flex items-center gap-[10px] px-[26px] py-[12px] bg-header-bg border-b border-border">
        <div className="flex gap-[6px]">
          {['Financeiro', 'Rebanho', 'Sanidade', 'GMD'].map(a => (
            <button
              key={a}
              onClick={() => setAba(a)}
              className={`py-[8px] px-[16px] rounded-chip text-[13.5px] font-bold border-none cursor-pointer transition-colors ${aba === a ? 'bg-primary text-white' : 'bg-white text-text-body border border-border hover:border-primary hover:text-primary'}`}
            >{a}</button>
          ))}
        </div>
        <div className="ml-auto">
          <select value={periodo} onChange={e => setPeriodo(e.target.value)} className={selectStyle} style={selectBg}>
            {buildPeriodos().map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[20px_26px] bg-header-bg">
        {aba === 'Financeiro' && <RelFinanceiro params={params} periodoLabel={periodoLabel} />}
        {aba === 'Rebanho' && <RelRebanho params={params} periodoLabel={periodoLabel} />}
        {aba === 'Sanidade' && <RelSanidade params={params} periodoLabel={periodoLabel} />}
        {aba === 'GMD' && <RelGMD params={params} periodoLabel={periodoLabel} />}
      </div>
    </>
  )
}

export default function RelatoriosPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopRelatorios /> : <MobileRelatorios />
}
