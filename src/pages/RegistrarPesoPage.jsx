import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { ChevronLeft } from 'lucide-react'

// ── modo animal individual ────────────────────────────────────────────────────

function PesoAnimalForm({ animais, form, update }) {
  const { data: pesagens } = useApi(
    () => form.animalId ? api.animais.pesagens(form.animalId) : Promise.resolve([]),
    [form.animalId]
  )
  const ultima = pesagens?.length ? pesagens[0] : null
  const variacao = form.peso && ultima ? (parseFloat(form.peso) - parseFloat(ultima.peso_kg)).toFixed(0) : null

  return (
    <>
      <Select
        label="Animal"
        value={form.animalId}
        onChange={e => update('animalId', e.target.value)}
        options={(animais || []).map(a => ({ value: String(a.id), label: `${a.brinco} · ${a.raca} · ${a.lote_nome || ''}` }))}
        className="mb-[18px]"
      />
      <div className="text-[12.5px] font-bold text-text-secondary mb-[7px] uppercase tracking-[.04em]">Peso (kg)</div>
      <input
        value={form.peso}
        onChange={e => update('peso', e.target.value)}
        placeholder="0"
        className="w-full bg-white border-[1.5px] border-primary rounded-button py-[14px] px-[16px] font-mono text-[22px] font-bold text-primary-dark outline-none mb-[18px]"
      />
      {ultima && (
        <div className="bg-chip-bg rounded-button p-[13px_16px] mb-[18px] flex justify-between items-center">
          <div>
            <div className="text-[12px] text-text-body font-semibold">Última pesagem</div>
            <div className="text-[15px] font-bold text-primary-dark">{parseFloat(ultima.peso_kg)} kg · {new Date(ultima.data).toLocaleDateString('pt-BR')}</div>
          </div>
          {variacao && (
            <div className={`font-mono text-[18px] font-bold ${parseFloat(variacao) >= 0 ? 'text-primary-medium' : 'text-danger'}`}>
              {parseFloat(variacao) >= 0 ? '+' : ''}{variacao} kg
            </div>
          )}
        </div>
      )}
      <div className="flex gap-[12px]">
        <Input label="Data" type="date" value={form.data} onChange={e => update('data', e.target.value)} className="flex-1" />
        <Input label="Local" value={form.local} onChange={e => update('local', e.target.value)} placeholder="Curral" className="flex-1" />
      </div>
    </>
  )
}

// ── modo lote ─────────────────────────────────────────────────────────────────

