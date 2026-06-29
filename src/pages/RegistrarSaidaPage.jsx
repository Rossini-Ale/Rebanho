import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SegmentedControl from '../components/ui/SegmentedControl'
import { api } from '../lib/api'
import { ChevronLeft } from 'lucide-react'

function SaidaForm({ animais, form, update }) {
  const animal = (animais || []).find(a => String(a.id) === form.animalId)
  const pesoNum = parseFloat(form.pesoSaida) || 0
  const precoNum = parseFloat(form.precoArroba) || 0
  const arrobas = pesoNum > 0 ? Math.round(pesoNum / 15) : 0
  const valorTotal = arrobas * precoNum

  return (
    <>
      <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">Tipo de saída</div>
      <SegmentedControl options={[{ value: 'venda', label: 'Venda' }, { value: 'morte', label: 'Morte' }, { value: 'transferencia', label: 'Transf.' }]} value={form.tipo} onChange={v => update('tipo', v)} className="mb-[18px]" />

      <Select label="Animal" value={form.animalId} onChange={e => update('animalId', e.target.value)} options={(animais || []).map(a => ({ value: String(a.id), label: `${a.brinco} · ${a.raca} · ${a.lote_nome || ''} · ${a.peso_atual ? parseFloat(a.peso_atual) + ' kg' : ''}` }))} className="mb-[18px]" />

      {form.tipo === 'venda' && (
        <>
          <div className="flex gap-[12px] mb-[18px]">
            <Input label="Peso saída (kg)" value={form.pesoSaida} onChange={e => update('pesoSaida', e.target.value)} mono placeholder="0" className="flex-1" />
            <Input label="R$ / @" value={form.precoArroba} onChange={e => update('precoArroba', e.target.value)} mono placeholder="0" className="flex-1" />
          </div>
          <Input label="Comprador" value={form.comprador} onChange={e => update('comprador', e.target.value)} placeholder="Nome do comprador" className="mb-[18px]" />
          {valorTotal > 0 && (
            <div className="bg-primary rounded-[16px] p-[16px_18px] flex justify-between items-center">
              <div className="text-[13px] text-accent-light font-semibold">Valor total ({arrobas} @)</div>
              <div className="font-mono text-[24px] font-bold text-white">R$ {valorTotal.toLocaleString('pt-BR')}</div>
            </div>
          )}
        </>
      )}

      {form.tipo === 'morte' && (
        <Input label="Observação" value={form.observacao} onChange={e => update('observacao', e.target.value)} placeholder="Causa da morte" className="mb-[18px]" />
      )}
    </>
  )
}

export default function RegistrarSaidaPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { data: animais } = useApi(() => api.animais.listar(), [])
  const [form, setForm] = useState({
    tipo: 'venda', animalId: searchParams.get('animal') || '',
    pesoSaida: '', precoArroba: '', comprador: '', observacao: '',
  })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))

  const [salvando, setSalvando] = useState(false)

  const handleSave = async () => {
    if (!form.animalId) return
    setSalvando(true)
    try {
      const situacao = form.tipo === 'venda' ? 'vendido' : form.tipo === 'morte' ? 'morto' : 'ativo'
      await api.animais.atualizar(form.animalId, { situacao })

      if (form.tipo === 'venda' && form.pesoSaida && form.precoArroba) {
        const arrobas = Math.round(parseFloat(form.pesoSaida) / 15)
        const valor = arrobas * parseFloat(form.precoArroba)
        await api.financeiro.criar({
          escopo: 'animal', animal_id: form.animalId, tipo: 'venda',
          categoria: 'Venda de gado', valor, data: new Date().toISOString().slice(0, 10),
          descricao: `Venda ${form.comprador ? '· ' + form.comprador : ''} · ${form.pesoSaida} kg`,
        })
      }
      navigate('/animais')
    } finally { setSalvando(false) }
  }

  const content = <SaidaForm animais={animais} form={form} update={update} />
  const ctaLabel = form.tipo === 'venda' ? 'Confirmar venda' : form.tipo === 'morte' ? 'Registrar morte' : 'Confirmar transferência'

  if (isDesktop) {
    return (
      <>
        <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
          <div><div className="text-[21px] font-extrabold text-primary-dark">Registrar saída</div></div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-header-bg relative">
          <div className="absolute inset-0 bg-[rgba(20,30,22,0.45)] flex items-center justify-center z-10">
            <div className="w-[470px] max-h-[88%] bg-bg rounded-[16px] shadow-[0_30px_70px_rgba(0,0,0,0.32)] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center py-[17px] px-[22px] border-b border-border bg-white">
                <span className="text-[17px] font-extrabold text-primary-dark">Registrar saída</span>
                <button onClick={() => navigate(-1)} className="text-[18px] text-text-secondary font-semibold bg-transparent border-none cursor-pointer">✕</button>
              </div>
              <div className="flex-1 overflow-auto p-[20px_22px]">{content}</div>
              <div className="py-[13px] px-[22px] border-t border-border bg-white flex gap-[10px] justify-end">
                <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
                <button disabled={salvando} onClick={handleSave} className="bg-primary text-white rounded-sidebar-item py-[10px] px-[20px] text-[14px] font-extrabold cursor-pointer border-none disabled:opacity-50">{salvando ? 'Salvando…' : ctaLabel}</button>
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
        <span className="text-[19px] font-extrabold text-primary-dark">Registrar saída</span>
      </div>
      <div className="flex-1 overflow-auto px-[20px]">{content}</div>
      <div className="px-[20px] py-[12px] pb-[24px]"><Button fullWidth onClick={handleSave} disabled={salvando}>{salvando ? 'Salvando…' : ctaLabel}</Button></div>
    </div>
  )
}
