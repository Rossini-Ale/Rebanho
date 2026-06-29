import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SegmentedControl from '../components/ui/SegmentedControl'
import { api } from '../lib/api'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
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
  const { data: tourosConfig } = useApi(() => api.configuracoes.buscar('touros').catch(() => null), [])
  const tourosOpts = tourosConfig?.valor || touros
  const [form, setForm] = useState({ femeaId: '', metodo: 'monta', touro: '', dataCobertura: new Date().toISOString().slice(0, 10) })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))
  const prev = calcPrevParto(form.dataCobertura)

  const handleSave = async () => {
    if (!form.femeaId) { alert('Selecione a fêmea'); return }
    if (!form.dataCobertura) { alert('Informe a data da cobertura'); return }
    await api.reproducao.cobertura({ femea_id: form.femeaId, metodo: form.metodo === 'ia' ? 'IA' : 'monta', touro_info: tourosOpts.find(t => t.value === form.touro)?.label || form.touro, data_cobertura: form.dataCobertura })
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
        <Select label="Touro" value={form.touro} onChange={e => update('touro', e.target.value)} options={tourosOpts} className="mb-[18px]" />
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
  const { toast, showToast, hideToast } = useToast()
  const { data: tourosConfigD } = useApi(() => api.configuracoes.buscar('touros').catch(() => null), [])
  const tourosOptsD = tourosConfigD?.valor || touros
  const [form, setForm] = useState({ femeaId: '', metodo: 'monta', touro: '', dataCobertura: new Date().toISOString().slice(0, 10) })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))
  const prev = calcPrevParto(form.dataCobertura)

  const handleSave = async () => {
    if (!form.femeaId) { showToast('Selecione a fêmea', 'error'); return }
    if (!form.dataCobertura) { showToast('Informe a data da cobertura', 'error'); return }
    setSalvando(true)
    try {
      await api.reproducao.cobertura({ femea_id: form.femeaId, metodo: form.metodo === 'ia' ? 'IA' : 'monta', touro_info: tourosOptsD.find(t => t.value === form.touro)?.label || form.touro, data_cobertura: form.dataCobertura })
      showToast('Cobertura registrada!')
      setTimeout(() => navigate('/reproducao'), 800)
    } catch (err) {
      showToast(err.message || 'Erro ao registrar cobertura', 'error')
    } finally { setSalvando(false) }
  }

  return (
    <>{toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    <Modal
      title="Nova cobertura"
      footer={
        <>
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={salvando}>{salvando ? 'Salvando…' : 'Registrar cobertura'}</Button>
        </>
      }
    >
      <Select label="Fêmea" value={form.femeaId} onChange={e => update('femeaId', e.target.value)} options={femeas.map(a => ({ value: String(a.id), label: `${a.brinco} · ${a.raca} · ${a.lote_nome || ''}` }))} className="mb-[16px]" />
      <div className="text-[12px] font-bold text-text-secondary mb-[7px] tracking-[.02em] uppercase">Método</div>
      <SegmentedControl options={[{ value: 'ia', label: 'IA' }, { value: 'monta', label: 'Monta' }]} value={form.metodo} onChange={v => update('metodo', v)} className="mb-[16px]" />
      <Select label="Touro" value={form.touro} onChange={e => update('touro', e.target.value)} options={tourosOptsD} className="mb-[16px]" />
      <Input label="Data da cobertura" type="date" value={form.dataCobertura} onChange={e => update('dataCobertura', e.target.value)} className="mb-[16px]" />
      {prev && (
        <div className="bg-primary rounded-[12px] p-[14px_16px] flex justify-between items-center">
          <div><div className="text-[12px] text-accent-light font-semibold">Previsão de parto (~283d)</div><div className="text-[16px] font-extrabold text-white">{fmtData(prev)}</div></div>
        </div>
      )}
    </Modal>
    </>
  )
}

export default function CoberturaPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopCobertura /> : <MobileCobertura />
}
