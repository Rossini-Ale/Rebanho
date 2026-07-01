import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Chip from '../components/ui/Chip'
import { api } from '../lib/api'
import { calcularIdade } from '../lib/utils'
import { Search, Beef, Scale, ArrowRightLeft, ChevronUp, ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonTable } from '../components/ui/Skeleton'

function idadeEmMeses(nascimento) {
  if (!nascimento) return null
  const d = new Date(nascimento)
  const hoje = new Date()
  return (hoje.getFullYear() - d.getFullYear()) * 12 + (hoje.getMonth() - d.getMonth())
}

const FAIXAS_IDADE = [
  { value: '', label: 'Qualquer idade' },
  { value: '0-6', label: 'Até 6 meses' },
  { value: '6-12', label: '6 a 12 meses' },
  { value: '12-24', label: '1 a 2 anos' },
  { value: '24-48', label: '2 a 4 anos' },
  { value: '48+', label: 'Mais de 4 anos' },
]

const SITUACOES = [
  { value: '', label: 'Qualquer situação' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'prenhe', label: 'Prenhe' },
  { value: 'quarentena', label: 'Quarentena' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'morto', label: 'Morto' },
]

const selectFiltro = "appearance-none bg-white border-[1.5px] border-field-border rounded-[10px] py-[8px] px-[12px] pr-[28px] text-[13px] font-semibold text-primary-dark outline-none cursor-pointer focus:border-primary"
const selectBgArrow = { backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%237c8378\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }

const situacaoStyle = {
  ativo: { color: '#588157', bg: '#e7ece4' },
  prenhe: { color: '#a9711f', bg: '#f6eed9' },
  quarentena: { color: '#b54a2f', bg: '#f6e7e1' },
  vendido: { color: '#7c8378', bg: '#eceadf' },
  morto: { color: '#7c8378', bg: '#eceadf' },
}

function SituacaoBadge({ situacao }) {
  const s = situacaoStyle[situacao] || situacaoStyle.ativo
  const label = situacao.charAt(0).toUpperCase() + situacao.slice(1)
  return (
    <span
      className="text-[12px] font-bold py-[4px] px-[10px] rounded-[14px]"
      style={{ color: s.color, background: s.bg }}
    >
      {label}
    </span>
  )
}

function AnimalThumb() {
  return (
    <span
      className="shrink-0 rounded-[11px]"
      style={{
        width: 42, height: 42,
        background: 'repeating-linear-gradient(135deg,#e7e3d8,#e7e3d8 6px,#ddd8ca 6px,#ddd8ca 12px)',
      }}
    />
  )
}

function norm(a) {
  return {
    ...a,
    peso: a.peso_atual ? parseFloat(a.peso_atual) : a.peso,
    lote: a.lote_nome || a.lote,
    nascimento: a.data_nascimento,
  }
}

