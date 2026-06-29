import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SegmentedControl from '../components/ui/SegmentedControl'
import { api } from '../lib/api'
import { categoriasCusto } from '../lib/utils'
import { ChevronLeft } from 'lucide-react'

function CustoForm({ form, update, lotes, qtdAnimaisLote }) {
  const valorNum = parseFloat((form.valor || '0').replace(/\D/g, '')) || 0
  const rateio = form.escopo === 'lote' && valorNum && qtdAnimaisLote > 0 ? Math.round(valorNum / qtdAnimaisLote) : null

  return (
    <>
      <div className="text-[12.5px] font-bold text-text-secondary mb-[8px] uppercase tracking-[.04em]">A quem se aplica?</div>
      <SegmentedControl options={[{ value: 'geral', label: 'Geral' }, { value: 'lote', label: 'Lote' }, { value: 'animal', label: 'Animal' }]} value={form.escopo} onChange={v => update('escopo', v)} className="mb-[18px]" />

      {form.escopo === 'lote' && (
        <Select label="Lote" value={form.lote_id} onChange={e => update('lote_id', e.target.value)} options={(lotes || []).map(l => ({ value: String(l.id), label: `${l.nome} · ${l.qtd_animais || 0} animais` }))} className="mb-[18px]" />
      )}

      {form.escopo === 'animal' && (
        <Input label="Brinco do animal" value={form.brinco} onChange={e => update('brinco', e.target.value)} mono placeholder="0000" className="mb-[18px]" />
      )}

      <Select label="Tipo de custo" value={form.categoria} onChange={e => update('categoria', e.target.value)} options={categoriasCusto.map(c => ({ value: c, label: c }))} className="mb-[18px]" />

      <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">{form.escopo === 'lote' ? 'Valor total' : 'Valor'}</div>
      <input value={form.valor} onChange={e => update('valor', e.target.value)} placeholder="R$ 0,00" className="w-full bg-white border-[1.5px] border-primary rounded-button py-[14px] px-[16px] font-mono text-[22px] font-bold text-primary-dark outline-none mb-[14px]" />

      {form.escopo === 'lote' && rateio && (
        <div className="bg-primary rounded-[16px] p-[16px_18px] mb-[14px] flex justify-between items-center">
          <div>
            <div className="text-[12.5px] text-accent-light font-semibold">Rateio automático</div>
            <div className="text-[15px] font-bold text-white">R$ {form.valor} ÷ {qtdAnimaisLote} cabeças</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[22px] font-bold text-white">R$ {rateio}</div>
            <div className="text-[11px] text-accent-light font-semibold">por animal</div>
          </div>
        </div>
      )}

      {form.escopo === 'geral' && (
        <div className="flex gap-[12px] mb-[18px]">
          <Input label="Data" type="date" value={form.data} onChange={e => update('data', e.target.value)} className="flex-1" />
          <Select label="Recorre?" value={form.recorrencia} onChange={e => update('recorrencia', e.target.value)} options={[{ value: 'unica', label: 'Única' }, { value: 'mensal', label: 'Mensal' }]} className="flex-1" />
        </div>
      )}

      {form.escopo === 'geral' && <Input label="Descrição" value={form.descricao} onChange={e => update('descricao', e.target.value)} placeholder="Ex: Salário peão — junho" className="mb-[14px]" />}

      <div className="bg-[#eef0e9] rounded-button p-[13px_16px] text-[13px] text-text-body font-semibold">
        {form.escopo === 'geral' && <>Entra só no resultado <b>geral</b> da fazenda, não é atribuído a nenhum animal.</>}
        {form.escopo === 'lote' && qtdAnimaisLote > 0 && <>Cada animal do lote recebe <b>R$ {rateio || '—'}</b> no histórico de custo — sem precisar lançar um por um.</>}
        {form.escopo === 'animal' && <>Vai direto pro histórico do <b>{form.brinco || '____'}</b> e entra no custo individual dele.</>}
      </div>
    </>
  )
}

