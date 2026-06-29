import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import { api } from '../lib/api'
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
  const [form, setForm] = useState({ animalId: searchParams.get('animal') || '', loteDestinoId: '', motivo: 'Rotação de pasto', data: new Date().toISOString().slice(0, 10) })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))

  const handleSave = async () => {
    if (!form.animalId || !form.loteDestinoId) return
    setSalvando(true)
    try {
      await api.animais.mover(form.animalId, { lote_destino_id: form.loteDestinoId, motivo: form.motivo, data: form.data })
      navigate(`/animais/${form.animalId}`)
    } finally { setSalvando(false) }
  }

  const content = <MoverForm animais={animais} lotes={lotes} form={form} update={update} />

  if (isDesktop) {
    return (
      <>
        <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
          <div><div className="text-[21px] font-extrabold text-primary-dark">Mover de lote</div></div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-header-bg relative">
          <div className="absolute inset-0 bg-[rgba(20,30,22,0.45)] flex items-center justify-center z-10">
            <div className="w-[470px] max-h-[88%] bg-bg rounded-[16px] shadow-[0_30px_70px_rgba(0,0,0,0.32)] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center py-[17px] px-[22px] border-b border-border bg-white">
                <span className="text-[17px] font-extrabold text-primary-dark">Mover de lote</span>
                <button onClick={() => navigate(-1)} className="text-[18px] text-text-secondary font-semibold bg-transparent border-none cursor-pointer">✕</button>
              </div>
              <div className="flex-1 overflow-auto p-[20px_22px]">{content}</div>
              <div className="py-[13px] px-[22px] border-t border-border bg-white flex gap-[10px] justify-end">
                <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
                <button disabled={salvando} onClick={handleSave} className="bg-primary text-white rounded-sidebar-item py-[10px] px-[20px] text-[14px] font-extrabold cursor-pointer border-none disabled:opacity-50">{salvando ? 'Movendo…' : 'Mover animal'}</button>
              </div>
            </div>
          </div>
        </div>
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