function PesoLoteForm({ lotes, loteId, onLoteChange, pesos, onPesoChange, data, onDataChange, local, onLocalChange }) {
  const { data: animaisDoLote } = useApi(
    () => loteId ? api.lotes.animais(loteId) : Promise.resolve([]),
    [loteId]
  )
  const lista = animaisDoLote || []

  return (
    <>
      <Select
        label="Lote"
        value={loteId}
        onChange={e => onLoteChange(e.target.value)}
        options={(lotes || []).map(l => ({ value: String(l.id), label: `${l.nome} · ${l.qtd_animais || 0} animais` }))}
        className="mb-[16px]"
      />
      <div className="flex gap-[12px] mb-[16px]">
        <Input label="Data" type="date" value={data} onChange={e => onDataChange(e.target.value)} className="flex-1" />
        <Input label="Local" value={local} onChange={e => onLocalChange(e.target.value)} placeholder="Curral" className="flex-1" />
      </div>
      {lista.length > 0 && (
        <>
          <div className="grid grid-cols-[1fr_1fr] py-[8px] text-[11.5px] font-bold text-text-secondary uppercase tracking-[.04em] border-b border-[#f0ede4] mb-[4px]">
            <span>Animal</span><span>Peso (kg)</span>
          </div>
          <div className="flex flex-col gap-[6px] max-h-[300px] overflow-auto pr-[4px]">
            {lista.map(a => (
              <div key={a.id} className="grid grid-cols-[1fr_1fr] items-center gap-[10px] py-[4px]">
                <div>
                  <div className="font-mono text-[14px] font-bold text-primary-dark">{a.brinco}</div>
                  <div className="text-[12px] text-text-secondary">{a.raca}{a.peso_atual ? ` · ${parseFloat(a.peso_atual)} kg` : ''}</div>
                </div>
                <input
                  value={pesos[a.id] || ''}
                  onChange={e => onPesoChange(a.id, e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border-[1.5px] border-field-border rounded-button py-[8px] px-[12px] font-mono text-[16px] font-bold text-primary-dark outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
          <div className="mt-[10px] bg-chip-bg rounded-button p-[10px_14px] text-[13px] text-text-body font-semibold">
            {Object.values(pesos).filter(v => v && parseFloat(v) > 0).length} de {lista.length} animais com peso preenchido
          </div>
        </>
      )}
      {loteId && lista.length === 0 && (
        <div className="text-center text-text-secondary text-[14px] py-[20px]">Nenhum animal neste lote.</div>
      )}
    </>
  )
}

// ── página ────────────────────────────────────────────────────────────────────

export default function RegistrarPesoPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { toast, showToast, hideToast } = useToast()
  const [salvando, setSalvando] = useState(false)
  const [progresso, setProgresso] = useState(null)

  const initialModo = searchParams.get('lote') ? 'lote' : 'animal'
  const [modo, setModo] = useState(initialModo)

  const { data: animais } = useApi(() => api.animais.listar(), [])
  const { data: lotes } = useApi(() => api.lotes.listar(), [])

  const [form, setForm] = useState({
    animalId: searchParams.get('animal') || '',
    peso: '',
    data: new Date().toISOString().slice(0, 10),
    local: '',
  })
  const update = (f, v) => setForm(s => ({ ...s, [f]: v }))

  const [loteId, setLoteId] = useState(searchParams.get('lote') || '')
  const [pesos, setPesos] = useState({})
  const [dataLote, setDataLote] = useState(new Date().toISOString().slice(0, 10))
  const [localLote, setLocalLote] = useState('')

  const handleSaveAnimal = async () => {
    if (!form.animalId) { showToast('Selecione o animal', 'error'); return }
    if (!form.peso || parseFloat(form.peso) <= 0) { showToast('Informe um peso válido', 'error'); return }
    if (!form.data) { showToast('Informe a data da pesagem', 'error'); return }
    setSalvando(true)
    try {
      await api.animais.registrarPeso(form.animalId, { peso_kg: parseFloat(form.peso), data: form.data, local: form.local })
      showToast('Peso registrado!')
      setTimeout(() => navigate(`/animais/${form.animalId}`), 800)
    } catch (err) {
      showToast(err.message || 'Erro ao registrar peso', 'error')
    } finally { setSalvando(false) }
  }

  const handleSaveLote = async () => {
    if (!loteId) { showToast('Selecione o lote', 'error'); return }
    const entradas = Object.entries(pesos).filter(([, v]) => v && parseFloat(v) > 0)
    if (!entradas.length) { showToast('Informe o peso de pelo menos um animal', 'error'); return }
    setSalvando(true)
    let ok = 0
    try {
      for (const [animalId, peso] of entradas) {
        await api.animais.registrarPeso(animalId, { peso_kg: parseFloat(peso), data: dataLote, local: localLote })
        ok++
        setProgresso(`${ok}/${entradas.length}`)
      }
      showToast(`${ok} pesagens registradas!`)
      setTimeout(() => navigate('/lotes'), 1000)
    } catch (err) {
      showToast(err.message || 'Erro ao registrar pesagens', 'error')
    } finally { setSalvando(false); setProgresso(null) }
  }

  const handleSave = modo === 'animal' ? handleSaveAnimal : handleSaveLote
  const ctaLabel = modo === 'animal'
    ? (salvando ? 'Salvando…' : 'Salvar pesagem')
    : (salvando ? `Salvando… ${progresso || ''}` : `Salvar ${Object.values(pesos).filter(v => v && parseFloat(v) > 0).length} pesagens`)

  const content = (
    <>
      <SegmentedControl
        options={[{ value: 'animal', label: 'Animal' }, { value: 'lote', label: 'Lote inteiro' }]}
        value={modo}
        onChange={setModo}
        className="mb-[18px]"
      />
      {modo === 'animal' && <PesoAnimalForm animais={animais} form={form} update={update} />}
      {modo === 'lote' && (
        <PesoLoteForm
          lotes={lotes}
          loteId={loteId}
          onLoteChange={id => { setLoteId(id); setPesos({}) }}
          pesos={pesos}
          onPesoChange={(id, v) => setPesos(p => ({ ...p, [id]: v }))}
          data={dataLote}
          onDataChange={setDataLote}
          local={localLote}
          onLocalChange={setLocalLote}
        />
      )}
    </>
  )

  if (isDesktop) {
    return (
      <>{toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Modal
        title="Registrar peso"
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
        <span className="text-[19px] font-extrabold text-primary-dark">Registrar peso</span>
      </div>
      <div className="flex-1 overflow-auto px-[20px]">{content}</div>
      <div className="px-[20px] py-[12px] pb-[24px]">
        <Button fullWidth onClick={handleSave} disabled={salvando}>{ctaLabel}</Button>
      </div>
    </div>
  )
}
