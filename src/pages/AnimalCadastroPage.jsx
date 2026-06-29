import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SegmentedControl from '../components/ui/SegmentedControl'
import useApi from '../hooks/useApi'
import { api } from '../lib/api'
import { racas } from '../lib/utils'
import { ChevronLeft } from 'lucide-react'

function MobileCadastro() {
  const navigate = useNavigate()
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const [form, setForm] = useState({
    brinco: '',
    sexo: 'femea',
    raca: 'Nelore',
    nascimento: '',
    origem: 'nascido_aqui',
    lote_id: '',
  })

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSave = async () => {
    await api.animais.criar({
      brinco: form.brinco,
      sexo: form.sexo === 'femea' ? 'Fêmea' : 'Macho',
      raca: form.raca,
      data_nascimento: form.nascimento,
      origem: form.origem,
      lote_id: form.lote_id || null,
    })
    navigate('/animais')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[14px] px-[20px] py-[8px] pt-[14px] pb-[14px]">
        <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0">
          <ChevronLeft size={24} />
        </button>
        <span className="text-[19px] font-extrabold text-primary-dark">Novo animal</span>
      </div>

      <div className="flex-1 overflow-auto px-[20px]">
        <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">Brinco *</div>
        <div className="flex gap-[10px] mb-[18px]">
          <input
            value={form.brinco}
            onChange={e => update('brinco', e.target.value)}
            placeholder="0000"
            className="flex-1 bg-white border-[1.5px] border-primary rounded-button py-[14px] px-[16px] font-mono text-[22px] font-bold text-primary-dark outline-none"
          />
          <div className="w-[54px] border-[1.5px] border-[#cfd4c7] rounded-button flex items-center justify-center">
            <span className="w-[24px] h-[24px] border-2 border-primary rounded-[6px]" />
          </div>
        </div>

        <SegmentedControl
          options={[{ value: 'femea', label: 'Fêmea' }, { value: 'macho', label: 'Macho' }]}
          value={form.sexo}
          onChange={v => update('sexo', v)}
          className="mb-[18px]"
        />

        <Select
          label="Raça"
          value={form.raca}
          onChange={e => update('raca', e.target.value)}
          options={racas.map(r => ({ value: r, label: r }))}
          className="mb-[18px]"
        />

        <Input
          label="Nascimento"
          type="date"
          value={form.nascimento}
          onChange={e => update('nascimento', e.target.value)}
          className="mb-[18px]"
        />

        <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">Origem</div>
        <SegmentedControl
          options={[{ value: 'nascido_aqui', label: 'Nascido aqui' }, { value: 'comprado', label: 'Comprado' }]}
          value={form.origem}
          onChange={v => update('origem', v)}
          className="mb-[18px]"
        />

        <Select
          label="Lote"
          value={form.lote_id}
          onChange={e => update('lote_id', e.target.value)}
          options={(lotes || []).map(l => ({ value: String(l.id), label: l.nome }))}
          className="mb-[8px]"
        />
      </div>

      <div className="px-[20px] py-[12px] pb-[24px] bg-bg">
        <Button fullWidth onClick={handleSave}>Salvar animal</Button>
      </div>
    </div>
  )
}

function DesktopCadastro() {
  const navigate = useNavigate()
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({
    brinco: '',
    sexo: 'femea',
    raca: 'Nelore',
    nascimento: '',
    origem: 'nascido_aqui',
    lote_id: '',
  })

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark">Animais</div>
          <div className="text-[13px] text-text-secondary font-medium">Novo cadastro</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-header-bg">
        <div className="absolute inset-0 bg-[rgba(20,30,22,0.45)] flex items-center justify-center z-10">
          <div className="w-[470px] max-h-[88%] bg-bg rounded-[16px] shadow-[0_30px_70px_rgba(0,0,0,0.32)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center py-[17px] px-[22px] border-b border-border bg-white">
              <span className="text-[17px] font-extrabold text-primary-dark">Novo animal</span>
              <button onClick={() => navigate(-1)} className="text-[18px] text-text-secondary font-semibold bg-transparent border-none cursor-pointer">✕</button>
            </div>

            <div className="flex-1 overflow-auto p-[20px_22px]">
              <div className="flex gap-[14px]">
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-text-secondary mb-[7px] tracking-[.02em] uppercase">Brinco *</div>
                  <input
                    value={form.brinco}
                    onChange={e => update('brinco', e.target.value)}
                    placeholder="0000"
                    className="w-full bg-white border-[1.5px] border-primary rounded-sidebar-item py-[12px] px-[14px] font-mono text-[18px] font-bold text-primary-dark outline-none mb-[16px]"
                  />
                </div>
                <div className="w-[120px]">
                  <div className="text-[12px] font-bold text-text-secondary mb-[7px] tracking-[.02em] uppercase">Sexo</div>
                  <div className="flex bg-segmented-bg rounded-sidebar-item p-[4px] mb-[16px]">
                    <button
                      type="button"
                      onClick={() => update('sexo', 'femea')}
                      className={`flex-1 text-center py-[10px] text-[13.5px] font-bold rounded-[8px] cursor-pointer border-none ${form.sexo === 'femea' ? 'bg-primary text-white' : 'text-text-secondary bg-transparent'}`}
                    >F</button>
                    <button
                      type="button"
                      onClick={() => update('sexo', 'macho')}
                      className={`flex-1 text-center py-[10px] text-[13.5px] font-bold rounded-[8px] cursor-pointer border-none ${form.sexo === 'macho' ? 'bg-primary text-white' : 'text-text-secondary bg-transparent'}`}
                    >M</button>
                  </div>
                </div>
              </div>

              <Select
                label="Raça"
                value={form.raca}
                onChange={e => update('raca', e.target.value)}
                options={racas.map(r => ({ value: r, label: r }))}
                className="mb-[16px]"
              />

              <div className="flex gap-[14px]">
                <Input
                  label="Nascimento"
                  type="date"
                  value={form.nascimento}
                  onChange={e => update('nascimento', e.target.value)}
                  className="flex-1 mb-[16px]"
                />
                <Select
                  label="Origem"
                  value={form.origem}
                  onChange={e => update('origem', e.target.value)}
                  options={[{ value: 'nascido_aqui', label: 'Nascido aqui' }, { value: 'comprado', label: 'Comprado' }]}
                  className="flex-1 mb-[16px]"
                />
              </div>

              <Select
                label="Lote"
                value={form.lote_id}
                onChange={e => update('lote_id', e.target.value)}
                options={(lotes || []).map(l => ({ value: String(l.id), label: l.nome }))}
                className="mb-[4px]"
              />
            </div>

            <div className="py-[13px] px-[22px] border-t border-border bg-white flex gap-[10px] justify-end">
              <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
              <button
                disabled={salvando}
                onClick={async () => {
                  setSalvando(true)
                  try {
                    await api.animais.criar({
                      brinco: form.brinco,
                      sexo: form.sexo === 'femea' ? 'Fêmea' : 'Macho',
                      raca: form.raca,
                      data_nascimento: form.nascimento,
                      origem: form.origem,
                      lote_id: form.lote_id || null,
                    })
                    navigate('/animais')
                  } finally { setSalvando(false) }
                }}
                className="bg-primary text-white rounded-sidebar-item py-[10px] px-[20px] text-[14px] font-extrabold cursor-pointer border-none disabled:opacity-50"
              >{salvando ? 'Salvando…' : 'Salvar animal'}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function AnimalCadastroPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopCadastro /> : <MobileCadastro />
}