function MobileAnimais() {
  const [filtro, setFiltro] = useState('Todos')
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()
  const { data: rawAnimais, loading } = useApi(() => api.animais.listar(), [])
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const animais = (rawAnimais || []).map(norm)
  const filtros = ['Todos', ...(lotes || []).map(l => l.nome), 'Fêmeas', 'Machos']

  const filtered = animais.filter(a => {
    if (busca && !a.brinco.includes(busca)) return false
    if (filtro === 'Fêmeas') return a.sexo === 'Fêmea'
    if (filtro === 'Machos') return a.sexo === 'Macho'
    if (filtro !== 'Todos' && a.lote !== filtro) return false
    return true
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-baseline px-[22px] pt-[8px] pb-[10px]">
        <span className="text-[21px] font-extrabold text-primary-dark">Animais</span>
        <span className="text-[14px] font-semibold text-text-secondary">
          <span className="font-mono text-primary font-bold">{animais.length}</span> total
        </span>
      </div>

      <div className="mx-[22px] mb-[12px] flex items-center gap-[12px] bg-white border border-border rounded-button py-[12px] px-[16px] shadow-card">
        <Search size={16} className="text-text-secondary shrink-0" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por brinco…"
          className="flex-1 border-none outline-none bg-transparent text-[14.5px] font-medium text-primary-dark placeholder:text-text-secondary"
        />
      </div>

      <div className="flex gap-[8px] px-[22px] pb-[12px] overflow-x-auto">
        {filtros.map(f => (
          <Chip key={f} active={filtro === f} onClick={() => setFiltro(f)}>{f}</Chip>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[8px] flex flex-col gap-[9px]">
        {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
        {filtered.map(a => (
          <button
            key={a.id}
            onClick={() => navigate(`/animais/${a.id}`)}
            className="flex items-center gap-[13px] bg-white border border-[#eee9df] rounded-[14px] py-[12px] px-[14px] cursor-pointer w-full text-left"
          >
            <AnimalThumb />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[17px] font-bold text-primary-dark">{a.brinco}</div>
              <div className="text-[12.5px] text-text-secondary font-medium">{a.raca} · {a.sexo} · {calcularIdade(a.nascimento)}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-[14px] font-bold text-primary-dark">{a.peso}kg</div>
              <div className="text-[11.5px] font-bold" style={{ color: situacaoStyle[a.situacao]?.color || '#588157' }}>
                {a.situacao === 'ativo' ? a.lote : a.situacao.charAt(0).toUpperCase() + a.situacao.slice(1)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function SortHeader({ label, col, sortCol, sortDir, onSort }) {
  const active = sortCol === col
  return (
    <span onClick={() => onSort(col)} className="cursor-pointer select-none flex items-center gap-[4px] hover:text-primary-dark transition-colors">
      {label}
      {active && (sortDir === 'asc'
        ? <ChevronUp size={12} className="text-primary" />
        : <ChevronDown size={12} className="text-primary" />
      )}
    </span>
  )
}

function DesktopAnimais() {
  const [filtro, setFiltro] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [pesoMin, setPesoMin] = useState('')
  const [pesoMax, setPesoMax] = useState('')
  const [filtroIdade, setFiltroIdade] = useState('')
  const [filtroSituacao, setFiltroSituacao] = useState('')
  const navigate = useNavigate()
  const porPagina = 15
  const { data: rawAnimais, loading } = useApi(() => api.animais.listar(), [])
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const animais = (rawAnimais || []).map(norm)
  const filtros = ['Todos', ...(lotes || []).map(l => l.nome), 'Fêmeas', 'Prenhes']

  const filtrosAtivos = [pesoMin, pesoMax, filtroIdade, filtroSituacao].filter(Boolean).length
  const limparFiltros = () => { setPesoMin(''); setPesoMax(''); setFiltroIdade(''); setFiltroSituacao('') }

  const toggleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const filtered = animais.filter(a => {
    if (busca) {
      const b = busca.toLowerCase()
      if (!a.brinco.toLowerCase().includes(b) && !(a.raca || '').toLowerCase().includes(b) && !(a.lote || '').toLowerCase().includes(b)) return false
    }
    if (filtro === 'Fêmeas') { if (a.sexo !== 'Fêmea') return false }
    else if (filtro === 'Machos') { if (a.sexo !== 'Macho') return false }
    else if (filtro === 'Prenhes') { if (a.situacao !== 'prenhe') return false }
    else if (filtro !== 'Todos') { if (a.lote !== filtro) return false }

    if (pesoMin && (a.peso || 0) < parseFloat(pesoMin)) return false
    if (pesoMax && (a.peso || 0) > parseFloat(pesoMax)) return false

    if (filtroSituacao && a.situacao !== filtroSituacao) return false

    if (filtroIdade) {
      const m = idadeEmMeses(a.nascimento)
      if (m === null) return false
      if (filtroIdade === '0-6' && m > 6) return false
      if (filtroIdade === '6-12' && (m <= 6 || m > 12)) return false
      if (filtroIdade === '12-24' && (m <= 12 || m > 24)) return false
      if (filtroIdade === '24-48' && (m <= 24 || m > 48)) return false
      if (filtroIdade === '48+' && m <= 48) return false
    }

    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (!sortCol) return 0
    let va, vb
    switch (sortCol) {
      case 'brinco': va = a.brinco; vb = b.brinco; break
      case 'raca': va = a.raca || ''; vb = b.raca || ''; break
      case 'sexo': va = a.sexo || ''; vb = b.sexo || ''; break
      case 'idade': va = a.nascimento || ''; vb = b.nascimento || ''; break
      case 'lote': va = a.lote || ''; vb = b.lote || ''; break
      case 'peso': va = a.peso || 0; vb = b.peso || 0; return sortDir === 'asc' ? va - vb : vb - va
      case 'situacao': va = a.situacao || ''; vb = b.situacao || ''; break
      default: return 0
    }
    if (typeof va === 'string') {
      const cmp = va.localeCompare(vb)
      return sortDir === 'asc' ? cmp : -cmp
    }
    return sortDir === 'asc' ? va - vb : vb - va
  })

  const totalPaginas = Math.max(1, Math.ceil(sorted.length / porPagina))
  const paginados = sorted.slice((pagina - 1) * porPagina, pagina * porPagina)

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark">Animais</div>
          <div className="text-[13px] text-text-secondary font-medium">{animais.length} cadastrados · {animais.filter(a => a.situacao === 'ativo').length} ativos</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <div className="flex items-center gap-[8px] bg-white border border-field-border rounded-sidebar-item py-[9px] px-[16px] w-[260px]">
            <Search size={14} className="text-text-secondary" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por brinco, raça ou lote…"
              className="flex-1 border-none outline-none bg-transparent text-[13.5px] font-medium text-primary-dark placeholder:text-text-secondary"
            />
          </div>
          <button
            onClick={() => setFiltrosOpen(o => !o)}
            className={`relative flex items-center gap-[6px] rounded-sidebar-item py-[9px] px-[14px] text-[13.5px] font-bold cursor-pointer border transition-colors ${filtrosOpen || filtrosAtivos > 0 ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-[#cfd4c7] hover:border-primary'}`}
          >
            <SlidersHorizontal size={14} />
            Filtros
            {filtrosAtivos > 0 && (
              <span className="w-[16px] h-[16px] rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center leading-none">{filtrosAtivos}</span>
            )}
          </button>
          <button
            onClick={() => navigate('/animais/novo')}
            className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none"
          >
            + Novo animal
          </button>
        </div>
      </div>

      {filtrosOpen && (
        <div className="px-[26px] py-[12px] bg-white border-b border-border flex items-end gap-[16px]">
          <div>
            <div className="text-[11px] font-bold text-text-secondary uppercase tracking-[.04em] mb-[6px]">Peso mínimo (kg)</div>
            <input value={pesoMin} onChange={e => { setPesoMin(e.target.value); setPagina(1) }} placeholder="0" className={selectFiltro} style={{ ...selectBgArrow, backgroundImage: 'none', width: 100 }} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-text-secondary uppercase tracking-[.04em] mb-[6px]">Peso máximo (kg)</div>
            <input value={pesoMax} onChange={e => { setPesoMax(e.target.value); setPagina(1) }} placeholder="∞" className={selectFiltro} style={{ backgroundImage: 'none', width: 100 }} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-text-secondary uppercase tracking-[.04em] mb-[6px]">Faixa de idade</div>
            <select value={filtroIdade} onChange={e => { setFiltroIdade(e.target.value); setPagina(1) }} className={selectFiltro} style={selectBgArrow}>
              {FAIXAS_IDADE.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[11px] font-bold text-text-secondary uppercase tracking-[.04em] mb-[6px]">Situação</div>
            <select value={filtroSituacao} onChange={e => { setFiltroSituacao(e.target.value); setPagina(1) }} className={selectFiltro} style={selectBgArrow}>
              {SITUACOES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {filtrosAtivos > 0 && (
            <button onClick={() => { limparFiltros(); setPagina(1) }} className="flex items-center gap-[5px] text-[13px] font-bold text-danger bg-transparent border-none cursor-pointer mb-[2px]">
              <X size={13} /> Limpar
            </button>
          )}
          <div className="ml-auto text-[13px] text-text-secondary font-semibold mb-[2px]">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</div>
        </div>
      )}

      <div className="flex gap-[8px] px-[26px] py-[12px] pb-[8px] bg-header-bg">
        {filtros.map(f => (
          <Chip key={f} active={filtro === f} onClick={() => { setFiltro(f); setPagina(1) }}>{f}</Chip>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-[26px] pb-[20px] bg-header-bg">
        {loading && <SkeletonTable rows={8} cols={7} />}
        {!loading && animais.length === 0 && (
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <EmptyState icon={Beef} title="Nenhum animal cadastrado" description="Comece cadastrando seu primeiro animal para acompanhar o rebanho." actionLabel="Cadastrar animal" onAction={() => navigate('/animais/novo')} />
          </div>
        )}
        {!loading && animais.length > 0 && (
          <>
            <div className="bg-white border border-border rounded-[14px] overflow-hidden">
              <div className="grid grid-cols-[90px_1.1fr_.8fr_.8fr_1fr_.9fr_1fr] px-[18px] py-[13px] text-[12px] font-bold text-text-secondary uppercase tracking-[.04em] border-b border-[#eee9df]">
                <SortHeader label="Brinco" col="brinco" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader label="Raça" col="raca" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader label="Sexo" col="sexo" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader label="Idade" col="idade" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader label="Lote" col="lote" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader label="Peso" col="peso" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader label="Situação" col="situacao" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
              </div>
              {paginados.map(a => (
                <button
                  key={a.id}
                  onClick={() => navigate(`/animais/${a.id}`)}
                  className="group grid grid-cols-[90px_1.1fr_.8fr_.8fr_1fr_.9fr_1fr] px-[18px] py-[14px] text-[14px] items-center border-b border-[#f0ede4] last:border-b-0 cursor-pointer w-full text-left bg-transparent hover:bg-[#f5f3ec] transition-colors relative"
                >
                  <span className="font-mono font-bold text-primary-dark">{a.brinco}</span>
                  <span className="text-text-body font-medium">{a.raca}</span>
                  <span className="text-text-body">{a.sexo}</span>
                  <span className="text-text-body">{calcularIdade(a.nascimento)}</span>
                  <span className="text-text-body">{a.lote}</span>
                  <span className="font-mono font-semibold">{a.peso} kg</span>
                  <span><SituacaoBadge situacao={a.situacao} /></span>
                  <span className="absolute right-[18px] top-1/2 -translate-y-1/2 flex gap-[6px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span onClick={(e) => { e.stopPropagation(); navigate(`/registrar-peso?animal=${a.id}`) }} className="w-[30px] h-[30px] rounded-[8px] bg-white border border-field-border flex items-center justify-center hover:bg-chip-bg transition-colors" title="Registrar peso">
                      <Scale size={14} className="text-primary-dark" />
                    </span>
                    <span onClick={(e) => { e.stopPropagation(); navigate(`/mover-lote?animal=${a.id}`) }} className="w-[30px] h-[30px] rounded-[8px] bg-white border border-field-border flex items-center justify-center hover:bg-chip-bg transition-colors" title="Mover lote">
                      <ArrowRightLeft size={14} className="text-primary-dark" />
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center pt-[14px] px-[4px] text-[13px] text-text-secondary font-semibold">
              <span>Mostrando {Math.min((pagina - 1) * porPagina + 1, sorted.length)}–{Math.min(pagina * porPagina, sorted.length)} de {sorted.length}</span>
              <div className="flex gap-[6px]">
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="bg-white border border-field-border rounded-[8px] py-[6px] px-[11px] cursor-pointer disabled:opacity-40"
                >‹</button>
                {Array.from({ length: totalPaginas }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPagina(i + 1)}
                    className={`rounded-[8px] py-[6px] px-[11px] cursor-pointer border ${
                      pagina === i + 1
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-field-border'
                    }`}
                  >{i + 1}</button>
                ))}
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="bg-white border border-field-border rounded-[8px] py-[6px] px-[11px] cursor-pointer disabled:opacity-40"
                >›</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default function AnimaisPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopAnimais /> : <MobileAnimais />
}
