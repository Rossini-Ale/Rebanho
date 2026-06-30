import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { ChevronLeft, CheckSquare, Square } from 'lucide-react'

// ── modo animal individual ────────────────────────────────────────────────────

function SaidaAnimalForm({ animais, form, update }) {
  const pesoNum = parseFloat(form.pesoSaida) || 0
  const precoNum = parseFloat(form.precoArroba) || 0
  const arrobas = pesoNum > 0 ? Math.round(pesoNum / 15) : 0
  const valorTotal = arrobas * precoNum

  return (
    <>
      <Select
        label="Animal"
        value={form.animalId}
        onChange={e => update('animalId', e.target.value)}
        options={(animais || []).map(a => ({ value: String(a.id), label: `${a.brinco} · ${a.raca} · ${a.lote_nome || ''} · ${a.peso_atual ? parseFloat(a.peso_atual) + ' kg' : ''}` }))}
        className="mb-[18px]"
      />
      {form.tipo === 'venda' && (
        <>
          <div className="flex gap-[12px] mb-[18px]">
            <Input label="Peso saída (kg)" value={form.pesoSaida} onChange={e => update('pesoSaida', e.target.value)} mono placeholder="0" className="flex-1" />
            <Input label="R$ / @" value={form.precoArroba} onChange={e => update('precoArroba', e.target.value)} mono placeholder="0" className="flex-1" />
          </div>
          <Input label="Comprador" value={form.comprador} onChange={e => update('comprador', e.target.value)} placeholder="Nome do comprador" className="mb-[18px]" />
          {valorTotal > 0 && (
            <div className="bg-primary rounded-[16px] p-[14px_18px] flex justify-between items-center">
              <div className="text-[13px] text-accent-light font-semibold">Valor total ({arrobas} @)</div>
              <div className="font-mono text-[22px] font-bold text-white">R$ {valorTotal.toLocaleString('pt-BR')}</div>
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

// ── modo lote ─────────────────────────────────────────────────────────────────

function SaidaLoteForm({ lotes, loteId, onLoteChange, precoArroba, onPrecoChange, comprador, onCompradorChange, selecionados, onToggle, onSelectAll }) {
  const { data: animaisDoLote } = useApi(
    () => loteId ? api.lotes.animais(loteId) : Promise.resolve([]),
    [loteId]
  )
  const lista = animaisDoLote || []
  const todosSelected = lista.length > 0 && lista.every(a => selecionados[a.id])

  const calcValor = (a) => {
    const peso = a.peso_atual ? parseFloat(a.peso_atual) : 0
    const arrobas = peso > 0 ? Math.round(peso / 15) : 0
    return arrobas * (parseFloat(precoArroba) || 0)
  }

  const totalGeral = lista.filter(a => selecionados[a.id]).reduce((s, a) => s + calcValor(a), 0)
  const qtdSel = Object.values(selecionados).filter(Boolean).length

  return (
    <>
      <Select
        label="Lote"
        value={loteId}
        onChange={e => { onLoteChange(e.target.value) }}
        options={(lotes || []).map(l => ({ value: String(l.id), label: `${l.nome} · ${l.qtd_animais || 0} animais` }))}
        className="mb-[16px]"
      />
      <div className="flex gap-[12px] mb-[16px]">
        <Input label="R$ / @" value={precoArroba} onChange={e => onPrecoChange(e.target.value)} mono placeholder="0" className="flex-1" />
        <Input label="Comprador" value={comprador} onChange={e => onCompradorChange(e.target.value)} placeholder="Nome" className="flex-1" />
      </div>

      {lista.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-[8px]">
            <div className="text-[12px] font-bold text-text-secondary uppercase tracking-[.04em]">Selecionar animais</div>
            <button
              onClick={() => onSelectAll(lista, !todosSelected)}
              className="text-[12.5px] font-bold text-primary bg-transparent border-none cursor-pointer"
            >
              {todosSelected ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          </div>
          <div className="flex flex-col gap-[4px] max-h-[260px] overflow-auto border border-[#f0ede4] rounded-[12px] p-[8px]">
            {lista.map(a => {
              const sel = !!selecionados[a.id]
              const valor = calcValor(a)
              return (
                <button
                  key={a.id}
                  onClick={() => onToggle(a.id)}
                  className={`flex items-center gap-[10px] py-[9px] px-[12px] rounded-[9px] border-none cursor-pointer text-left transition-colors ${sel ? 'bg-chip-bg' : 'bg-transparent hover:bg-[#faf9f5]'}`}
                >
                  {sel ? <CheckSquare size={17} className="text-primary shrink-0" /> : <Square size={17} className="text-text-secondary shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[14px] font-bold text-primary-dark">{a.brinco}</div>
                    <div className="text-[12px] text-text-secondary">{a.raca}{a.peso_atual ? ` · ${parseFloat(a.peso_atual)} kg` : ''}</div>
                  </div>
                  {valor > 0 && sel && <span className="font-mono text-[13px] font-bold text-primary-medium shrink-0">R$ {valor.toLocaleString('pt-BR')}</span>}
                </button>
              )
            })}
          </div>
          {totalGeral > 0 && (
            <div className="mt-[12px] bg-primary rounded-[14px] p-[14px_18px] flex justify-between items-center">
              <div>
                <div className="text-[12px] text-accent-light font-semibold">{qtdSel} animais selecionados</div>
                <div className="text-[13px] text-white font-medium">Valor total da venda</div>
              </div>
              <div className="font-mono text-[22px] font-bold text-white">R$ {Math.round(totalGeral).toLocaleString('pt-BR')}</div>
            </div>
          )}
          {lista.length > 0 && qtdSel === 0 && (
            <div className="mt-[8px] text-center text-text-secondary text-[13px] py-[4px]">Selecione os animais que serão vendidos</div>
          )}
        </>
      )}
      {loteId && lista.length === 0 && (
        <div className="text-center text-text-secondary text-[14px] py-[16px]">Nenhum animal ativo neste lote.</div>
      )}
    </>
  )
}

// ── página ────────────────────────────────────────────────────────────────────

export default function RegistrarSaidaPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { toast, showToast, hideToast } = useToast()
  const [salvando, setSalvando] = useState(false)
  const [progresso, setProgresso] = useState(null)

  const [modo, setModo] = useState('animal')
  const [tipo, setTipo] = useState('venda')

  const { data: animais } = useApi(() => api.animais.listar(), [])
  const { data: lotes } = useApi(() => api.lotes.listar(), [])

  // animal mode
  const [form, setForm] = useState({
    animalId: searchParams.get('animal') || '',
    pesoSaida: '', precoArroba: '', comprador: '', observacao: '',
  })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))

  // lote mode
  const [loteId, setLoteId] = useState('')
  const [precoArroba, setPrecoArroba] = useState('')
  const [comprador, setComprador] = useState('')
  const [selecionados, setSelecionados] = useState({})

  const toggleAnimal = (id) => setSelecionados(s => ({ ...s, [id]: !s[id] }))
  const selectAll = (lista, val) => setSelecionados(Object.fromEntries(lista.map(a => [a.id, val])))

  const handleSaveAnimal = async () => {
    if (!form.animalId) { showToast('Selecione o animal', 'error'); return }
    if (tipo === 'venda' && (!form.pesoSaida || parseFloat(form.pesoSaida) <= 0)) { showToast('Informe o peso de saída', 'error'); return }
    if (tipo === 'venda' && (!form.precoArroba || parseFloat(form.precoArroba) <= 0)) { showToast('Informe o preço por arroba', 'error'); return }
    setSalvando(true)
    try {
      const situacao = tipo === 'venda' ? 'vendido' : tipo === 'morte' ? 'morto' : 'ativo'
      await api.animais.atualizar(form.animalId, { situacao })
      if (tipo === 'venda' && form.pesoSaida && form.precoArroba) {
        const arrobas = Math.round(parseFloat(form.pesoSaida) / 15)
        const valor = arrobas * parseFloat(form.precoArroba)
        await api.financeiro.criar({
          escopo: 'animal', animal_id: form.animalId, tipo: 'venda',
          categoria: 'Venda de gado', valor, data: new Date().toISOString().slice(0, 10),
          descricao: `Venda${form.comprador ? ' · ' + form.comprador : ''} · ${form.pesoSaida} kg`,
        })
      }
      showToast('Saída registrada com sucesso!')
      setTimeout(() => navigate('/animais'), 800)
    } catch (err) {
      showToast(err.message || 'Erro ao registrar saída', 'error')
    } finally { setSalvando(false) }
  }

  const handleSaveLote = async () => {
    if (!loteId) { showToast('Selecione o lote', 'error'); return }
    const ids = Object.entries(selecionados).filter(([, v]) => v).map(([id]) => id)
    if (!ids.length) { showToast('Selecione pelo menos um animal', 'error'); return }
    if (!precoArroba || parseFloat(precoArroba) <= 0) { showToast('Informe o preço por arroba', 'error'); return }

    setSalvando(true)
    let ok = 0
    try {
      for (const animalId of ids) {
        const animal = animais?.find(a => String(a.id) === String(animalId))
        await api.animais.atualizar(animalId, { situacao: 'vendido' })
        if (animal?.peso_atual) {
          const arrobas = Math.round(parseFloat(animal.peso_atual) / 15)
          const valor = arrobas * parseFloat(precoArroba)
          if (valor > 0) {
            await api.financeiro.criar({
              escopo: 'animal', animal_id: animalId, tipo: 'venda',
              categoria: 'Venda de gado', valor, data: new Date().toISOString().slice(0, 10),
              descricao: `Venda em lote${comprador ? ' · ' + comprador : ''} · ${animal.peso_atual} kg`,
            })
          }
        }
        ok++
        setProgresso(`${ok}/${ids.length}`)
      }
      showToast(`${ok} animais vendidos!`)
      setTimeout(() => navigate('/animais'), 1000)
    } catch (err) {
      showToast(err.message || 'Erro ao registrar venda', 'error')
    } finally { setSalvando(false); setProgresso(null) }
  }

  const handleSave = modo === 'animal' ? handleSaveAnimal : handleSaveLote
  const ctaAnimal = tipo === 'venda' ? 'Confirmar venda' : tipo === 'morte' ? 'Registrar morte' : 'Confirmar transferência'
  const ctaLote = salvando ? `Salvando… ${progresso || ''}` : `Vender ${Object.values(selecionados).filter(Boolean).length} animais`
  const ctaLabel = modo === 'animal' ? (salvando ? 'Salvando…' : ctaAnimal) : ctaLote

  const modalTitle = modo === 'lote' ? 'Venda em lote' : tipo === 'venda' ? 'Registrar venda' : tipo === 'morte' ? 'Registrar morte' : 'Registrar saída'

  const content = (
    <>
      <SegmentedControl
        options={[{ value: 'animal', label: 'Animal' }, { value: 'lote', label: 'Lote inteiro' }]}
        value={modo}
        onChange={v => { setModo(v); setSelecionados({}) }}
        className="mb-[18px]"
      />
      {modo === 'animal' && (
        <>
          <div className="text-[12.5px] font-bold text-text-secondary mb-[8px] uppercase tracking-[.04em]">Tipo de saída</div>
          <SegmentedControl
            options={[{ value: 'venda', label: 'Venda' }, { value: 'morte', label: 'Morte' }, { value: 'transferencia', label: 'Transf.' }]}
            value={tipo}
            onChange={setTipo}
            className="mb-[18px]"
          />
          <SaidaAnimalForm animais={animais} form={{ ...form, tipo }} update={update} />
        </>
      )}
      {modo === 'lote' && (
        <SaidaLoteForm
          lotes={lotes}
          loteId={loteId}
          onLoteChange={id => { setLoteId(id); setSelecionados({}) }}
          precoArroba={precoArroba}
          onPrecoChange={setPrecoArroba}
          comprador={comprador}
          onCompradorChange={setComprador}
          selecionados={selecionados}
          onToggle={toggleAnimal}
          onSelectAll={selectAll}
        />
      )}
    </>
  )

  if (isDesktop) {
    return (
      <>{toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Modal
        title={modalTitle}
        width={modo === 'lote' ? 520 : 470}
        footer={
          <>
            <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={salvando}>{ctaLabel}</Button>
          </>
        }
      >
        {content}
      </Modal>
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
      <div className="px-[20px] py-[12px] pb-[24px]">
        <Button fullWidth onClick={handleSave} disabled={salvando}>{ctaLabel}</Button>
      </div>
    </div>
  )
}
