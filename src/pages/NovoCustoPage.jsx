import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SegmentedControl from '../components/ui/SegmentedControl'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import { api } from '../lib/api'
import { categoriasCusto, categoriasReceita } from '../lib/utils'
import { ChevronLeft } from 'lucide-react'

function LancamentoForm({ form, update, lotes, qtdAnimaisLote, categoriasOpts, categoriasReceitaOpts }) {
  const valorNum = parseFloat((form.valor || '0').replace(/\D/g, '')) || 0
  const rateio = form.escopo === 'lote' && valorNum && qtdAnimaisLote > 0 ? Math.round(valorNum / qtdAnimaisLote) : null
  const isReceita = form.natureza === 'receita'
  const cats = isReceita ? (categoriasReceitaOpts || categoriasReceita) : (categoriasOpts || categoriasCusto)

  return (
    <>
      <div className="text-[12.5px] font-bold text-text-secondary mb-[8px] uppercase tracking-[.04em]">Tipo de lançamento</div>
      <SegmentedControl
        options={[{ value: 'custo', label: 'Custo' }, { value: 'receita', label: 'Receita' }]}
        value={form.natureza}
        onChange={v => { update('natureza', v); update('categoria', '') }}
        className="mb-[18px]"
      />

      <div className="text-[12.5px] font-bold text-text-secondary mb-[8px] uppercase tracking-[.04em]">A quem se aplica?</div>
      <SegmentedControl options={[{ value: 'geral', label: 'Geral' }, { value: 'lote', label: 'Lote' }, { value: 'animal', label: 'Animal' }]} value={form.escopo} onChange={v => update('escopo', v)} className="mb-[18px]" />

      {form.escopo === 'lote' && (
        <Select label="Lote" value={form.lote_id} onChange={e => update('lote_id', e.target.value)} options={(lotes || []).map(l => ({ value: String(l.id), label: `${l.nome} · ${l.qtd_animais || 0} animais` }))} className="mb-[18px]" />
      )}

      {form.escopo === 'animal' && (
        <Input label="Brinco do animal" value={form.brinco} onChange={e => update('brinco', e.target.value)} mono placeholder="0000" className="mb-[18px]" />
      )}

      <Select label={isReceita ? 'Categoria da receita' : 'Tipo de custo'} value={form.categoria} onChange={e => update('categoria', e.target.value)} options={cats.map(c => ({ value: c, label: c }))} className="mb-[18px]" />

      <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">{form.escopo === 'lote' ? 'Valor total' : 'Valor'}</div>
      <input value={form.valor} onChange={e => update('valor', e.target.value)} placeholder="R$ 0,00" className={`w-full bg-white border-[1.5px] rounded-button py-[14px] px-[16px] font-mono text-[22px] font-bold outline-none mb-[14px] ${isReceita ? 'border-[#588157] text-primary-medium' : 'border-primary text-primary-dark'}`} />

      {form.escopo === 'lote' && rateio && !isReceita && (
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

      <div className="flex gap-[12px] mb-[18px]">
        <Input label="Data" type="date" value={form.data} onChange={e => update('data', e.target.value)} className="flex-1" />
        {!isReceita && form.escopo === 'geral' && (
          <Select label="Recorre?" value={form.recorrencia} onChange={e => update('recorrencia', e.target.value)} options={[{ value: 'unica', label: 'Única' }, { value: 'mensal', label: 'Mensal' }]} className="flex-1" />
        )}
      </div>

      <Input label="Descrição" value={form.descricao} onChange={e => update('descricao', e.target.value)} placeholder={isReceita ? 'Ex: Venda 15 novilhos — lote norte' : 'Ex: Salário peão — junho'} className="mb-[14px]" />

      <div className={`rounded-button p-[13px_16px] text-[13px] font-semibold ${isReceita ? 'bg-[#e7ece4] text-primary' : 'bg-[#eef0e9] text-text-body'}`}>
        {isReceita && form.escopo === 'geral' && <>Entra como <b>receita</b> no resultado geral da fazenda.</>}
        {isReceita && form.escopo === 'lote' && <>Receita vinculada ao lote — aparece no resultado financeiro do lote.</>}
        {isReceita && form.escopo === 'animal' && <>Receita vinculada ao animal <b>{form.brinco || '____'}</b>.</>}
        {!isReceita && form.escopo === 'geral' && <>Entra só no resultado <b>geral</b> da fazenda, não é atribuído a nenhum animal.</>}
        {!isReceita && form.escopo === 'lote' && qtdAnimaisLote > 0 && <>Cada animal do lote recebe <b>R$ {rateio || '—'}</b> no histórico de custo — sem precisar lançar um por um.</>}
        {!isReceita && form.escopo === 'animal' && <>Vai direto pro histórico do <b>{form.brinco || '____'}</b> e entra no custo individual dele.</>}
      </div>
    </>
  )
}

const defaultForm = () => ({
  natureza: 'custo', escopo: 'geral', lote_id: '', brinco: '', categoria: '',
  valor: '', data: new Date().toISOString().slice(0, 10), recorrencia: 'unica', descricao: '',
})

function MobileLancamento() {
  const navigate = useNavigate()
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const { data: catConfig } = useApi(() => api.configuracoes.buscar('categorias_custo').catch(() => null), [])
  const { data: catRecConfig } = useApi(() => api.configuracoes.buscar('categorias_receita').catch(() => null), [])
  const catList = catConfig?.valor || categoriasCusto
  const catRecList = catRecConfig?.valor || categoriasReceita
  const [form, setForm] = useState(defaultForm())
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))
  const loteObj = (lotes || []).find(l => String(l.id) === form.lote_id)
  const qtd = loteObj?.qtd_animais || 0
  const isReceita = form.natureza === 'receita'

  const handleSave = async () => {
    if (!form.categoria) { alert('Selecione a categoria'); return }
    const raw = parseFloat((form.valor || '0').replace(/\D/g, ''))
    if (!raw || raw <= 0) { alert('Informe um valor válido'); return }
    if (!form.data) { alert('Informe a data'); return }
    if (form.escopo === 'lote' && !form.lote_id) { alert('Selecione o lote'); return }
    const valorNum = isReceita ? Math.abs(raw) : -Math.abs(raw)
    await api.financeiro.criar({
      escopo: form.escopo, lote_id: form.escopo === 'lote' ? form.lote_id : null,
      tipo: isReceita ? 'venda' : 'custo', categoria: form.categoria,
      valor: valorNum, data: form.data, recorrencia: form.recorrencia, descricao: form.descricao,
    })
    navigate('/financeiro')
  }

  const ctaLabel = isReceita
    ? (form.escopo === 'lote' ? 'Registrar receita' : form.escopo === 'animal' ? `Receita no ${form.brinco}` : 'Salvar receita')
    : (form.escopo === 'lote' ? `Lançar nos ${qtd} animais` : form.escopo === 'animal' ? `Salvar no animal ${form.brinco}` : 'Salvar custo')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[14px] px-[20px] pt-[14px] pb-[14px]">
        <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
        <span className="text-[19px] font-extrabold text-primary-dark">Novo lançamento</span>
      </div>
      <div className="flex-1 overflow-auto px-[20px]">
        <LancamentoForm form={form} update={update} lotes={lotes} qtdAnimaisLote={qtd} categoriasOpts={catList} categoriasReceitaOpts={catRecList} />
      </div>
      <div className="px-[20px] py-[12px] pb-[24px]"><Button fullWidth onClick={handleSave}>{ctaLabel}</Button></div>
    </div>
  )
}

