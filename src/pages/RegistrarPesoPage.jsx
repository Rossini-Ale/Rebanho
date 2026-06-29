import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { api } from '../lib/api'
import { ChevronLeft } from 'lucide-react'

function PesoForm({ animais, form, update, ultimaPesagem }) {
  const variacao = form.peso && ultimaPesagem ? (parseFloat(form.peso) - parseFloat(ultimaPesagem.peso_kg)).toFixed(0) : null

  return (
    <>
      <Select label="Animal" value={form.animalId} onChange={e => update('animalId', e.target.value)} options={(animais || []).map(a => ({ value: String(a.id), label: `${a.brinco} · ${a.raca} · ${a.lote_nome || ''}` }))} className="mb-[18px]" />

      <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">Peso (kg)</div>
      <input value={form.peso} onChange={e => update('peso', e.target.value)} placeholder="0" className="w-full bg-white border-[1.5px] border-primary rounded-button py-[14px] px-[16px] font-mono text-[22px] font-bold text-primary-dark outline-none mb-[18px]" />

      {ultimaPesagem && (
        <div className="bg-chip-bg rounded-button p-[13px_16px] mb-[18px] flex justify-between items-center">
          <div>
            <div className="text-[12px] text-text-body font-semibold">Última pesagem</div>
            <div className="text-[15px] font-bold text-primary-dark">{parseFloat(ultimaPesagem.peso_kg)} kg · {new Date(ultimaPesagem.data).toLocaleDateString('pt-BR')}</div>
          </div>
          {variacao && (
            <div className="text-right">
              <div className={`font-mono text-[18px] font-bold ${parseFloat(variacao) >= 0 ? 'text-primary-medium' : 'text-danger'}`}>{parseFloat(variacao) >= 0 ? '+' : ''}{variacao} kg</div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-[12px] mb-[18px]">
        <Input label="Data" type="date" value={form.data} onChange={e => update('data', e.target.value)} className="flex-1" />
        <Input label="Local" value={form.local} onChange={e => update('local', e.target.value)} placeholder="Curral" className="flex-1" />
      </div>
    </>
  )
}

export default function RegistrarPesoPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { data: animais } = useApi(() => api.animais.listar(), [])
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ animalId: searchParams.get('animal') || '', peso: '', data: new Date().toISOString().slice(0, 10), local: 'Curral' })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))

  const { data: pesagens } = useApi(() => form.animalId ? api.animais.pesagens(form.animalId) : Promise.resolve([]), [form.animalId])
  const ultimaPesagem = pesagens?.length ? pesagens[0] : null

  const handleSave = async () => {
    if (!form.animalId || !form.peso) return
    setSalvando(true)
    try {
      await api.animais.registrarPeso(form.animalId, { peso_kg: parseFloat(form.peso), data: form.data, local: form.local })
      navigate(`/animais/${form.animalId}`)
    } finally { setSalvando(false) }
  }

  const content = <PesoForm animais={animais} form={form} update={update} ultimaPesagem={ultimaPesagem} />

  if (isDesktop) {
    return (
      <>
        <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
          <div><div className="text-[21px] font-extrabold text-primary-dark">Registrar peso</div></div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-header-bg relative">
          <div className="absolute inset-0 bg-[rgba(20,30,22,0.45)] flex items-center justify-center z-10">
            <div className="w-[470px] max-h-[88%] bg-bg rounded-[16px] shadow-[0_30px_70px_rgba(0,0,0,0.32)] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center py-[17px] px-[22px] border-b border-border bg-white">
                <span className="text-[17px] font-extrabold text-primary-dark">Registrar peso</span>
                <button onClick={() => navigate(-1)} className="text-[18px] text-text-secondary font-semibold bg-transparent border-none cursor-pointer">✕</button>
              </div>
              <div className="flex-1 overflow-auto p-[20px_22px]">{content}</div>
              <div className="py-[13px] px-[22px] border-t border-border bg-white flex gap-[10px] justify-end">
                <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
                <button disabled={salvando} onClick={handleSave} className="bg-primary text-white rounded-sidebar-item py-[10px] px-[20px] text-[14px] font-extrabold cursor-pointer border-none disabled:opacity-50">{salvando ? 'Salvando…' : 'Salvar pesagem'}</button>
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
        <span className="text-[19px] font-extrabold text-primary-dark">Registrar peso</span>
      </div>
      <div className="flex-1 overflow-auto px-[20px]">{content}</div>
      <div className="px-[20px] py-[12px] pb-[24px]"><Button fullWidth onClick={handleSave} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar pesagem'}</Button></div>
    </div>
  )
}
