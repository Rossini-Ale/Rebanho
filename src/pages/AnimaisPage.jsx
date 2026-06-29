import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Chip from '../components/ui/Chip'
import { api } from '../lib/api'
import { calcularIdade } from '../lib/utils'
import { Search } from 'lucide-react'

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

function DesktopAnimais() {
  const [filtro, setFiltro] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const navigate = useNavigate()
  const porPagina = 8
  const { data: rawAnimais, loading } = useApi(() => api.animais.listar(), [])
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const animais = (rawAnimais || []).map(norm)
  const filtros = ['Todos', ...(lotes || []).map(l => l.nome), 'Fêmeas', 'Prenhes']

  const filtered = animais.filter(a => {
    if (busca && !a.brinco.includes(busca)) return false
    if (filtro === 'Fêmeas') return a.sexo === 'Fêmea'
    if (filtro === 'Machos') return a.sexo === 'Macho'
    if (filtro === 'Prenhes') return a.situacao === 'prenhe'
    if (filtro !== 'Todos' && a.lote !== filtro) return false
    return true
  })

  const totalPaginas = Math.max(1, Math.ceil(filtered.length / porPagina))
  const paginados = filtered.slice((pagina - 1) * porPagina, pagina * porPagina)

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark">Animais</div>
          <div className="text-[13px] text-text-secondary font-medium">{animais.length} cadastrados · {animais.filter(a => a.situacao === 'ativo').length} ativos</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <div className="flex items-center gap-[8px] bg-white border border-field-border rounded-sidebar-item py-[9px] px-[16px] w-[190px]">
            <Search size={14} className="text-text-secondary" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por brinco…"
              className="flex-1 border-none outline-none bg-transparent text-[13.5px] font-medium text-primary-dark placeholder:text-text-secondary"
            />
          </div>
          <button
            onClick={() => navigate('/animais/novo')}
            className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none"
          >
            + Novo animal
          </button>
        </div>
      </div>

      <div className="flex gap-[8px] px-[26px] py-[14px] pb-[10px] bg-header-bg">
        {filtros.map(f => (
          <Chip key={f} active={filtro === f} onClick={() => { setFiltro(f); setPagina(1) }}>{f}</Chip>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-[26px] pb-[20px] bg-header-bg">
        {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
        <div className="bg-white border border-border rounded-[14px] overflow-hidden">
          <div className="grid grid-cols-[90px_1.1fr_.8fr_.8fr_1fr_.9fr_1fr] px-[18px] py-[13px] text-[12px] font-bold text-text-secondary uppercase tracking-[.04em] border-b border-[#eee9df]">
            <span>Brinco</span><span>Raça</span><span>Sexo</span><span>Idade</span><span>Lote</span><span>Peso</span><span>Situação</span>
          </div>
          {paginados.map(a => (
            <button
              key={a.id}
              onClick={() => navigate(`/animais/${a.id}`)}
              className="grid grid-cols-[90px_1.1fr_.8fr_.8fr_1fr_.9fr_1fr] px-[18px] py-[14px] text-[14px] items-center border-b border-[#f0ede4] last:border-b-0 cursor-pointer w-full text-left bg-transparent hover:bg-[#faf9f5] transition-colors"
            >
              <span className="font-mono font-bold text-primary-dark">{a.brinco}</span>
              <span className="text-text-body font-medium">{a.raca}</span>
              <span className="text-text-body">{a.sexo}</span>
              <span className="text-text-body">{calcularIdade(a.nascimento)}</span>
              <span className="text-text-body">{a.lote}</span>
              <span className="font-mono font-semibold">{a.peso} kg</span>
              <span><SituacaoBadge situacao={a.situacao} /></span>
            </button>
          ))}
        </div>

        {!loading && (
          <div className="flex justify-between items-center pt-[14px] px-[4px] text-[13px] text-text-secondary font-semibold">
            <span>Mostrando {Math.min((pagina - 1) * porPagina + 1, filtered.length)}–{Math.min(pagina * porPagina, filtered.length)} de {filtered.length}</span>
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
        )}
      </div>
    </>
  )
}

export default function AnimaisPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopAnimais /> : <MobileAnimais />
}
