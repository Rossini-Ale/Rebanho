import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import KPITile from '../components/ui/KPITile'
import Chip from '../components/ui/Chip'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Toast from '../components/ui/Toast'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import useToast from '../hooks/useToast'
import { api } from '../lib/api'
import { fmtDataCurta, produtosSanitarios } from '../lib/utils'
import { ChevronLeft, ShieldCheck, Pencil, Trash2 } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'

const urgenciaColors = { vencido: '#b54a2f', proximo: '#c9882a', agendado: '#588157' }

function classifyEvent(ev) {
  if (!ev.data_proxima_dose) return 'agendado'
  const diff = (new Date(ev.data_proxima_dose) - new Date()) / 86400000
  if (diff < 0) return 'vencido'
  if (diff <= 7) return 'proximo'
  return 'agendado'
}

function statusText(ev, urg) {
  if (!ev.data_proxima_dose) return fmtDataCurta(ev.data)
  const d = new Date(ev.data_proxima_dose)
  const diff = Math.round((d - new Date()) / 86400000)
  if (urg === 'vencido') return `Atrasado há ${Math.abs(diff)} dias`
  return `${fmtDataCurta(ev.data_proxima_dose)} · em ${diff} dias`
}

function MobileSanidade() {
  const [aba, setAba] = useState('proximas')
  const navigate = useNavigate()
  const { data: eventos, loading } = useApi(() => api.sanidade.listar(), [])

  const all = (eventos || []).map(ev => ({ ...ev, urgencia: classifyEvent(ev) }))
  const proximas = all.filter(e => e.data_proxima_dose)
  const historico = all.filter(e => !e.data_proxima_dose || new Date(e.data_proxima_dose) < new Date(e.data))

  const vencidos = proximas.filter(e => e.urgencia === 'vencido')
  const prox = proximas.filter(e => e.urgencia !== 'vencido')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[14px] px-[20px] pt-[8px] pb-[12px]">
        <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
        <span className="text-[19px] font-extrabold text-primary-dark">Sanidade</span>
      </div>

      <div className="flex bg-segmented-bg rounded-[13px] p-[4px] mx-[22px] mb-[14px]">
        {['proximas', 'historico'].map(a => (
          <button key={a} onClick={() => setAba(a)} className={`flex-1 text-center py-[9px] text-[14px] font-bold rounded-chip cursor-pointer border-none ${aba === a ? 'bg-primary text-white' : 'text-text-secondary bg-transparent'}`}>
            {a === 'proximas' ? 'Próximas' : 'Histórico'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[8px] flex flex-col gap-[11px]">
        {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
        {aba === 'proximas' ? (
          <>
            {vencidos.length > 0 && <div className="text-[12.5px] font-extrabold text-danger uppercase tracking-[.04em]">Vencido</div>}
            {vencidos.map(ev => (
              <div key={ev.id} className="bg-white border border-[#eee9df] rounded-[14px] py-[14px] px-[16px]" style={{ borderLeft: '4px solid #b54a2f' }}>
                <div className="text-[15px] font-bold text-primary-dark">{ev.produto}</div>
                <div className="text-[13px] text-text-secondary font-medium mt-[2px]">{ev.lote_nome ? `Lote ${ev.lote_nome}` : 'Individual'} · {ev.qtd_animais || 1} animais</div>
                <div className="text-[12.5px] font-bold text-danger mt-[5px]">{statusText(ev, 'vencido')}</div>
              </div>
            ))}
            {prox.length > 0 && <div className="text-[12.5px] font-extrabold text-text-secondary uppercase tracking-[.04em] mt-[4px]">Próximos 7 dias</div>}
            {prox.map(ev => (
              <div key={ev.id} className="bg-white border border-[#eee9df] rounded-[14px] py-[14px] px-[16px]" style={{ borderLeft: `4px solid ${urgenciaColors[ev.urgencia]}` }}>
                <div className="text-[15px] font-bold text-primary-dark">{ev.produto}</div>
                <div className="text-[13px] text-text-secondary font-medium mt-[2px]">{ev.lote_nome ? `Lote ${ev.lote_nome}` : 'Individual'} · {ev.qtd_animais || 1} animais</div>
                <div className="text-[12.5px] font-bold mt-[5px]" style={{ color: urgenciaColors[ev.urgencia] }}>{statusText(ev, ev.urgencia)}</div>
              </div>
            ))}
          </>
        ) : (
          all.map(ev => (
            <div key={ev.id} className="bg-white border border-[#eee9df] rounded-[14px] py-[14px] px-[16px]" style={{ borderLeft: '4px solid #588157' }}>
              <div className="text-[15px] font-bold text-primary-dark">{ev.produto}</div>
              <div className="text-[13px] text-text-secondary font-medium mt-[2px]">{ev.lote_nome ? `Lote ${ev.lote_nome}` : 'Individual'}</div>
              <div className="text-[12.5px] font-bold text-primary-medium mt-[5px]">{fmtDataCurta(ev.data)}</div>
            </div>
          ))
        )}
      </div>

      <div className="px-[22px] py-[10px] pb-[24px]">
        <Button fullWidth onClick={() => navigate('/sanidade/novo')}>+ Registrar evento</Button>
      </div>
    </div>
  )
}

function DesktopSanidade() {
  const [aba, setAba] = useState('proximas')
  const navigate = useNavigate()
  const { data: eventos, reload } = useApi(() => api.sanidade.listar(), [])
  const { data: produtosConfig } = useApi(() => api.configuracoes.buscar('produtos_sanitarios').catch(() => null), [])
  const produtos = produtosConfig?.valor || produtosSanitarios
  const { toast, showToast, hideToast } = useToast()
  const all = (eventos || []).map(ev => ({ ...ev, urgencia: classifyEvent(ev) }))
  const vencidas = all.filter(e => e.urgencia === 'vencido').length
  const prox7 = all.filter(e => e.urgencia === 'proximo').length

  const [editando, setEditando] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [salvandoEdit, setSalvandoEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const abrirEdicao = (ev) => {
    setEditForm({
      tipo: ev.tipo || 'vacina',
      produto: ev.produto || '',
      dose: ev.dose || '',
      data: ev.data ? ev.data.slice(0, 10) : '',
      responsavel: ev.responsavel || '',
      custo: ev.custo ? String(ev.custo) : '',
    })
    setEditando(ev)
  }

  const handleEditSave = async () => {
    setSalvandoEdit(true)
    try {
      await api.sanidade.atualizar(editando.id, {
        tipo: editForm.tipo,
        produto: editForm.produto,
        dose: editForm.dose,
        data: editForm.data,
        responsavel: editForm.responsavel,
        custo: editForm.custo ? parseFloat(editForm.custo) : null,
      })
      showToast('Evento atualizado!')
      setEditando(null)
      reload()
    } catch (err) {
      showToast(err.message || 'Erro ao salvar', 'error')
    } finally { setSalvandoEdit(false) }
  }

  const handleDelete = async (ev) => {
    try {
      await api.sanidade.excluir(ev.id)
      showToast('Evento excluído!')
      setConfirmDelete(null)
      reload()
    } catch (err) {
      showToast(err.message || 'Erro ao excluir', 'error')
    }
  }

  const updateEdit = (field, value) => setEditForm(f => ({ ...f, [field]: value }))

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Sanidade</div>
          <div className="text-[13px] text-text-secondary font-medium">Calendário sanitário do rebanho</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <button onClick={() => navigate('/configuracoes?tab=sanitarios')} className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer">Produtos</button>
          <button onClick={() => navigate('/sanidade/novo')} className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none">+ Registrar evento</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[22px_26px] bg-header-bg">
        <div className="grid grid-cols-3 gap-[14px] mb-[18px]">
          <KPITile label="Vencidas" value={String(vencidas)} subtitle="ação urgente" />
          <KPITile label="Próx. 7 dias" value={String(prox7)} subtitle="agendadas" />
          <KPITile label="Total de eventos" value={String(all.length)} subtitle="registrados" variant="primary" />
        </div>

        <div className="flex gap-[10px] mb-[14px]">
          <Chip active={aba === 'proximas'} onClick={() => setAba('proximas')}>Próximas</Chip>
          <Chip active={aba === 'historico'} onClick={() => setAba('historico')}>Histórico</Chip>
        </div>

        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_.8fr_.5fr] py-[10px] px-[4px] text-[12px] font-bold text-text-secondary uppercase">
            <span>Evento</span><span>Alvo</span><span>Data</span><span>Status</span><span></span>
          </div>
          {all.map(ev => (
            <div key={ev.id} className="group grid grid-cols-[1.4fr_1fr_1fr_.8fr_.5fr] py-[12px] px-[4px] text-[13.5px] border-t border-[#f0ede4] text-text-body items-center">
              <span className="font-bold text-primary-dark">{ev.produto}</span>
              <span>{ev.lote_nome || 'Individual'} · {ev.qtd_animais || 1}</span>
              <span className="font-mono">{fmtDataCurta(aba === 'proximas' ? ev.data_proxima_dose || ev.data : ev.data)}</span>
              <span className="text-[11.5px] font-bold" style={{ color: urgenciaColors[ev.urgencia] }}>
                {ev.urgencia === 'vencido' ? 'Vencido' : ev.urgencia === 'proximo' ? statusText(ev, ev.urgencia).split('·')[1]?.trim() || 'Próximo' : 'Agendado'}
              </span>
              <span className="flex gap-[6px] justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => abrirEdicao(ev)} className="p-[6px] rounded-[8px] bg-transparent border-none cursor-pointer text-text-secondary hover:bg-chip-bg hover:text-primary-dark transition-colors"><Pencil size={14} /></button>
                <button onClick={() => setConfirmDelete(ev)} className="p-[6px] rounded-[8px] bg-transparent border-none cursor-pointer text-text-secondary hover:bg-[#fde8e4] hover:text-danger transition-colors"><Trash2 size={14} /></button>
              </span>
            </div>
          ))}
          {all.length === 0 && (
            <EmptyState icon={ShieldCheck} title="Nenhum evento sanitário" description="Registre vacinas, vermífugos e exames do seu rebanho." actionLabel="Novo evento" onAction={() => navigate('/sanidade/novo')} />
          )}
        </div>
      </div>

      {editando && editForm && (
        <Modal
          title="Editar evento sanitário"
          subtitle={editando.produto}
          width={460}
          onClose={() => setEditando(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button onClick={handleEditSave} disabled={salvandoEdit}>
                {salvandoEdit ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </>
          }
        >
          <Select
            label="Tipo"
            value={editForm.tipo}
            onChange={e => updateEdit('tipo', e.target.value)}
            options={[{ value: 'vacina', label: 'Vacina' }, { value: 'vermifugo', label: 'Vermífugo' }, { value: 'exame', label: 'Exame' }]}
            className="mb-[16px]"
          />
          <Select
            label="Produto"
            value={editForm.produto}
            onChange={e => updateEdit('produto', e.target.value)}
            options={produtos.map(p => ({ value: p, label: p }))}
            className="mb-[16px]"
          />
          <div className="flex gap-[14px] mb-[16px]">
            <Input
              label="Dose"
              value={editForm.dose}
              onChange={e => updateEdit('dose', e.target.value)}
              placeholder="5 ml"
              className="flex-1"
            />
            <Input
              label="Data"
              type="date"
              value={editForm.data}
              onChange={e => updateEdit('data', e.target.value)}
              className="flex-1"
            />
          </div>
          <Input
            label="Responsável"
            value={editForm.responsavel}
            onChange={e => updateEdit('responsavel', e.target.value)}
            className="mb-[16px]"
          />
          <Input
            label="Custo (R$)"
            value={editForm.custo}
            onChange={e => updateEdit('custo', e.target.value)}
            placeholder="0"
            mono
            className="mb-[4px]"
          />
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir evento sanitário"
          message={`Tem certeza que deseja excluir o evento "${confirmDelete.produto}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}

export default function SanidadePage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopSanidade /> : <MobileSanidade />
}