function MobileCusto() {
  const navigate = useNavigate()
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const [form, setForm] = useState({ escopo: 'geral', lote_id: '', brinco: '', categoria: categoriasCusto[0], valor: '', data: new Date().toISOString().slice(0, 10), recorrencia: 'unica', descricao: '' })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))
  const loteObj = (lotes || []).find(l => String(l.id) === form.lote_id)
  const qtd = loteObj?.qtd_animais || 0

  const handleSave = async () => {
    const valorNum = -Math.abs(parseFloat((form.valor || '0').replace(/\D/g, '')))
    await api.financeiro.criar({ escopo: form.escopo, lote_id: form.escopo === 'lote' ? form.lote_id : null, tipo: 'custo', categoria: form.categoria, valor: valorNum, data: form.data, recorrencia: form.recorrencia, descricao: form.descricao })
    navigate('/financeiro')
  }

  const ctaLabel = form.escopo === 'lote' ? `Lançar nos ${qtd} animais` : form.escopo === 'animal' ? `Salvar no animal ${form.brinco}` : 'Salvar custo'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[14px] px-[20px] pt-[14px] pb-[14px]">
        <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
        <span className="text-[19px] font-extrabold text-primary-dark">Novo custo</span>
      </div>
      <div className="flex-1 overflow-auto px-[20px]"><CustoForm form={form} update={update} lotes={lotes} qtdAnimaisLote={qtd} /></div>
      <div className="px-[20px] py-[12px] pb-[24px]"><Button fullWidth onClick={handleSave}>{ctaLabel}</Button></div>
    </div>
  )
}

function DesktopCusto() {
  const navigate = useNavigate()
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const [form, setForm] = useState({ escopo: 'lote', lote_id: '', brinco: '', categoria: 'Ração & suplemento', valor: '1.700', data: new Date().toISOString().slice(0, 10), recorrencia: 'unica', descricao: '' })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))
  const loteObj = (lotes || []).find(l => String(l.id) === form.lote_id)
  const qtd = loteObj?.qtd_animais || 0

  const handleSave = async () => {
    const valorNum = -Math.abs(parseFloat((form.valor || '0').replace(/\D/g, '')))
    await api.financeiro.criar({ escopo: form.escopo, lote_id: form.escopo === 'lote' ? form.lote_id : null, tipo: 'custo', categoria: form.categoria, valor: valorNum, data: form.data, recorrencia: form.recorrencia, descricao: form.descricao })
    navigate('/financeiro')
  }

  const ctaLabel = form.escopo === 'lote' ? `Lançar nos ${qtd}` : form.escopo === 'animal' ? 'Salvar no animal' : 'Salvar custo'

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div><div className="text-[21px] font-extrabold text-primary-dark">Financeiro</div><div className="text-[13px] text-text-secondary font-medium">Novo lançamento</div></div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-header-bg relative">
        <div className="absolute inset-0 bg-[rgba(20,30,22,0.45)] flex items-center justify-center z-10">
          <div className="w-[470px] max-h-[88%] bg-bg rounded-[16px] shadow-[0_30px_70px_rgba(0,0,0,0.32)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center py-[17px] px-[22px] border-b border-border bg-white">
              <span className="text-[17px] font-extrabold text-primary-dark">Novo custo</span>
              <button onClick={() => navigate(-1)} className="text-[18px] text-text-secondary font-semibold bg-transparent border-none cursor-pointer">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-[20px_22px]"><CustoForm form={form} update={update} lotes={lotes} qtdAnimaisLote={qtd} /></div>
            <div className="py-[13px] px-[22px] border-t border-border bg-white flex gap-[10px] justify-end">
              <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
              <button onClick={handleSave} className="bg-primary text-white rounded-sidebar-item py-[10px] px-[20px] text-[14px] font-extrabold cursor-pointer border-none">{ctaLabel}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function NovoCustoPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopCusto /> : <MobileCusto />
}
