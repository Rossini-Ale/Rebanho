import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SegmentedControl from '../components/ui/SegmentedControl'
import { api } from '../lib/api'
import { produtosSanitarios } from '../lib/utils'
import { ChevronLeft } from 'lucide-react'

function MobileEvento() {
  const navigate = useNavigate()
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const { data: produtosConfig } = useApi(() => api.configuracoes.buscar('produtos_sanitarios').catch(() => null), [])
  const produtos = produtosConfig?.valor || produtosSanitarios
  const [form, setForm] = useState({
    alvo: 'lote', lote_id: '', brinco: '', tipo: 'vacina',
    produto: produtosSanitarios[0], dose: '',
    data: new Date().toISOString().slice(0, 10),
  })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))
  const loteObj = (lotes || []).find(l => String(l.id) === form.lote_id)
  const qtd = loteObj?.qtd_animais || 0

  const handleSave = async () => {
    await api.sanidade.criar({
      tipo: form.tipo, aplicado_em: form.alvo,
      lote_id: form.alvo === 'lote' ? form.lote_id : null,
      animal_id: form.alvo === 'animal' ? form.brinco : null,
      produto: form.produto, dose: form.dose, data: form.data,
    })
    navigate('/sanidade')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[14px] px-[20px] pt-[14px] pb-[14px]">
        <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
        <span className="text-[19px] font-extrabold text-primary-dark">Novo evento</span>
      </div>
      <div className="flex-1 overflow-auto px-[20px]">
        <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">Aplicar a</div>
        <SegmentedControl options={[{ value: 'animal', label: 'Animal' }, { value: 'lote', label: 'Lote' }]} value={form.alvo} onChange={v => update('alvo', v)} className="mb-[18px]" />
        {form.alvo === 'lote' && <Select label="Lote" value={form.lote_id} onChange={e => update('lote_id', e.target.value)} options={(lotes || []).map(l => ({ value: String(l.id), label: `${l.nome} · ${l.qtd_animais || 0} animais` }))} className="mb-[18px]" />}
        {form.alvo === 'animal' && <Input label="Brinco do animal" value={form.brinco} onChange={e => update('brinco', e.target.value)} mono placeholder="0000" className="mb-[18px]" />}
        <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">Tipo</div>
        <SegmentedControl options={[{ value: 'vacina', label: 'Vacina' }, { value: 'vermifugo', label: 'Vermíf.' }, { value: 'exame', label: 'Exame' }]} value={form.tipo} onChange={v => update('tipo', v)} className="mb-[18px]" />
        <Select label="Produto" value={form.produto} onChange={e => update('produto', e.target.value)} options={produtos.map(p => ({ value: p, label: p }))} className="mb-[18px]" />
        <div className="flex gap-[12px] mb-[18px]">
          <Input label="Dose" value={form.dose} onChange={e => update('dose', e.target.value)} placeholder="5 ml" className="flex-1" />
          <Input label="Data" type="date" value={form.data} onChange={e => update('data', e.target.value)} className="flex-1" />
        </div>
        <div className="bg-[#eef0e9] rounded-button p-[13px_16px] text-[13px] text-text-body font-semibold">Gera o próximo reforço automaticamente e registra no histórico de cada animal.</div>
      </div>
      <div className="px-[20px] py-[12px] pb-[24px]">
        <Button fullWidth onClick={handleSave}>{form.alvo === 'lote' ? `Aplicar a ${qtd} animais` : 'Salvar evento'}</Button>
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
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))
  const loteObj = (lotes || []).find(l => String(l.id) === form.lote_id)
  const qtd = loteObj?.qtd_animais || 0

  const handleSave = async () => {
    await api.sanidade.criar({
      tipo: form.tipo, aplicado_em: form.alvo,
      lote_id: form.alvo === 'lote' ? form.lote_id : null,
      produto: form.produto, dose: form.dose, data: form.data, responsavel: form.responsavel,
    })
    navigate('/sanidade')
  }

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div><div className="text-[21px] font-extrabold text-primary-dark">Sanidade</div><div className="text-[13px] text-text-secondary font-medium">Novo evento sanitário</div></div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-header-bg relative">
        <div className="absolute inset-0 bg-[rgba(20,30,22,0.45)] flex items-center justify-center z-10">
          <div className="w-[470px] max-h-[88%] bg-bg rounded-[16px] shadow-[0_30px_70px_rgba(0,0,0,0.32)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center py-[17px] px-[22px] border-b border-border bg-white">
              <span className="text-[17px] font-extrabold text-primary-dark">{form.alvo === 'lote' ? 'Vacinar lote' : 'Novo evento'}</span>
              <button onClick={() => navigate(-1)} className="text-[18px] text-text-secondary font-semibold bg-transparent border-none cursor-pointer">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-[20px_22px]">
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
            </div>
            <div className="py-[13px] px-[22px] border-t border-border bg-white flex gap-[10px] justify-end">
              <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
              <button onClick={handleSave} className="bg-primary text-white rounded-sidebar-item py-[10px] px-[20px] text-[14px] font-extrabold cursor-pointer border-none">{form.alvo === 'lote' ? `Aplicar a ${qtd}` : 'Salvar evento'}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function EventoSanitarioPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopEvento /> : <MobileEvento />
}
