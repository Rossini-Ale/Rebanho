import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import KPITile from '../components/ui/KPITile'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Toast from '../components/ui/Toast'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import useToast from '../hooks/useToast'
import { api } from '../lib/api'
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react'

const situacaoStyle = {
  ativo: { color: '#588157', bg: '#e7ece4' },
  prenhe: { color: '#a9711f', bg: '#f6eed9' },
  quarentena: { color: '#b54a2f', bg: '#f6e7e1' },
}

function AnimalThumbSmall() {
  return (
    <span className="shrink-0 rounded-[9px]" style={{ width: 34, height: 34, background: 'repeating-linear-gradient(135deg,#e7e3d8,#e7e3d8 6px,#ddd8ca 6px,#ddd8ca 12px)' }} />
  )
}

function MobileDetalhe({ lote, animaisDoLote }) {
  const navigate = useNavigate()
  const qtd = animaisDoLote.length
  const area = lote.area_ha ? parseFloat(lote.area_ha) : null

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-[20px] pt-[8px] pb-[14px]">
        <div className="flex items-center gap-[14px]">
          <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
          <span className="text-[19px] font-extrabold text-primary-dark">{lote.nome}</span>
        </div>
        <span onClick={() => navigate('/configuracoes?tab=lotes')} className="text-[13px] font-bold text-primary cursor-pointer">Editar</span>
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[8px]">
        <div className="bg-primary rounded-[16px] p-[16px_18px] mb-[14px] flex justify-between">
          <div>
            <div className="text-[12px] text-accent-light font-semibold">Lotação</div>
            <div className="font-mono text-[24px] font-bold text-white">
              {lote.capacidade ? `${qtd} / ${lote.capacidade}` : qtd}
            </div>
          </div>
          {area && (
            <div className="text-right">
              <div className="text-[12px] text-accent-light font-semibold">Área</div>
              <div className="text-[18px] font-bold text-white">{area} ha</div>
            </div>
          )}
        </div>

        <div className="flex gap-[10px] mb-[16px]">
          <button onClick={() => navigate('/sanidade/novo')} className="flex-1 bg-white border border-[#eee9df] rounded-[13px] py-[13px] px-[8px] text-center text-[13px] font-bold text-primary cursor-pointer">Vacinar</button>
          <button onClick={() => navigate(`/registrar-peso?lote=${lote.id}`)} className="flex-1 bg-white border border-[#eee9df] rounded-[13px] py-[13px] px-[8px] text-center text-[13px] font-bold text-primary cursor-pointer">Pesar</button>
          <button onClick={() => navigate(`/mover-lote?lote=${lote.id}`)} className="flex-1 bg-white border border-[#eee9df] rounded-[13px] py-[13px] px-[8px] text-center text-[13px] font-bold text-primary cursor-pointer">Mover</button>
        </div>

        <div className="text-[13px] font-extrabold text-text-secondary uppercase tracking-[.04em] mb-[8px]">Animais ({qtd})</div>
        {animaisDoLote.map(a => (
          <button key={a.id} onClick={() => navigate(`/animais/${a.id}`)} className="w-full bg-white border border-[#eee9df] rounded-[12px] py-[11px] px-[14px] mb-[8px] flex items-center gap-[12px] cursor-pointer text-left">
            <AnimalThumbSmall />
            <span className="font-mono text-[16px] font-bold text-primary-dark">{a.brinco}</span>
            <span className="flex-1 text-[12.5px] text-text-secondary font-medium text-right">{a.raca} · {a.peso_atual ? `${parseFloat(a.peso_atual)}kg` : '—'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function DesktopDetalhe({ lote, animaisDoLote, reload }) {
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()
  const qtd = animaisDoLote.length
  const area = lote.area_ha ? parseFloat(lote.area_ha) : null
  const pesos = animaisDoLote.filter(a => a.peso_atual).map(a => parseFloat(a.peso_atual))
  const pm = pesos.length ? Math.round(pesos.reduce((s, p) => s + p, 0) / pesos.length) : 0
  const pctOcupado = lote.capacidade ? Math.round((qtd / lote.capacidade) * 100) : null

  const [editando, setEditando] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [salvandoEdit, setSalvandoEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const abrirEdicao = () => {
    setEditForm({
      nome: lote.nome || '',
      tipo: lote.tipo || 'pasto',
      area_ha: lote.area_ha ? String(parseFloat(lote.area_ha)) : '',
      capacidade: lote.capacidade ? String(lote.capacidade) : '',
    })
    setEditando(true)
  }

  const handleEditSave = async () => {
    setSalvandoEdit(true)
    try {
      await api.lotes.atualizar(lote.id, {
        nome: editForm.nome,
        tipo: editForm.tipo,
        area_ha: editForm.area_ha ? parseFloat(editForm.area_ha) : null,
        capacidade: editForm.capacidade ? parseInt(editForm.capacidade) : null,
      })
      showToast('Lote atualizado!')
      setEditando(false)
      reload()
    } catch (err) {
      showToast(err.message || 'Erro ao salvar', 'error')
    } finally { setSalvandoEdit(false) }
  }

  const handleDelete = async () => {
    try {
      await api.lotes.excluir(lote.id)
      showToast('Lote excluído!')
      navigate('/lotes')
    } catch (err) {
      showToast(err.message || 'Erro ao excluir', 'error')
      setConfirmDelete(false)
    }
  }

  const updateEdit = (field, value) => setEditForm(f => ({ ...f, [field]: value }))

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">{lote.nome}</div>
          <div className="text-[13px] text-text-secondary font-medium">
            {area ? `${area} ha · ` : ''}{qtd} animais{lote.capacidade ? ` · capacidade ${lote.capacidade}` : ''}
          </div>
        </div>
        <div className="flex gap-[10px] items-center">
          <button onClick={abrirEdicao} className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer flex items-center gap-[6px]"><Pencil size={14} /> Editar</button>
          <button onClick={() => navigate('/sanidade/novo')} className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none">Vacinar lote</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[22px_26px] bg-header-bg">
        <div className="grid grid-cols-4 gap-[14px] mb-[16px]">
          <KPITile label="Lotação" value={lote.capacidade ? `${qtd} / ${lote.capacidade}` : String(qtd)} subtitle={pctOcupado !== null ? `${pctOcupado}% ocupado` : ''} />
          <KPITile label="Área" value={area ? `${area} ha` : '—'} />
          <KPITile label="Peso médio" value={pm ? `${pm} kg` : '—'} />
          <KPITile label="Tipo" value={lote.tipo || '—'} variant="primary" />
        </div>

        <div className="flex gap-[10px] mb-[16px]">
          <button onClick={() => navigate('/sanidade/novo')} className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer">Vacinar lote</button>
          <button onClick={() => navigate(`/registrar-peso?lote=${lote.id}`)} className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer">Pesar lote</button>
          <button onClick={() => navigate(`/mover-lote?lote=${lote.id}`)} className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer">Mover animais</button>
        </div>

        <div className="bg-white border border-border rounded-[14px] p-[18px]">
          <div className="grid grid-cols-[90px_1fr_.8fr_.9fr_1fr] py-[10px] px-[4px] text-[12px] font-semibold text-text-secondary border-b border-border">
            <span>Brinco</span><span>Raça</span><span>Sexo</span><span>Peso</span><span>Situação</span>
          </div>
          {animaisDoLote.map(a => {
            const s = situacaoStyle[a.situacao] || situacaoStyle.ativo
            return (
              <button key={a.id} onClick={() => navigate(`/animais/${a.id}`)} className="grid grid-cols-[90px_1fr_.8fr_.9fr_1fr] py-[11px] px-[4px] text-[13.5px] text-text-body items-center cursor-pointer w-full text-left bg-transparent hover:bg-[#f5f3ec] transition-colors">
                <span className="font-mono font-bold text-primary-dark">{a.brinco}</span>
                <span>{a.raca}</span>
                <span>{a.sexo}</span>
                <span className="font-mono">{a.peso_atual ? `${parseFloat(a.peso_atual)} kg` : '—'}</span>
                <span><span className="text-[11.5px] font-bold py-[3px] px-[9px] rounded-[12px]" style={{ color: s.color, background: s.bg }}>{a.situacao.charAt(0).toUpperCase() + a.situacao.slice(1)}</span></span>
              </button>
            )
          })}
          {animaisDoLote.length === 0 && (
            <div className="py-[24px] text-center text-text-secondary text-[14px]">Nenhum animal neste lote.</div>
          )}
        </div>

        <button onClick={() => setConfirmDelete(true)} className="text-[13px] font-semibold text-danger cursor-pointer bg-transparent border-none hover:underline mt-[16px]">
          Excluir lote
        </button>
      </div>

      {editando && editForm && (
        <Modal
          title="Editar lote"
          subtitle={lote.nome}
          width={460}
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
            label="Nome"
            value={editForm.nome}
            onChange={e => updateEdit('nome', e.target.value)}
            className="mb-[16px]"
          />
          <Select
            label="Tipo"
            value={editForm.tipo}
            onChange={e => updateEdit('tipo', e.target.value)}
            options={[{ value: 'pasto', label: 'Pasto' }, { value: 'curral', label: 'Curral' }, { value: 'maternidade', label: 'Maternidade' }]}
            className="mb-[16px]"
          />
          <div className="flex gap-[14px] mb-[4px]">
            <Input
              label="Área (ha)"
              value={editForm.area_ha}
              onChange={e => updateEdit('area_ha', e.target.value)}
              placeholder="0"
              mono
              className="flex-1"
            />
            <Input
              label="Capacidade"
              value={editForm.capacidade}
              onChange={e => updateEdit('capacidade', e.target.value)}
              placeholder="0"
              mono
              className="flex-1"
            />
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir lote"
          message={qtd > 0
            ? `Este lote possui ${qtd} animais. Mova-os para outro lote antes de excluir.`
            : `Tem certeza que deseja excluir o lote "${lote.nome}"? Esta ação não pode ser desfeita.`}
          confirmLabel={qtd > 0 ? 'Entendi' : 'Excluir'}
          onConfirm={qtd > 0 ? () => setConfirmDelete(false) : handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}

export default function LoteDetalhePage() {
  const { id } = useParams()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { data: lote, loading, reload } = useApi(() => api.lotes.buscar(id), [id])
  const { data: animaisDoLote } = useApi(() => api.lotes.animais(id), [id])

  if (loading) return <div className="flex-1 flex items-center justify-center text-text-secondary">Carregando…</div>
  if (!lote) return <div className="flex-1 flex items-center justify-center text-text-secondary">Lote não encontrado.</div>

  return isDesktop
    ? <DesktopDetalhe lote={lote} animaisDoLote={animaisDoLote || []} reload={reload} />
    : <MobileDetalhe lote={lote} animaisDoLote={animaisDoLote || []} />
}
