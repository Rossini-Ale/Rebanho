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
import { produtosSanitarios } from '../lib/utils'
import { ChevronLeft, ChevronRight, Fence } from 'lucide-react'

function MobileEvento() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loteSel, setLoteSel] = useState(null)
  const [produtoSel, setProdutoSel] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const { data: produtosConfig } = useApi(() => api.configuracoes.buscar('produtos_sanitarios').catch(() => null), [])
  const produtos = produtosConfig?.valor || produtosSanitarios
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const hoje = new Date()
  const dataHoje = hoje.toISOString().slice(0, 10)
  const proxReforco = new Date(hoje)
  proxReforco.setMonth(proxReforco.getMonth() + 6)
  const proxFormatado = proxReforco.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const voltar = () => step === 1 ? navigate(-1) : setStep(s => s - 1)

  const salvar = async () => {
    if (!loteSel || !produtoSel) return
    setSalvando(true)
    try {
      await api.sanidade.criar({
        tipo: 'vacina', aplicado_em: 'lote',
        lote_id: loteSel.id,
        produto: produtoSel,
        data: dataHoje,
        responsavel: user.nome,
      })
      showToast('Evento registrado!')
      setTimeout(() => navigate('/sanidade'), 700)
    } catch (err) {
      showToast(err.message || 'Erro ao registrar evento', 'error')
    } finally { setSalvando(false) }
  }

  const ProgressBar = () => (
    <div className="flex gap-[4px] px-[20px] mb-[22px]">
      {[1, 2, 3].map(i => (
        <div key={i} className={`h-[3px] flex-1 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-segmented-bg'}`} />
      ))}
    </div>
  )

  const backBtn = (
    <button onClick={voltar} className="text-primary bg-transparent border-none cursor-pointer p-0 mb-[10px]">
      <ChevronLeft size={24} />
    </button>
  )

  if (step === 1) return (
    <div className="flex flex-col h-full">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="px-[20px] pt-[14px] pb-[8px]">
        {backBtn}
        <div className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">PASSO 1 DE 3</div>
        <div className="text-[26px] font-extrabold text-primary-dark mt-[2px]">Qual lote?</div>
        <div className="text-[13.5px] text-text-secondary mt-[4px]">A vacina é aplicada em todos os animais do lote.</div>
      </div>
      <ProgressBar />
      <div className="flex-1 overflow-auto px-[20px] flex flex-col gap-[10px]">
        {(lotes || []).map(l => (
          <button
            key={l.id}
            onClick={() => { setLoteSel(l); setStep(2) }}
            className={`w-full border rounded-[16px] py-[16px] px-[18px] flex items-center gap-[14px] text-left cursor-pointer transition-colors ${loteSel?.id === l.id ? 'bg-chip-bg border-primary' : 'bg-white border-[#eee9df]'}`}
          >
            <div className="w-[40px] h-[40px] rounded-[10px] bg-chip-bg flex items-center justify-center shrink-0">
              <Fence size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-[16px] font-bold text-primary-dark">{l.nome}</div>
              <div className="text-[12.5px] text-text-secondary">{l.qtd_animais || 0} animais</div>
            </div>
            <ChevronRight size={18} className="text-text-secondary" />
          </button>
        ))}
      </div>
    </div>
  )

  if (step === 2) return (
    <div className="flex flex-col h-full">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="px-[20px] pt-[14px] pb-[8px]">
        {backBtn}
        <div className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">PASSO 2 DE 3 · {loteSel?.nome?.toUpperCase()}</div>
        <div className="text-[26px] font-extrabold text-primary-dark mt-[2px]">Qual produto?</div>
      </div>
      <ProgressBar />
      <div className="flex-1 overflow-auto px-[20px] flex flex-col gap-[10px]">
        {produtos.map(p => (
          <button
            key={p}
            onClick={() => { setProdutoSel(p); setStep(3) }}
            className={`w-full border rounded-[16px] py-[16px] px-[18px] flex items-center gap-[14px] text-left cursor-pointer transition-colors ${produtoSel === p ? 'bg-chip-bg border-primary' : 'bg-white border-[#eee9df]'}`}
          >
            <div className={`w-[20px] h-[20px] rounded-full border-[2px] flex items-center justify-center shrink-0 ${produtoSel === p ? 'border-primary' : 'border-[#cfd4c7]'}`}>
              {produtoSel === p && <div className="w-[10px] h-[10px] rounded-full bg-primary" />}
            </div>
            <span className="text-[15px] font-bold text-primary-dark">{p}</span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="px-[20px] pt-[14px] pb-[8px]">
        {backBtn}
        <div className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">PASSO 3 DE 3</div>
        <div className="text-[26px] font-extrabold text-primary-dark mt-[2px]">Confere?</div>
      </div>
      <ProgressBar />
      <div className="flex-1 overflow-auto px-[20px]">
        <div className="bg-primary rounded-[18px] p-[24px] mb-[16px] text-center">
          <div className="text-[11px] text-accent-light font-bold uppercase tracking-wider mb-[6px]">APLICAR {produtoSel?.toUpperCase()} EM</div>
          <div className="font-mono text-[60px] font-bold text-white leading-none">{loteSel?.qtd_animais || 0}</div>
          <div className="text-[16px] text-accent-light font-semibold mt-[4px]">animais do {loteSel?.nome}</div>
        </div>
        <div className="flex justify-between items-center py-[13px] border-b border-[#f0ede4]">
          <span className="text-[14px] font-semibold text-text-secondary">Data</span>
          <span className="text-[14px] font-bold text-primary-dark">Hoje · {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
        </div>
        <div className="flex justify-between items-center py-[13px] border-b border-[#f0ede4]">
          <span className="text-[14px] font-semibold text-text-secondary">Responsável</span>
          <span className="text-[14px] font-bold text-primary-dark">{user.nome || 'Você'}</span>
        </div>
        <div className="flex items-start gap-[8px] py-[13px] text-[13px] text-text-secondary font-medium">
          <span className="shrink-0">🗓</span>
          <span>Próximo reforço será criado para <span className="font-bold text-primary-dark">{proxFormatado}</span>.</span>
        </div>
      </div>
      <div className="px-[20px] py-[12px] pb-[24px]">
        <Button fullWidth onClick={salvar} disabled={salvando}>
          {salvando ? 'Aplicando…' : `✓ Aplicar a ${loteSel?.qtd_animais || 0} animais`}
        </Button>
      </div>
    </div>
  )
}

function DesktopEvento() {
  const navigate = useNavigate()
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const { data: produtosConfigD } = useApi(() => api.configuracoes.buscar('produtos_sanitarios').catch(() => null), [])
  const produtosD = produtosConfigD?.valor || produtosSanitarios
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { data: usuarios } = useApi(() => user.fazenda_id ? api.fazendas.usuarios(user.fazenda_id) : Promise.resolve([]), [])
  const [form, setForm] = useState({
    alvo: 'lote', lote_id: '', brinco: '', tipo: 'vacina',
    produto: produtosSanitarios[0], dose: '',
    data: new Date().toISOString().slice(0, 10), responsavel: JSON.parse(localStorage.getItem('user') || '{}').nome || '',
  })
  const { toast, showToast, hideToast } = useToast()
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))
  const loteObj = (lotes || []).find(l => String(l.id) === form.lote_id)
  const qtd = loteObj?.qtd_animais || 0

  const handleSave = async () => {
    if (form.alvo === 'lote' && !form.lote_id) { showToast('Selecione o lote', 'error'); return }
    if (!form.produto) { showToast('Selecione o produto', 'error'); return }
    if (!form.data) { showToast('Informe a data', 'error'); return }
    try {
      await api.sanidade.criar({
        tipo: form.tipo, aplicado_em: form.alvo,
        lote_id: form.alvo === 'lote' ? form.lote_id : null,
        produto: form.produto, dose: form.dose, data: form.data, responsavel: form.responsavel,
      })
      showToast('Evento registrado!')
      setTimeout(() => navigate('/sanidade'), 800)
    } catch (err) {
      showToast(err.message || 'Erro ao registrar evento', 'error')
    }
  }

  return (
    <>{toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    <Modal
      title="Evento sanitário"
      subtitle="Registrar vacina, vermífugo ou exame"
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button onClick={handleSave}>{form.alvo === 'lote' ? `Aplicar a ${qtd}` : 'Salvar evento'}</Button>
        </>
      }
    >
      {form.alvo === 'lote' && loteObj && (
        <div className="bg-primary rounded-[12px] p-[14px_16px] mb-[16px] flex justify-between items-center">
          <div><div className="text-[12px] text-accent-light font-semibold">Lote</div><div className="text-[18px] font-extrabold text-white">{loteObj.nome}</div></div>
          <div className="text-right"><div className="font-mono text-[22px] font-bold text-white">{qtd}</div><div className="text-[11px] text-accent-light">animais</div></div>
        </div>
      )}
      <div className="text-[12px] font-bold text-text-secondary mb-[7px] tracking-[.02em] uppercase">Aplicar a</div>
      <SegmentedControl options={[{ value: 'animal', label: 'Animal' }, { value: 'lote', label: 'Lote' }]} value={form.alvo} onChange={v => update('alvo', v)} className="mb-[16px]" />
      {form.alvo === 'lote' && <Select label="Lote" value={form.lote_id} onChange={e => update('lote_id', e.target.value)} options={(lotes || []).map(l => ({ value: String(l.id), label: `${l.nome} · ${l.qtd_animais || 0} animais` }))} className="mb-[16px]" />}
      <Select label="Produto" value={form.produto} onChange={e => update('produto', e.target.value)} options={produtosD.map(p => ({ value: p, label: p }))} className="mb-[16px]" />
      <div className="flex gap-[14px]">
        <Input label="Dose" value={form.dose} onChange={e => update('dose', e.target.value)} className="flex-1 mb-[16px]" />
        <Input label="Data" type="date" value={form.data} onChange={e => update('data', e.target.value)} className="flex-1 mb-[16px]" />
      </div>
      <Select label="Responsável" value={form.responsavel} onChange={e => update('responsavel', e.target.value)} options={(usuarios || []).map(u => ({ value: u.nome, label: u.nome }))} className="mb-[4px]" />
    </Modal>
    </>
  )
}

export default function EventoSanitarioPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopEvento /> : <MobileEvento />
}