function DesktopLancamento() {
  const navigate = useNavigate()
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const { data: catConfigD } = useApi(() => api.configuracoes.buscar('categorias_custo').catch(() => null), [])
  const { data: catRecConfigD } = useApi(() => api.configuracoes.buscar('categorias_receita').catch(() => null), [])
  const catListD = catConfigD?.valor || categoriasCusto
  const catRecListD = catRecConfigD?.valor || categoriasReceita
  const { toast, showToast, hideToast } = useToast()
  const [form, setForm] = useState({ ...defaultForm(), escopo: 'lote' })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))
  const loteObj = (lotes || []).find(l => String(l.id) === form.lote_id)
  const qtd = loteObj?.qtd_animais || 0
  const isReceita = form.natureza === 'receita'

  const handleSave = async () => {
    if (!form.categoria) { showToast('Selecione a categoria', 'error'); return }
    const raw = parseFloat((form.valor || '0').replace(/\D/g, ''))
    if (!raw || raw <= 0) { showToast('Informe um valor válido', 'error'); return }
    if (!form.data) { showToast('Informe a data', 'error'); return }
    if (form.escopo === 'lote' && !form.lote_id) { showToast('Selecione o lote', 'error'); return }
    try {
      const valorNum = isReceita ? Math.abs(raw) : -Math.abs(raw)
      await api.financeiro.criar({
        escopo: form.escopo, lote_id: form.escopo === 'lote' ? form.lote_id : null,
        tipo: isReceita ? 'venda' : 'custo', categoria: form.categoria,
        valor: valorNum, data: form.data, recorrencia: form.recorrencia, descricao: form.descricao,
      })
      showToast(isReceita ? 'Receita registrada!' : 'Lançamento salvo!')
      setTimeout(() => navigate('/financeiro'), 800)
    } catch (err) {
      showToast(err.message || 'Erro ao salvar lançamento', 'error')
    }
  }

  const ctaLabel = isReceita
    ? 'Salvar receita'
    : (form.escopo === 'lote' ? `Lançar nos ${qtd}` : form.escopo === 'animal' ? 'Salvar no animal' : 'Salvar custo')

  return (
    <>{toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    <Modal
      title="Novo lançamento"
      footer={
        <>
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button onClick={handleSave}>{ctaLabel}</Button>
        </>
      }
    >
      <LancamentoForm form={form} update={update} lotes={lotes} qtdAnimaisLote={qtd} categoriasOpts={catListD} categoriasReceitaOpts={catRecListD} />
    </Modal>
    </>
  )
}

export default function NovoCustoPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopLancamento /> : <MobileLancamento />
}
