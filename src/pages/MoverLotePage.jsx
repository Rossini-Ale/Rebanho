import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import { api } from '../lib/api'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import { ChevronLeft } from 'lucide-react'

function MoverForm({ animais, lotes, form, update }) {
  const animal = (animais || []).find(a => String(a.id) === form.animalId)
  const loteDestino = (lotes || []).find(l => String(l.id) === form.loteDestinoId)

  return (
    <>
      <Select label="Animal" value={form.animalId} onChange={e => update('animalId', e.target.value)} options={(animais || []).map(a => ({ value: String(a.id), label: `${a.brinco} · ${a.raca} · ${a.lote_nome || ''}` }))} className="mb-[18px]" />

      {animal && (
        <div className="bg-white border-[1.5px] border-field-border rounded-button py-[14px] px-[16px] mb-[8px] text-[15.5px] font-semibold text-text-secondary">
          {animal.lote_nome || 'Sem lote'} (atual)
        </div>
      )}

      <div className="text-center text-[22px] text-primary-medium my-[4px] mb-[8px]">↓</div>

      <Select label="Novo lote" value={form.loteDestinoId} onChange={e => update('loteDestinoId', e.target.value)} options={(lotes || []).map(l => ({ value: String(l.id), label: `${l.nome} · ${l.qtd_animais || 0} animais` }))} className="mb-[18px]" />

      <Select label="Motivo" value={form.motivo} onChange={e => update('motivo', e.target.value)} options={[
        { value: 'Rotação de pasto', label: 'Rotação de pasto' },
        { value: 'Manejo', label: 'Manejo' },
        { value: 'Tratamento', label: 'Tratamento' },
        { value: 'Reprodução', label: 'Reprodução' },
        { value: 'Outro', label: 'Outro' },
      ]} className="mb-[18px]" />

      <Input label="Data" type="date" value={form.data} onChange={e => update('data', e.target.value)} className="mb-[14px]" />

      {loteDestino && loteDestino.capacidade && (
        <div className="bg-[#eef0e9] rounded-button p-[13px_16px] text-[13px] text-text-body font-semibold">
          {loteDestino.nome} ficará com <b>{(loteDestino.qtd_animais || 0) + 1}/{loteDestino.capacidade}</b> animais após a mudança.
        </div>
      )}
    </>
  )
}

export default function MoverLotePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { data: animais } = useApi(() => api.animais.listar(), [])
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const [salvando, setSalvando] = useState(false)
  const { toast, showToast, hideToast } = useToast()
  const [form, setForm] = useState({ animalId: searchParams.get('animal') || '', loteDestinoId: '', motivo: 'Rotação de pasto', data: new Date().toISOString().slice(0, 10) })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))

  const handleSave = async () => {
    if (!form.animalId) { showToast('Selecione o animal', 'error'); return }
    if (!form.loteDestinoId) { showToast('Selecione o lote de destino', 'error'); return }
    setSalvando(true)
    try {
      await api.animais.mover(form.animalId, { lote_destino_id: form.loteDestinoId, motivo: form.motivo, data: form.data })
      showToast('Animal movido com sucesso!')
      setTimeout(() => navigate(`/animais/${form.animalId}`), 800)
    } catch (err) {
      showToast(err.message || 'Erro ao mover animal', 'error')
    } finally { setSalvando(false) }
  }

  const content = <MoverForm animais={animais} lotes={lotes} form={form} update={update} />

  if (isDesktop) {
    return (
      <>{toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Modal
        title="Mover de lote"
        footer={
          <>
            <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={salvando}>{salvando ? 'Movendo…' : 'Mover animal'}</Button>
          </>
        }
      >
        {content}
      </Modal>
      </>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[14px] px-[20px] pt-[14px] pb-[14px]">
        <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
        <span className="text-[19px] font-extrabold text-primary-dark">Mover de lote</span>
      </div>
      <div className="flex-1 overflow-auto px-[20px]">{content}</div>
      <div className="px-[20px] py-[12px] pb-[24px]"><Button fullWidth onClick={handleSave} disabled={salvando}>{salvando ? 'Movendo…' : 'Mover animal'}</Button></div>
    </div>
  )
}
