import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SegmentedControl from '../components/ui/SegmentedControl'
import { api } from '../lib/api'
import { touros, fmtData } from '../lib/utils'
import { ChevronLeft } from 'lucide-react'

function calcPrevParto(dataCobertura) {
  if (!dataCobertura) return null
  const d = new Date(dataCobertura)
  d.setDate(d.getDate() + 283)
  return d.toISOString().slice(0, 10)
}

function MobileCobertura() {
  const navigate = useNavigate()
  const { data: rawAnimais } = useApi(() => api.animais.listar({ sexo: 'Fêmea' }), [])
  const femeas = rawAnimais || []
  const [form, setForm] = useState({ femeaId: '', metodo: 'monta', touro: '0631', dataCobertura: new Date().toISOString().slice(0, 10) })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))
  const prev = calcPrevParto(form.dataCobertura)

  const handleSave = async () => {
    await api.reproducao.cobertura({ femea_id: form.femeaId, metodo: form.metodo === 'ia' ? 'IA' : 'monta', touro_info: touros.find(t => t.value === form.touro)?.label || form.touro, data_cobertura: form.dataCobertura })
    navigate('/reproducao')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[14px] px-[20px] pt-[14px] pb-[14px]">
        <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
        <span className="text-[19px] font-extrabold text-primary-dark">Nova cobertura</span>
      </div>
      <div className="flex-1 overflow-auto px-[20px]">
        <Select label="Fêmea" value={form.femeaId} onChange={e => update('femeaId', e.target.value)} options={femeas.map(a => ({ value: String(a.id), label: `${a.brinco} · ${a.raca}` }))} className="mb-[18px]" />
        <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">Método</div>
        <SegmentedControl options={[{ value: 'ia', label: 'IA' }, { value: 'monta', label: 'Monta' }]} value={form.metodo} onChange={v => update('metodo', v)} className="mb-[18px]" />
        <Select label="Touro" value={form.touro} onChange={e => update('touro', e.target.value)} options={touros} className="mb-[18px]" />
        <Input label="Data da cobertura" type="date" value={form.dataCobertura} onChange={e => update('dataCobertura', e.target.value)} className="mb-[18px]" />
        {prev && (
          <div className="bg-primary rounded-[16px] p-[16px_18px] flex justify-between items-center">
            <div><div className="text-[12.5px] text-accent-light font-semibold">Previsão de parto (~283d)</div><div className="text-[18px] font-extrabold text-white">{fmtData(prev)}</div></div>
          </div>
        )}
      </div>
      <div className="px-[20px] py-[12px] pb-[24px]"><Button fullWidth onClick={handleSave}>Registrar cobertura</Button></div>
    </div>
  )
}

function DesktopCobertura() {
  const navigate = useNavigate()
  const { data: rawAnimais } = useApi(() => api.animais.listar({ sexo: 'Fêmea' }), [])
  const femeas = rawAnimais || []
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ femeaId: '', metodo: 'monta', touro: '0631', dataCobertura: new Date().toISOString().slice(0, 10) })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))
  const prev = calcPrevParto(form.dataCobertura)

  const handleSave = async () => {
    setSalvando(true)
    try {
      await api.reproducao.cobertura({ femea_id: form.femeaId, metodo: form.metodo === 'ia' ? 'IA' : 'monta', touro_info: touros.find(t => t.value === form.touro)?.label || form.touro, data_cobertura: form.dataCobertura })
      navigate('/reproducao')
    } finally { setSalvando(false) }
  }

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div><div className="text-[21px] font-extrabold text-primary-dark">Reprodução</div><div className="text-[13px] text-text-secondary font-medium">Nova cobertura</div></div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-header-bg relative">
        <div className="absolute inset-0 bg-[rgba(20,30,22,0.45)] flex items-center justify-center z-10">
          <div className="w-[470px] max-h-[88%] bg-bg rounded-[16px] shadow-[0_30px_70px_rgba(0,0,0,0.32)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center py-[17px] px-[22px] border-b border-border bg-white">
              <span className="text-[17px] font-extrabold text-primary-dark">Nova cobertura</span>
              <button onClick={() => navigate(-1)} className="text-[18px] text-text-secondary font-semibold bg-transparent border-none cursor-pointer">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-[20px_22px]">
              <Select label="Fêmea" value={form.femeaId} onChange={e => update('femeaId', e.target.value)} options={femeas.map(a => ({ value: String(a.id), label: `${a.brinco} · ${a.raca} · ${a.lote_nome || ''}` }))} className="mb-[16px]" />
              <div className="text-[12px] font-bold text-text-secondary mb-[7px] tracking-[.02em] uppercase">Método</div>
              <SegmentedControl options={[{ value: 'ia', label: 'IA' }, { value: 'monta', label: 'Monta' }]} value={form.metodo} onChange={v => update('metodo', v)} className="mb-[16px]" />
              <Select label="Touro" value={form.touro} onChange={e => update('touro', e.target.value)} options={touros} className="mb-[16px]" />
              <Input label="Data da cobertura" type="date" value={form.dataCobertura} onChange={e => update('dataCobertura', e.target.value)} className="mb-[16px]" />
              {prev && (
                <div className="bg-primary rounded-[12px] p-[14px_16px] flex justify-between items-center">
                  <div><div className="text-[12px] text-accent-light font-semibold">Previsão de parto (~283d)</div><div className="text-[16px] font-extrabold text-white">{fmtData(prev)}</div></div>
                </div>
              )}
            </div>
            <div className="py-[13px] px-[22px] border-t border-border bg-white flex gap-[10px] justify-end">
              <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
              <button disabled={salvando} onClick={handleSave} className="bg-primary text-white rounded-sidebar-item py-[10px] px-[20px] text-[14px] font-extrabold cursor-pointer border-none disabled:opacity-50">{salvando ? 'Salvando…' : 'Registrar cobertura'}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CoberturaPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopCobertura /> : <MobileCobertura />
}
