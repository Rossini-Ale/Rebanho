import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SegmentedControl from '../components/ui/SegmentedControl'
import { api } from '../lib/api'
import { ChevronLeft } from 'lucide-react'

function FormContent({ form, update, femeas }) {
  const mae = femeas.find(a => String(a.id) === form.maeId)
  return (
    <>
      <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">Mãe</div>
      <Select value={form.maeId} onChange={e => update('maeId', e.target.value)} options={femeas.map(a => ({ value: String(a.id), label: `${a.brinco} · ${a.raca}` }))} className="mb-[18px]" />
      <Input label="Data do parto" type="date" value={form.dataParto} onChange={e => update('dataParto', e.target.value)} className="mb-[18px]" />
      <div className="text-[13px] font-extrabold text-text-secondary uppercase tracking-[.04em] mb-[10px]">Bezerro</div>
      <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">Situação</div>
      <SegmentedControl options={[{ value: 'vivo', label: 'Vivo' }, { value: 'natimorto', label: 'Natimorto' }]} value={form.situacao} onChange={v => update('situacao', v)} className="mb-[18px]" />
      {form.situacao === 'vivo' && (
        <>
          <div className="flex gap-[12px] mb-[18px]">
            <Select label="Sexo" value={form.sexoBezerro} onChange={e => update('sexoBezerro', e.target.value)} options={[{ value: 'Fêmea', label: 'Fêmea' }, { value: 'Macho', label: 'Macho' }]} className="flex-1" />
            <Input label="Peso" value={form.pesoBezerro} onChange={e => update('pesoBezerro', e.target.value)} mono placeholder="32 kg" className="flex-1" />
          </div>
          <Input label="Brinco do bezerro" value={form.brincoBezerro} onChange={e => update('brincoBezerro', e.target.value)} mono placeholder="0000" className="mb-[18px]" />
          <div className="bg-[#eef0e9] rounded-button p-[13px_16px] text-[13px] text-text-body font-semibold">
            Cria o bezerro <b>{form.brincoBezerro || '____'}</b> já cadastrado, filiado à {mae?.brinco || '____'}, no lote Maternidade.
          </div>
        </>
      )}
    </>
  )
}

function MobileParto() {
  const navigate = useNavigate()
  const { data: rawAnimais } = useApi(() => api.animais.listar({ sexo: 'Fêmea' }), [])
  const femeas = rawAnimais || []
  const [form, setForm] = useState({ maeId: '', dataParto: new Date().toISOString().slice(0, 10), situacao: 'vivo', sexoBezerro: 'Fêmea', pesoBezerro: '32', brincoBezerro: '' })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))

  const handleSave = async () => {
    await api.reproducao.parto({ femea_id: form.maeId, data_parto: form.dataParto, bezerro_situacao: form.situacao, bezerro_sexo: form.sexoBezerro, bezerro_peso: form.pesoBezerro, bezerro_brinco: form.brincoBezerro })
    navigate('/reproducao')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[14px] px-[20px] pt-[14px] pb-[14px]">
        <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
        <span className="text-[19px] font-extrabold text-primary-dark">Registrar parto</span>
      </div>
      <div className="flex-1 overflow-auto px-[20px]"><FormContent form={form} update={update} femeas={femeas} /></div>
      <div className="px-[20px] py-[12px] pb-[24px]"><Button fullWidth onClick={handleSave}>Registrar nascimento</Button></div>
    </div>
  )
}

function DesktopParto() {
  const navigate = useNavigate()
  const { data: rawAnimais } = useApi(() => api.animais.listar({ sexo: 'Fêmea' }), [])
  const femeas = rawAnimais || []
  const [form, setForm] = useState({ maeId: '', dataParto: new Date().toISOString().slice(0, 10), situacao: 'vivo', sexoBezerro: 'Fêmea', pesoBezerro: '32', brincoBezerro: '' })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))

  const handleSave = async () => {
    await api.reproducao.parto({ femea_id: form.maeId, data_parto: form.dataParto, bezerro_situacao: form.situacao, bezerro_sexo: form.sexoBezerro, bezerro_peso: form.pesoBezerro, bezerro_brinco: form.brincoBezerro })
    navigate('/reproducao')
  }

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div><div className="text-[21px] font-extrabold text-primary-dark">Reprodução</div><div className="text-[13px] text-text-secondary font-medium">Registrar parto</div></div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-header-bg relative">
        <div className="absolute inset-0 bg-[rgba(20,30,22,0.45)] flex items-center justify-center z-10">
          <div className="w-[470px] max-h-[88%] bg-bg rounded-[16px] shadow-[0_30px_70px_rgba(0,0,0,0.32)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center py-[17px] px-[22px] border-b border-border bg-white">
              <span className="text-[17px] font-extrabold text-primary-dark">Registrar parto</span>
              <button onClick={() => navigate(-1)} className="text-[18px] text-text-secondary font-semibold bg-transparent border-none cursor-pointer">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-[20px_22px]"><FormContent form={form} update={update} femeas={femeas} /></div>
            <div className="py-[13px] px-[22px] border-t border-border bg-white flex gap-[10px] justify-end">
              <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
              <button onClick={handleSave} className="bg-primary text-white rounded-sidebar-item py-[10px] px-[20px] text-[14px] font-extrabold cursor-pointer border-none">Registrar nascimento</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function PartoPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopParto /> : <MobileParto />
}
