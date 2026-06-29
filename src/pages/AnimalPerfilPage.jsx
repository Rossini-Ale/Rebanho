import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Toast from '../components/ui/Toast'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import useToast from '../hooks/useToast'
import { api } from '../lib/api'
import { calcularIdade, fmtDataCurta, fmtMoeda, racas } from '../lib/utils'
import { ChevronLeft, Scale, ArrowRightLeft, LogOut, Pencil, ShieldCheck, Heart, Wallet, ArrowRight } from 'lucide-react'

const statusStyle = {
  parto_proximo: { label: 'Parto próximo', color: '#a9711f', bg: '#f6eed9' },
  confirmada: { label: 'Confirmada', color: '#588157', bg: '#e7ece4' },
  aguardando: { label: 'Aguardando', color: '#7c8378', bg: '#eceadf' },
  concluida: { label: 'Concluída', color: '#588157', bg: '#e7ece4' },
}

function MobilePerfil({ animal, eventos }) {
  const navigate = useNavigate()
  const idade = calcularIdade(animal.data_nascimento)
  const lote = animal.lote_nome || '—'

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-[20px] py-[8px] pt-[14px] pb-[12px]">
        <button onClick={() => navigate(-1)} className="text-[24px] text-primary font-bold bg-transparent border-none cursor-pointer p-0">
          <ChevronLeft size={24} />
        </button>
        <span className="text-[15px] font-bold text-primary-dark">Animal</span>
        <span className="w-[40px]" />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-[20px] relative rounded-card overflow-hidden" style={{ height: 170, background: 'repeating-linear-gradient(135deg,#e7e3d8,#e7e3d8 11px,#ddd8ca 11px,#ddd8ca 22px)' }}>
          <span className="absolute top-[12px] left-[14px] font-mono text-[11px] text-[#a39b86]">foto do animal</span>
          <div className="absolute bottom-[14px] left-[14px]">
            <span className="font-mono text-[32px] font-bold text-primary-dark bg-[rgba(245,244,239,0.85)] py-[4px] px-[12px] rounded-chip">{animal.brinco}</span>
          </div>
          <div className="absolute bottom-[14px] right-[14px]">
            <span className="text-[12.5px] font-extrabold text-white bg-primary-medium py-[5px] px-[12px] rounded-pill uppercase">{animal.situacao}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-[8px] px-[20px] pt-[16px] pb-[4px]">
          {[animal.raca, animal.sexo, idade, animal.origem === 'nascido_aqui' ? 'Nascida na fazenda' : 'Comprado'].map(c => (
            <span key={c} className="text-[13px] font-semibold text-primary bg-chip-bg py-[6px] px-[12px] rounded-chip">{c}</span>
          ))}
        </div>

        <div className="mx-[20px] my-[12px] p-[14px_16px] bg-white border border-border rounded-[14px] flex justify-between items-center">
          <div>
            <div className="text-[12.5px] text-text-secondary font-semibold">Lote atual</div>
            <div className="text-[16px] font-bold text-primary-dark">{lote}</div>
          </div>
          <span onClick={() => navigate(`/mover-lote?animal=${animal.id}`)} className="text-[13px] font-bold text-primary cursor-pointer">Mover ›</span>
        </div>

        <div className="flex flex-col gap-[10px] px-[20px] pb-[8px]">
          <Button fullWidth onClick={() => navigate(`/registrar-peso?animal=${animal.id}`)}>Registrar peso</Button>
          <div className="flex gap-[10px]">
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/sanidade/novo')}>Evento sanitário</Button>
            <Button variant="secondary" className="flex-1" onClick={() => navigate(`/mover-lote?animal=${animal.id}`)}>Mover de lote</Button>
          </div>
          <Button variant="outline" fullWidth onClick={() => navigate(`/registrar-saida?animal=${animal.id}`)}>Registrar saída</Button>
        </div>

        <div className="px-[20px] pt-[10px] pb-[4px] text-[13px] font-extrabold text-text-secondary uppercase tracking-[.04em]">Histórico</div>
        <div className="mx-[20px] mb-[8px] bg-white border border-border rounded-[14px] overflow-hidden">
          {eventos.map((ev, i) => (
            <div key={i} className={`flex justify-between p-[13px_16px] ${i < eventos.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
              <div>
                <div className="text-[14.5px] font-bold text-primary-dark">{ev.valor || ev.tipo}</div>
                <div className="text-[12.5px] text-text-secondary">{ev.detalhe}</div>
              </div>
            </div>
          ))}
          {eventos.length === 0 && <div className="p-[16px] text-center text-text-secondary text-[14px]">Nenhum evento registrado.</div>}
        </div>
      </div>
    </div>
  )
}

const tipoConfig = {
  pesagem: { label: 'Pesagem', icon: Scale, color: '#3a5a40', bg: '#e7ece4' },
  sanitario: { label: 'Sanidade', icon: ShieldCheck, color: '#588157', bg: '#e7ece4' },
  lote: { label: 'Movimentação', icon: ArrowRight, color: '#a9711f', bg: '#f6eed9' },
  reproducao: { label: 'Reprodução', icon: Heart, color: '#8b5cf6', bg: '#f0e7fb' },
  financeiro: { label: 'Financeiro', icon: Wallet, color: '#b54a2f', bg: '#fde8e4' },
}

function TabHistorico({ eventos, pesagens }) {
  const pontos = (pesagens || []).slice(0, 6).reverse()
  const pesos = pontos.map(p => parseFloat(p.peso_kg))
  const minP = pesos.length ? Math.min(...pesos) : 0
  const maxP = pesos.length ? Math.max(...pesos) : 1
  const range = maxP - minP || 1

  return (
    <>
      {pontos.length > 1 && (
        <div className="bg-white border border-border rounded-[14px] p-[18px] mb-[16px]">
          <div className="flex justify-between items-center mb-[14px]">
            <span className="text-[15px] font-extrabold text-primary-dark">Evolução de peso</span>
            <span className="text-[12px] text-text-secondary font-semibold">
              {fmtDataCurta(pontos[0]?.data)} – {fmtDataCurta(pontos[pontos.length - 1]?.data)}
            </span>
          </div>
          <svg viewBox="0 0 600 170" className="w-full h-[170px]">
            <line x1="36" y1="14" x2="36" y2="145" stroke="#e6e3da" />
            <line x1="36" y1="145" x2="590" y2="145" stroke="#e6e3da" />
            {(() => {
              const pts = pesos.map((p, i) => {
                const x = 36 + (i / (pesos.length - 1)) * 554
                const y = 140 - ((p - minP) / range) * 126 + 14
                return `${x},${y}`
              })
              return (
                <>
                  <polyline points={pts.join(' ')} fill="none" stroke="#3a5a40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {pts.map((pt, i) => {
                    const [cx, cy] = pt.split(',')
                    return <circle key={i} cx={cx} cy={cy} r={i === pts.length - 1 ? 5 : 3} fill={i === pts.length - 1 ? '#588157' : '#3a5a40'} />
                  })}
                </>
              )
            })()}
            <text x="36" y="162" fontFamily="Spline Sans Mono" fontSize="11" fill="#9aa295">{fmtDataCurta(pontos[0]?.data)}</text>
            <text x="530" y="162" fontFamily="Spline Sans Mono" fontSize="11" fill="#9aa295">{fmtDataCurta(pontos[pontos.length - 1]?.data)}</text>
          </svg>
        </div>
      )}

      <div className="bg-white border border-border rounded-[14px] p-[18px]">
        <div className="text-[15px] font-extrabold text-primary-dark mb-[16px]">Timeline</div>
        <div className="relative">
          {eventos.length > 1 && (
            <div className="absolute left-[17px] top-[28px] bottom-[28px] w-[2px] bg-[#eee9df]" />
          )}
          {eventos.map((ev, i) => {
            const cfg = tipoConfig[ev.tipo] || tipoConfig.pesagem
            const Icon = cfg.icon
            return (
              <div key={i} className="flex gap-[14px] items-start mb-[4px] last:mb-0">
                <div className="relative z-10 shrink-0 w-[34px] h-[34px] rounded-full flex items-center justify-center" style={{ background: cfg.bg }}>
                  <Icon size={16} color={cfg.color} />
                </div>
                <div className="flex-1 py-[6px]">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-[13.5px] font-bold text-primary-dark">{ev.valor || ev.tipo}</span>
                      <span className="text-[11.5px] font-bold ml-[8px] py-[2px] px-[7px] rounded-[10px]" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                    </div>
                    <span className="text-[12px] font-mono text-text-secondary shrink-0">{fmtDataCurta(ev.data)}</span>
                  </div>
                  {ev.detalhe && <div className="text-[12.5px] text-text-secondary mt-[2px]">{ev.detalhe}</div>}
                </div>
              </div>
            )
          })}
        </div>
        {eventos.length === 0 && <div className="py-[12px] text-center text-text-secondary text-[14px]">Nenhum evento registrado.</div>}
      </div>
    </>
  )
}

function TabCustos({ animalId }) {
  const { data, loading } = useApi(() => api.animais.custos(animalId), [animalId])
  const custos = data?.custos || []
  const total = data?.total || 0

  if (loading) return <div className="text-center text-text-secondary py-[20px]">Carregando…</div>

  return (
    <>
      <div className="bg-primary rounded-[14px] p-[18px] mb-[16px]">
        <div className="text-[13px] text-accent-light font-semibold">Custo acumulado</div>
        <div className="font-mono text-[28px] font-bold text-white leading-[1.1]">{fmtMoeda(total)}</div>
      </div>

      <div className="bg-white border border-border rounded-[14px] p-[18px]">
        <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Lançamentos</div>
        {custos.map((c, i) => (
          <div key={c.id} className={`flex justify-between items-center py-[12px] ${i < custos.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
            <div>
              <div className="text-[14px] font-bold text-primary-dark">{c.descricao || c.categoria}</div>
              <div className="text-[12px] text-text-secondary">{c.categoria} · {fmtDataCurta(c.data)}</div>
            </div>
            <span className="font-mono text-[13.5px] font-bold text-danger">−{fmtMoeda(c.valor)}</span>
          </div>
        ))}
        {custos.length === 0 && <div className="py-[12px] text-center text-text-secondary text-[14px]">Nenhum custo registrado para este animal.</div>}
      </div>
    </>
  )
}

function TabReproducao({ animalId }) {
  const { data, loading } = useApi(() => api.animais.reproducao(animalId), [animalId])
  const coberturas = data?.coberturas || []
  const totalCrias = data?.total_crias || 0

  if (loading) return <div className="text-center text-text-secondary py-[20px]">Carregando…</div>

  return (
    <>
      <div className="grid grid-cols-2 gap-[14px] mb-[16px]">
        <div className="bg-white border border-border rounded-[14px] p-[16px]">
          <div className="text-[12px] text-text-secondary font-bold uppercase tracking-[.04em]">Coberturas</div>
          <div className="font-mono text-[24px] font-bold text-primary-dark mt-[4px]">{coberturas.length}</div>
        </div>
        <div className="bg-white border border-border rounded-[14px] p-[16px]">
          <div className="text-[12px] text-text-secondary font-bold uppercase tracking-[.04em]">Crias</div>
          <div className="font-mono text-[24px] font-bold text-primary-dark mt-[4px]">{totalCrias}</div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-[14px] p-[18px]">
        <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Coberturas</div>
        {coberturas.map((c, i) => {
          const s = statusStyle[c.status] || statusStyle.aguardando
          return (
            <div key={c.id} className={`flex justify-between items-center py-[12px] ${i < coberturas.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
              <div>
                <div className="text-[14px] font-bold text-primary-dark">{c.metodo}</div>
                <div className="text-[12px] text-text-secondary">
                  Cobertura {fmtDataCurta(c.data_cobertura)}
                  {c.data_prevista_parto && ` · Parto prev. ${fmtDataCurta(c.data_prevista_parto)}`}
                </div>
              </div>
              <span className="text-[11.5px] font-bold py-[3px] px-[9px] rounded-[14px]" style={{ color: s.color, background: s.bg }}>{s.label}</span>
            </div>
          )
        })}
        {coberturas.length === 0 && <div className="py-[12px] text-center text-text-secondary text-[14px]">Nenhuma cobertura registrada.</div>}
      </div>
    </>
  )
}

function DesktopPerfil({ animal, eventos, pesagens, reload }) {
  const navigate = useNavigate()
  const [abaAtiva, setAbaAtiva] = useState('Histórico')
  const { toast, showToast, hideToast } = useToast()
  const idade = calcularIdade(animal.data_nascimento)
  const lote = animal.lote_nome || '—'
  const peso = animal.peso_atual ? parseFloat(animal.peso_atual) : '—'

  // Edit modal state
  const [editando, setEditando] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [salvandoEdit, setSalvandoEdit] = useState(false)
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const { data: racasConfig } = useApi(() => api.configuracoes.buscar('racas').catch(() => null), [])
  const racasList = racasConfig?.valor || racas

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false)

  const abrirEdicao = () => {
    setEditForm({
      brinco: animal.brinco,
      sexo: animal.sexo === 'Fêmea' ? 'femea' : 'macho',
      raca: animal.raca,
      nascimento: animal.data_nascimento ? animal.data_nascimento.slice(0, 10) : '',
      origem: animal.origem,
      lote_id: animal.lote_id ? String(animal.lote_id) : '',
      situacao: animal.situacao,
      sisbov: animal.sisbov || '',
    })
    setEditando(true)
  }

  const handleEditSave = async () => {
    setSalvandoEdit(true)
    try {
      await api.animais.atualizar(animal.id, {
        brinco: editForm.brinco,
        sexo: editForm.sexo === 'femea' ? 'Fêmea' : 'Macho',
        raca: editForm.raca,
        data_nascimento: editForm.nascimento,
        origem: editForm.origem,
        lote_id: editForm.lote_id || null,
        situacao: editForm.situacao,
        sisbov: editForm.sisbov,
      })
      showToast('Animal atualizado com sucesso!')
      setEditando(false)
      reload()
    } catch (err) {
      showToast(err.message || 'Erro ao salvar', 'error')
    } finally { setSalvandoEdit(false) }
  }

  const updateEdit = (field, value) => setEditForm(f => ({ ...f, [field]: value }))

  const info = [
    { label: 'Brinco', value: animal.brinco, mono: true },
    { label: 'Raça', value: animal.raca },
    { label: 'Sexo', value: animal.sexo },
    { label: 'Idade', value: idade, mono: true },
    { label: 'Lote', value: lote, mono: true },
    { label: 'Origem', value: animal.origem === 'nascido_aqui' ? 'Nascida aqui' : 'Comprado' },
    { label: 'Peso atual', value: `${peso} kg`, mono: true },
  ]

  const abas = ['Histórico', 'Custos']
  if (animal.sexo === 'Fêmea') abas.push('Reprodução')

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Animal {animal.brinco}</div>
          <div className="text-[13px] text-text-secondary font-medium">
            {animal.raca} · {animal.sexo} · {idade} · {animal.origem === 'nascido_aqui' ? 'nascida na fazenda' : 'comprado'}
          </div>
        </div>
        <div className="flex gap-[10px] items-center">
          <Button variant="secondary" onClick={abrirEdicao}>
            <span className="flex items-center gap-[6px]"><Pencil size={14} /> Editar</span>
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/mover-lote?animal=${animal.id}`)}>Mover de lote</Button>
          <button onClick={() => navigate(`/registrar-peso?animal=${animal.id}`)} className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none">Registrar peso</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-header-bg">
        <div className="flex items-center gap-[6px] px-[26px] pt-[16px] pb-[4px] text-[13px]">
          <span onClick={() => navigate('/animais')} className="text-primary font-semibold cursor-pointer hover:underline">Animais</span>
          <span className="text-text-secondary">›</span>
          <span className="text-primary-dark font-bold">#{animal.brinco}</span>
        </div>
        <div className="grid grid-cols-[290px_1fr] gap-[18px] p-[10px_26px_22px_26px]">
          <div className="flex flex-col gap-[14px]">
            <div className="relative rounded-[14px] overflow-hidden" style={{ height: 185 }}>
              <div className="w-full h-full flex items-end justify-end p-[12px]" style={{ background: 'repeating-linear-gradient(135deg,#e7e3d8,#e7e3d8 10px,#ddd8ca 10px,#ddd8ca 20px)' }}>
                <span className="absolute top-[12px] left-[12px] font-mono text-[11px] text-[#a39b86]">foto do animal</span>
                <span className="text-[11.5px] font-extrabold text-white bg-primary-medium py-[5px] px-[11px] rounded-pill uppercase">{animal.situacao}</span>
              </div>
            </div>
            <div className="bg-white border border-border rounded-[14px] p-[16px]">
              {info.map((item, i) => (
                <div key={item.label} className={`flex justify-between py-[10px] ${i < info.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
                  <span className="text-[13px] text-text-secondary font-semibold">{item.label}</span>
                  <span className={`text-[13.5px] font-bold text-primary-dark ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-[8px] mt-[14px]">
              <button onClick={() => navigate(`/registrar-peso?animal=${animal.id}`)} className="flex items-center gap-[6px] bg-white border border-field-border rounded-sidebar-item py-[8px] px-[14px] text-[13px] font-semibold text-primary-dark cursor-pointer hover:bg-chip-bg transition-colors">
                <Scale size={15} /> Registrar peso
              </button>
              <button onClick={() => navigate(`/mover-lote?animal=${animal.id}`)} className="flex items-center gap-[6px] bg-white border border-field-border rounded-sidebar-item py-[8px] px-[14px] text-[13px] font-semibold text-primary-dark cursor-pointer hover:bg-chip-bg transition-colors">
                <ArrowRightLeft size={15} /> Mover lote
              </button>
              <button onClick={() => navigate(`/registrar-saida?animal=${animal.id}`)} className="flex items-center gap-[6px] bg-white border border-field-border rounded-sidebar-item py-[8px] px-[14px] text-[13px] font-semibold text-primary-dark cursor-pointer hover:bg-chip-bg transition-colors">
                <LogOut size={15} /> Registrar saída
              </button>
            </div>

            <button onClick={() => setConfirmDelete(true)} className="text-[13px] font-semibold text-danger cursor-pointer bg-transparent border-none hover:underline mt-[4px] text-left">
              Excluir animal
            </button>
          </div>

          <div>
            <div className="flex bg-segmented-bg rounded-sidebar-item p-[4px] mb-[16px] w-fit">
              {abas.map(aba => (
                <button
                  key={aba}
                  onClick={() => setAbaAtiva(aba)}
                  className={`py-[9px] px-[18px] text-[13.5px] font-bold rounded-[8px] border-none cursor-pointer transition-colors ${
                    abaAtiva === aba ? 'bg-primary text-white' : 'text-text-secondary bg-transparent'
                  }`}
                >
                  {aba}
                </button>
              ))}
            </div>

            {abaAtiva === 'Histórico' && <TabHistorico eventos={eventos} pesagens={pesagens} />}
            {abaAtiva === 'Custos' && <TabCustos animalId={animal.id} />}
            {abaAtiva === 'Reprodução' && <TabReproducao animalId={animal.id} />}
          </div>
        </div>
      </div>

      {editando && editForm && (
        <Modal
          title="Editar animal"
          subtitle={`Brinco #${animal.brinco}`}
          width={520}
          onClose={() => setEditando(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditando(false)}>Cancelar</Button>
              <Button onClick={handleEditSave} disabled={salvandoEdit}>
                {salvandoEdit ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </>
          }
        >
          <Input
            label="Brinco"
            value={editForm.brinco}
            onChange={e => updateEdit('brinco', e.target.value)}
            mono
            className="mb-[16px]"
          />

          <div className="flex gap-[14px] mb-[16px]">
            <Select
              label="Sexo"
              value={editForm.sexo}
              onChange={e => updateEdit('sexo', e.target.value)}
              options={[{ value: 'femea', label: 'Fêmea' }, { value: 'macho', label: 'Macho' }]}
              className="flex-1"
            />
            <Select
              label="Raça"
              value={editForm.raca}
              onChange={e => updateEdit('raca', e.target.value)}
              options={racasList.map(r => ({ value: r, label: r }))}
              className="flex-1"
            />
          </div>

          <div className="flex gap-[14px] mb-[16px]">
            <Input
              label="Nascimento"
              type="date"
              value={editForm.nascimento}
              onChange={e => updateEdit('nascimento', e.target.value)}
              className="flex-1"
            />
            <Select
              label="Origem"
              value={editForm.origem}
              onChange={e => updateEdit('origem', e.target.value)}
              options={[{ value: 'nascido_aqui', label: 'Nascido aqui' }, { value: 'comprado', label: 'Comprado' }]}
              className="flex-1"
            />
          </div>

          <Select
            label="Lote"
            value={editForm.lote_id}
            onChange={e => updateEdit('lote_id', e.target.value)}
            options={[{ value: '', label: 'Sem lote' }, ...(lotes || []).map(l => ({ value: String(l.id), label: l.nome }))]}
            className="mb-[16px]"
          />

          <Select
            label="Situação"
            value={editForm.situacao}
            onChange={e => updateEdit('situacao', e.target.value)}
            options={[
              { value: 'ativo', label: 'Ativo' },
              { value: 'vendido', label: 'Vendido' },
              { value: 'morto', label: 'Morto' },
              { value: 'quarentena', label: 'Quarentena' },
              { value: 'prenhe', label: 'Prenhe' },
            ]}
            className="mb-[16px]"
          />

          <Input
            label="SISBOV"
            value={editForm.sisbov}
            onChange={e => updateEdit('sisbov', e.target.value)}
            placeholder="Código SISBOV (opcional)"
            className="mb-[4px]"
          />
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir animal"
          message={`Tem certeza que deseja excluir o animal #${animal.brinco}? Todos os dados (pesagens, eventos, custos) serão removidos permanentemente.`}
          confirmLabel="Excluir"
          onConfirm={async () => {
            await api.animais.excluir(animal.id)
            navigate('/animais')
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}

export default function AnimalPerfilPage() {
  const { id } = useParams()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { data: animal, loading: loadingAnimal, reload } = useApi(() => api.animais.buscar(id), [id])
  const { data: eventos } = useApi(() => api.animais.historico(id), [id])
  const { data: pesagens } = useApi(() => api.animais.pesagens(id), [id])

  if (loadingAnimal) return <div className="flex-1 flex items-center justify-center text-text-secondary">Carregando…</div>
  if (!animal) return <div className="flex-1 flex items-center justify-center text-text-secondary">Animal não encontrado.</div>

  return isDesktop
    ? <DesktopPerfil animal={animal} eventos={eventos || []} pesagens={pesagens || []} reload={reload} />
    : <MobilePerfil animal={animal} eventos={eventos || []} />
}
