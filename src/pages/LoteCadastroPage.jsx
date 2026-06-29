import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import SegmentedControl from '../components/ui/SegmentedControl'
import { ChevronLeft } from 'lucide-react'

function MobileCadastro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', tipo: 'pasto', area: '', capacidade: '' })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[14px] px-[20px] pt-[14px] pb-[14px]">
        <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0">
          <ChevronLeft size={24} />
        </button>
        <span className="text-[19px] font-extrabold text-primary-dark">Novo lote</span>
      </div>

      <div className="flex-1 overflow-auto px-[20px]">
        <Input
          label="Nome do lote"
          value={form.nome}
          onChange={e => update('nome', e.target.value)}
          placeholder="Ex: Pasto 4"
          className="mb-[18px]"
        />

        <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">Tipo</div>
        <SegmentedControl
          options={[
            { value: 'pasto', label: 'Pasto' },
            { value: 'curral', label: 'Curral' },
            { value: 'maternidade', label: 'Matern.' },
          ]}
          value={form.tipo}
          onChange={v => update('tipo', v)}
          className="mb-[18px]"
        />

        <Input
          label="Área (ha)"
          value={form.area}
          onChange={e => update('area', e.target.value)}
          mono
          placeholder="0"
          className="mb-[18px]"
        />

        <Input
          label="Capacidade (cabeças)"
          value={form.capacidade}
          onChange={e => update('capacidade', e.target.value)}
          mono
          placeholder="0"
          className="mb-[14px]"
        />

        <div className="bg-[#eef0e9] rounded-button p-[13px_16px] text-[13px] text-text-body font-semibold">
          A capacidade é usada para avisar quando o lote estiver lotado (barra vermelha).
        </div>
      </div>

      <div className="px-[20px] py-[12px] pb-[24px] bg-bg">
        <Button fullWidth onClick={() => navigate('/lotes')}>Criar lote</Button>
      </div>
    </div>
  )
}

function DesktopCadastro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', tipo: 'pasto', area: '', capacidade: '' })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark">Lotes & pastos</div>
          <div className="text-[13px] text-text-secondary font-medium">Novo cadastro</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-header-bg relative">
        <div className="absolute inset-0 bg-[rgba(20,30,22,0.45)] flex items-center justify-center z-10">
          <div className="w-[470px] max-h-[88%] bg-bg rounded-[16px] shadow-[0_30px_70px_rgba(0,0,0,0.32)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center py-[17px] px-[22px] border-b border-border bg-white">
              <span className="text-[17px] font-extrabold text-primary-dark">Novo lote</span>
              <button onClick={() => navigate(-1)} className="text-[18px] text-text-secondary font-semibold bg-transparent border-none cursor-pointer">✕</button>
            </div>

            <div className="flex-1 overflow-auto p-[20px_22px]">
              <Input
                label="Nome do lote"
                value={form.nome}
                onChange={e => update('nome', e.target.value)}
                placeholder="Ex: Pasto 4"
                className="mb-[16px]"
              />

              <div className="text-[12px] font-bold text-text-secondary mb-[7px] tracking-[.02em] uppercase">Tipo</div>
              <SegmentedControl
                options={[
                  { value: 'pasto', label: 'Pasto' },
                  { value: 'curral', label: 'Curral' },
                  { value: 'maternidade', label: 'Matern.' },
                ]}
                value={form.tipo}
                onChange={v => update('tipo', v)}
                className="mb-[16px]"
              />

              <div className="flex gap-[14px]">
                <Input
                  label="Área (ha)"
                  value={form.area}
                  onChange={e => update('area', e.target.value)}
                  mono
                  placeholder="0"
                  className="flex-1 mb-[16px]"
                />
                <Input
                  label="Capacidade (cabeças)"
                  value={form.capacidade}
                  onChange={e => update('capacidade', e.target.value)}
                  mono
                  placeholder="0"
                  className="flex-1 mb-[16px]"
                />
              </div>

              <div className="bg-[#eef0e9] rounded-sidebar-item p-[13px_16px] text-[13px] text-text-body font-semibold">
                A capacidade é usada para avisar quando o lote estiver lotado (barra vermelha).
              </div>
            </div>

            <div className="py-[13px] px-[22px] border-t border-border bg-white flex gap-[10px] justify-end">
              <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
              <button
                onClick={() => navigate('/lotes')}
                className="bg-primary text-white rounded-sidebar-item py-[10px] px-[20px] text-[14px] font-extrabold cursor-pointer border-none"
              >Criar lote</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoteCadastroPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopCadastro /> : <MobileCadastro />
}
