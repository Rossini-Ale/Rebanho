import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { api } from '../lib/api'
import { categoriasCusto, produtosSanitarios, racas, touros } from '../lib/utils'
import { ChevronLeft, Trash2, Plus, Copy, Check, Download } from 'lucide-react'


function TabDadosFazenda({ user }) {
  const { data: fazenda, reload } = useApi(() => user.fazenda_id ? api.fazendas.buscar(user.fazenda_id) : Promise.resolve(null), [])
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [salvando, setSalvando] = useState(false)

  const iniciarEdicao = () => {
    setNome(fazenda?.nome || '')
    setLocalizacao(fazenda?.localizacao || '')
    setEditando(true)
  }

  const salvar = async () => {
    setSalvando(true)
    await api.fazendas.atualizar(user.fazenda_id, { nome, localizacao })
    const updated = { ...user, fazenda_nome: nome }
    localStorage.setItem('user', JSON.stringify(updated))
    setSalvando(false)
    setEditando(false)
    reload()
  }

  if (!fazenda) return <div className="text-text-secondary text-[14px]">Carregando...</div>

  if (editando) {
    return (
      <div className="bg-white border border-border rounded-[14px] p-[18px]">
        <div className="text-[15px] font-extrabold text-primary-dark mb-[16px]">Editar fazenda</div>
        <Input label="Nome da fazenda" value={nome} onChange={e => setNome(e.target.value)} className="mb-[14px]" />
        <Input label="Localização" value={localizacao} onChange={e => setLocalizacao(e.target.value)} className="mb-[18px]" />
        <div className="flex gap-[10px] justify-end">
          <Button variant="secondary" onClick={() => setEditando(false)}>Cancelar</Button>
          <Button onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="flex justify-between items-start mb-[14px]">
        <div className="text-[15px] font-extrabold text-primary-dark">Dados da fazenda</div>
        {user.papel === 'admin' && (
          <button onClick={iniciarEdicao} className="text-[13px] font-bold text-primary bg-transparent border-none cursor-pointer">Editar</button>
        )}
      </div>
      <div className="flex flex-col gap-[12px]">
        <div>
          <div className="text-[12px] font-bold text-text-secondary uppercase tracking-[.04em] mb-[2px]">Nome</div>
          <div className="text-[15px] font-semibold text-primary-dark">{fazenda.nome}</div>
        </div>
        <div>
          <div className="text-[12px] font-bold text-text-secondary uppercase tracking-[.04em] mb-[2px]">Localização</div>
          <div className="text-[15px] font-semibold text-primary-dark">{fazenda.localizacao || '—'}</div>
        </div>
        <div>
          <div className="text-[12px] font-bold text-text-secondary uppercase tracking-[.04em] mb-[2px]">Código de convite</div>
          <div className="text-[15px] font-mono font-bold text-primary-dark">{fazenda.codigo_convite}</div>
        </div>
      </div>
    </div>
  )
}

function TabConvite({ user }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = () => {
    navigator.clipboard.writeText(user.codigo_convite)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="text-[15px] font-extrabold text-primary-dark mb-[4px]">Código de convite</div>
      <div className="text-[13px] text-text-secondary font-medium mb-[16px]">Compartilhe este código com operadores para que eles possam se cadastrar na sua fazenda.</div>
      {user.codigo_convite ? (
        <>
          <div className="flex items-center gap-[12px] bg-chip-bg rounded-[12px] p-[14px_18px] mb-[14px]">
            <span className="font-mono text-[20px] font-bold text-primary-dark tracking-[.04em] flex-1">{user.codigo_convite}</span>
            <button onClick={copiar} className="bg-primary text-white rounded-sidebar-item py-[8px] px-[16px] text-[13px] font-bold cursor-pointer border-none flex items-center gap-[6px]">
              {copiado ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
            </button>
          </div>
          <div className="text-[12.5px] text-text-body font-medium">O operador deve informar este código na tela de cadastro ao selecionar a função "Operador".</div>
        </>
      ) : (
        <div className="text-[13px] text-text-secondary">Apenas administradores possuem código de convite.</div>
      )}
    </div>
  )
}

function TabLotes() {
  const { data: lotes, loading, reload } = useApi(() => api.lotes.listar(), [])
  const [criando, setCriando] = useState(false)
  const [form, setForm] = useState({ nome: '', tipo: 'pasto', area_ha: '', capacidade: '' })
  const [salvando, setSalvando] = useState(false)

  const salvarLote = async () => {
    setSalvando(true)
    await api.lotes.criar({ nome: form.nome, tipo: form.tipo, area_ha: form.area_ha || null, capacidade: form.capacidade || null })
    setForm({ nome: '', tipo: 'pasto', area_ha: '', capacidade: '' })
    setCriando(false)
    setSalvando(false)
    reload()
  }

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="flex justify-between items-center mb-[14px]">
        <div className="text-[15px] font-extrabold text-primary-dark">Lotes & pastos</div>
        {!criando && (
          <button onClick={() => setCriando(true)} className="flex items-center gap-[6px] text-[13px] font-bold text-primary bg-transparent border-none cursor-pointer">
            <Plus size={15} /> Novo lote
          </button>
        )}
      </div>

      {criando && (
        <div className="bg-chip-bg rounded-[12px] p-[14px] mb-[14px]">
          <Input label="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className="mb-[10px]" />
          <div className="flex gap-[10px] mb-[10px]">
            <div className="flex-1">
              <div className="text-[12px] font-bold text-text-secondary mb-[5px] uppercase tracking-[.04em]">Tipo</div>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className="w-full bg-white border-[1.5px] border-field-border rounded-button py-[10px] px-[12px] text-[14px] font-semibold text-primary-dark outline-none">
                <option value="pasto">Pasto</option>
                <option value="curral">Curral</option>
                <option value="maternidade">Maternidade</option>
              </select>
            </div>
            <Input label="Área (ha)" type="number" value={form.area_ha} onChange={e => setForm(f => ({ ...f, area_ha: e.target.value }))} className="flex-1" />
            <Input label="Capacidade" type="number" value={form.capacidade} onChange={e => setForm(f => ({ ...f, capacidade: e.target.value }))} className="flex-1" />
          </div>
          <div className="flex gap-[8px] justify-end">
            <Button variant="secondary" onClick={() => setCriando(false)}>Cancelar</Button>
            <Button onClick={salvarLote} disabled={!form.nome || salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </div>
      )}

      {loading && <div className="text-text-secondary text-[14px]">Carregando...</div>}
      {(lotes || []).map((l, i) => (
        <div key={l.id} className={`flex justify-between items-center py-[12px] ${i < (lotes || []).length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
          <div>
            <div className="text-[14.5px] font-bold text-primary-dark">{l.nome}</div>
            <div className="text-[12.5px] text-text-secondary font-medium">{l.tipo} {l.area_ha ? `· ${l.area_ha} ha` : ''}</div>
          </div>
          <div className="text-right">
            <div className="text-[14px] font-mono font-bold text-primary-dark">{l.qtd_animais || 0}</div>
            <div className="text-[11.5px] text-text-secondary">animais</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TabTiposCusto() {
  const [itens, setItens] = useState(categoriasCusto)
  const [novo, setNovo] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.configuracoes.buscar('categorias_custo')
      .then(res => { if (res?.valor) setItens(res.valor) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const persistir = (updated) => {
    setItens(updated)
    api.configuracoes.salvar('categorias_custo', updated).catch(() => {})
  }

  const adicionar = () => {
    if (novo.trim() && !itens.includes(novo.trim())) {
      persistir([...itens, novo.trim()])
      setNovo('')
    }
  }

  const remover = (item) => persistir(itens.filter(i => i !== item))

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Tipos de custo</div>
      <div className="text-[12.5px] text-text-secondary font-medium mb-[14px]">Categorias disponíveis ao registrar custos no financeiro.</div>

      <div className="flex gap-[8px] mb-[14px]">
        <input
          value={novo}
          onChange={e => setNovo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && adicionar()}
          placeholder="Nova categoria..."
          className="flex-1 bg-white border-[1.5px] border-field-border rounded-button py-[10px] px-[14px] text-[14px] font-semibold text-primary-dark outline-none focus:border-primary"
        />
        <Button onClick={adicionar} disabled={!novo.trim()}>Adicionar</Button>
      </div>

      {itens.map((item, i) => (
        <div key={item} className={`flex justify-between items-center py-[11px] ${i < itens.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
          <span className="text-[14.5px] font-semibold text-primary-dark">{item}</span>
          <button onClick={() => remover(item)} className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-danger transition-colors p-[4px]">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

function TabProdutosSanitarios() {
  const [itens, setItens] = useState(produtosSanitarios)
  const [novo, setNovo] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.configuracoes.buscar('produtos_sanitarios')
      .then(res => { if (res?.valor) setItens(res.valor) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const persistir = (updated) => {
    setItens(updated)
    api.configuracoes.salvar('produtos_sanitarios', updated).catch(() => {})
  }

  const adicionar = () => {
    if (novo.trim() && !itens.includes(novo.trim())) {
      persistir([...itens, novo.trim()])
      setNovo('')
    }
  }

  const remover = (item) => persistir(itens.filter(i => i !== item))

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Produtos sanitários</div>
      <div className="text-[12.5px] text-text-secondary font-medium mb-[14px]">Produtos disponíveis ao registrar eventos de sanidade.</div>

      <div className="flex gap-[8px] mb-[14px]">
        <input
          value={novo}
          onChange={e => setNovo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && adicionar()}
          placeholder="Novo produto..."
          className="flex-1 bg-white border-[1.5px] border-field-border rounded-button py-[10px] px-[14px] text-[14px] font-semibold text-primary-dark outline-none focus:border-primary"
        />
        <Button onClick={adicionar} disabled={!novo.trim()}>Adicionar</Button>
      </div>

      {itens.map((item, i) => (
        <div key={item} className={`flex justify-between items-center py-[11px] ${i < itens.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
          <span className="text-[14.5px] font-semibold text-primary-dark">{item}</span>
          <button onClick={() => remover(item)} className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-danger transition-colors p-[4px]">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

function TabRacas() {
  const [itens, setItens] = useState(racas)
  const [novo, setNovo] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.configuracoes.buscar('racas')
      .then(res => { if (res?.valor) setItens(res.valor) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const persistir = (updated) => {
    setItens(updated)
    api.configuracoes.salvar('racas', updated).catch(() => {})
  }

  const adicionar = () => {
    if (novo.trim() && !itens.includes(novo.trim())) {
      persistir([...itens, novo.trim()])
      setNovo('')
    }
  }

  const remover = (item) => persistir(itens.filter(i => i !== item))

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Raças</div>
      <div className="text-[12.5px] text-text-secondary font-medium mb-[14px]">Raças disponíveis ao cadastrar animais.</div>

      <div className="flex gap-[8px] mb-[14px]">
        <input
          value={novo}
          onChange={e => setNovo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && adicionar()}
          placeholder="Nova raça..."
          className="flex-1 bg-white border-[1.5px] border-field-border rounded-button py-[10px] px-[14px] text-[14px] font-semibold text-primary-dark outline-none focus:border-primary"
        />
        <Button onClick={adicionar} disabled={!novo.trim()}>Adicionar</Button>
      </div>

      {itens.map((item, i) => (
        <div key={item} className={`flex justify-between items-center py-[11px] ${i < itens.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
          <span className="text-[14.5px] font-semibold text-primary-dark">{item}</span>
          <button onClick={() => remover(item)} className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-danger transition-colors p-[4px]">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

function TabTouros() {
  const [itens, setItens] = useState(touros.map(t => typeof t === 'string' ? t : t.label))
  const [novo, setNovo] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.configuracoes.buscar('touros')
      .then(res => { if (res?.valor) setItens(res.valor) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const persistir = (updated) => {
    setItens(updated)
    api.configuracoes.salvar('touros', updated).catch(() => {})
  }

  const adicionar = () => {
    if (novo.trim() && !itens.includes(novo.trim())) {
      persistir([...itens, novo.trim()])
      setNovo('')
    }
  }

  const remover = (item) => persistir(itens.filter(i => i !== item))

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Touros & sêmen</div>
      <div className="text-[12.5px] text-text-secondary font-medium mb-[14px]">Touros e sêmen disponíveis para cobertura.</div>

      <div className="flex gap-[8px] mb-[14px]">
        <input
          value={novo}
          onChange={e => setNovo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && adicionar()}
          placeholder="Novo touro / sêmen..."
          className="flex-1 bg-white border-[1.5px] border-field-border rounded-button py-[10px] px-[14px] text-[14px] font-semibold text-primary-dark outline-none focus:border-primary"
        />
        <Button onClick={adicionar} disabled={!novo.trim()}>Adicionar</Button>
      </div>

      {itens.map((item, i) => (
        <div key={item} className={`flex justify-between items-center py-[11px] ${i < itens.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
          <span className="text-[14.5px] font-semibold text-primary-dark">{item}</span>
          <button onClick={() => remover(item)} className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-danger transition-colors p-[4px]">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

function TabUsuarios({ user }) {
  const { data: usuarios, loading, reload } = useApi(() => user.fazenda_id ? api.fazendas.usuarios(user.fazenda_id) : Promise.resolve([]), [])
  const [removendo, setRemovendo] = useState(null)

  const remover = async (userId) => {
    setRemovendo(userId)
    await api.fazendas.removerUsuario(user.fazenda_id, userId)
    setRemovendo(null)
    reload()
  }

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="text-[15px] font-extrabold text-primary-dark mb-[4px]">Usuários da fazenda</div>
      <div className="text-[12.5px] text-text-secondary font-medium mb-[14px]">
        {user.fazenda_nome || 'Minha Fazenda'} · {(usuarios || []).length} usuário{(usuarios || []).length !== 1 ? 's' : ''}
      </div>

      {loading && <div className="text-text-secondary text-[14px]">Carregando...</div>}
      {(usuarios || []).map((u, i) => (
        <div key={u.id} className={`flex items-center gap-[12px] py-[12px] ${i < (usuarios || []).length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
          <span className="w-[36px] h-[36px] rounded-full bg-primary-medium text-white flex items-center justify-center text-[13px] font-bold shrink-0">
            {(u.nome || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[14.5px] font-bold text-primary-dark truncate">{u.nome}</div>
            <div className="text-[12.5px] text-text-secondary font-medium">{u.usuario} · {u.papel === 'admin' ? 'Admin' : 'Operador'}</div>
          </div>
          {user.papel === 'admin' && u.papel !== 'admin' && (
            <button
              onClick={() => remover(u.id)}
              disabled={removendo === u.id}
              className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-danger transition-colors p-[4px]"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ))}

      {user.papel === 'admin' && user.codigo_convite && (
        <div className="mt-[14px] bg-chip-bg rounded-[12px] p-[12px_14px]">
          <div className="text-[12px] font-bold text-text-secondary mb-[2px]">Para adicionar operadores:</div>
          <div className="text-[12.5px] text-text-body font-medium">Compartilhe o código <span className="font-mono font-bold">{user.codigo_convite}</span> — eles usam na tela de cadastro.</div>
        </div>
      )}
    </div>
  )
}

function TabUnidades() {
  const opcoes = {
    peso: ['Quilogramas (kg)', 'Libras (lb)', 'Arrobas (@)'],
    comercializacao: ['Arroba (@) · 15 kg', 'Arroba (@) · 14.688 kg', 'Quilogramas (kg)', 'Libras (lb)'],
    area: ['Hectares (ha)', 'Alqueires (alq)', 'Acres (ac)'],
    moeda: ['Real (R$)', 'Dólar (US$)', 'Euro (€)'],
    idade: ['Anos e meses', 'Apenas meses', 'Apenas dias'],
  }

  const chaves = ['peso', 'comercializacao', 'area', 'moeda', 'idade']
  const labels = { peso: 'Peso', comercializacao: 'Comercialização', area: 'Área', moeda: 'Moeda', idade: 'Idade dos animais' }
  const defaults = { peso: 'Quilogramas (kg)', comercializacao: 'Arroba (@) · 15 kg', area: 'Hectares (ha)', moeda: 'Real (R$)', idade: 'Anos e meses' }

  const saved = JSON.parse(localStorage.getItem('unidades') || '{}')
  const [valores, setValores] = useState({ ...defaults, ...saved })
  const [salvo, setSalvo] = useState(false)

  const atualizar = (chave, valor) => {
    const novos = { ...valores, [chave]: valor }
    setValores(novos)
    localStorage.setItem('unidades', JSON.stringify(novos))
    setSalvo(true)
    setTimeout(() => setSalvo(false), 1500)
  }

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="flex justify-between items-center mb-[14px]">
        <div className="text-[15px] font-extrabold text-primary-dark">Unidades & medidas</div>
        {salvo && <span className="text-[12.5px] font-bold text-primary-medium">Salvo!</span>}
      </div>
      {chaves.map((chave, i) => (
        <div key={chave} className={`flex justify-between items-center py-[14px] ${i < chaves.length - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
          <span className="text-[14.5px] font-semibold text-primary-dark">{labels[chave]}</span>
          <select
            value={valores[chave]}
            onChange={e => atualizar(chave, e.target.value)}
            className="appearance-none bg-chip-bg border-none rounded-chip py-[7px] px-[12px] pr-[28px] text-[13px] font-semibold text-text-body outline-none cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%237c8378\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            {opcoes[chave].map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>
      ))}
    </div>
  )
}

function TabSincronizacao() {
  const [syncOn, setSyncOn] = useState(true)
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Sincronização</div>
      <div className="flex justify-between items-center py-[10px] border-b border-[#f0ede4]">
        <div>
          <div className="text-[14.5px] font-bold text-primary-dark">Sincronização automática</div>
          <div className="text-[12.5px] text-text-secondary mt-[2px]">Sincroniza dados ao reconectar</div>
        </div>
        <button
          onClick={() => setSyncOn(!syncOn)}
          className="w-[46px] h-[26px] rounded-[14px] relative shrink-0 cursor-pointer border-none transition-colors"
          style={{ background: syncOn ? '#3a5a40' : '#cfd4c7' }}
        >
          <span className="absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white transition-all" style={{ [syncOn ? 'right' : 'left']: 3 }} />
        </button>
      </div>
      <div className="flex justify-between items-center py-[10px]">
        <div>
          <div className="text-[14.5px] font-bold text-primary-dark">Status</div>
          <div className="text-[12.5px] text-text-secondary mt-[2px]">Sincronização disponível quando offline</div>
        </div>
        <div className="flex items-center gap-[6px]">
          <span className="w-[8px] h-[8px] rounded-full" style={{ background: online ? '#588157' : '#b54a2f' }} />
          <span className="text-[13px] font-bold" style={{ color: online ? '#588157' : '#b54a2f' }}>{online ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </div>
  )
}

function TabBackup() {
  const [exportando, setExportando] = useState(false)

  const exportarDados = async () => {
    setExportando(true)
    try {
      const [animais, lotes, sanidade, financeiro] = await Promise.all([
        api.animais.listar(),
        api.lotes.listar(),
        api.sanidade.listar(),
        api.financeiro.listar(),
      ])
      const dados = { exportado_em: new Date().toISOString(), animais, lotes, sanidade, financeiro }
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rebanho-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="text-[15px] font-extrabold text-primary-dark mb-[4px]">Backup & exportar</div>
      <div className="text-[12.5px] text-text-secondary font-medium mb-[18px]">Exporte todos os dados da fazenda em formato JSON.</div>

      <button
        onClick={exportarDados}
        disabled={exportando}
        className="flex items-center gap-[8px] bg-primary text-white rounded-sidebar-item py-[11px] px-[18px] text-[14px] font-bold cursor-pointer border-none"
      >
        <Download size={16} />
        {exportando ? 'Exportando…' : 'Exportar dados'}
      </button>

      <div className="mt-[16px] bg-chip-bg rounded-[12px] p-[12px_14px]">
        <div className="text-[12.5px] text-text-body font-medium">O arquivo contém: animais, lotes, eventos sanitários e lançamentos financeiros.</div>
      </div>
    </div>
  )
}

function MobileConfiguracoes() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [abaAtiva, setAbaAtiva] = useState(null)

  const abas = [
    { key: 'fazenda', label: 'Dados da fazenda' },
    ...(user.papel === 'admin' ? [{ key: 'convite', label: 'Convite' }] : []),
    { key: 'lotes', label: 'Lotes & pastos' },
    { key: 'custos', label: 'Tipos de custo' },
    { key: 'sanitarios', label: 'Produtos sanitários' },
    { key: 'racas', label: 'Raças' },
    { key: 'touros', label: 'Touros / sêmen' },
    { key: 'usuarios', label: 'Usuários' },
    { key: 'unidades', label: 'Unidades' },
    { key: 'sync', label: 'Sincronização' },
    { key: 'backup', label: 'Backup & exportar' },
  ]

  if (abaAtiva) {
    const titulo = abas.find(a => a.key === abaAtiva)?.label || ''
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-[14px] px-[20px] pt-[8px] pb-[14px]">
          <button onClick={() => setAbaAtiva(null)} className="text-primary bg-transparent border-none cursor-pointer p-0">
            <ChevronLeft size={24} />
          </button>
          <span className="text-[19px] font-extrabold text-primary-dark">{titulo}</span>
        </div>
        <div className="flex-1 overflow-auto px-[22px] pb-[20px]">
          {abaAtiva === 'fazenda' && <TabDadosFazenda user={user} />}
          {abaAtiva === 'convite' && <TabConvite user={user} />}
          {abaAtiva === 'lotes' && <TabLotes />}
          {abaAtiva === 'custos' && <TabTiposCusto />}
          {abaAtiva === 'sanitarios' && <TabProdutosSanitarios />}
          {abaAtiva === 'racas' && <TabRacas />}
          {abaAtiva === 'touros' && <TabTouros />}
          {abaAtiva === 'usuarios' && <TabUsuarios user={user} />}
          {abaAtiva === 'unidades' && <TabUnidades />}
          {abaAtiva === 'sync' && <TabSincronizacao />}
          {abaAtiva === 'backup' && <TabBackup />}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[14px] px-[20px] pt-[8px] pb-[14px]">
        <ChevronLeft size={24} className="text-primary" />
        <span className="text-[19px] font-extrabold text-primary-dark">Configurações</span>
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[8px]">
        <div className="bg-white border border-[#eee9df] rounded-[16px] overflow-hidden mb-[16px]">
          {abas.map((item, i) => (
            <button
              key={item.key}
              onClick={() => setAbaAtiva(item.key)}
              className="w-full flex items-center gap-[14px] py-[15px] px-[16px] bg-transparent border-none cursor-pointer"
              style={i < abas.length - 1 ? { borderBottom: '1px solid #f0ede4' } : {}}
            >
              <span className="flex-1 text-left text-[15px] font-bold text-primary-dark">{item.label}</span>
              <span className="text-[#b8bdb0] font-bold">›</span>
            </button>
          ))}
        </div>

        <div className="bg-chip-bg rounded-[14px] p-[13px_16px] text-[12.5px] text-text-body font-semibold">
          Versão 1.0
        </div>
      </div>
    </div>
  )
}

const tabMap = { usuarios: 'Usuários', fazenda: 'Dados da fazenda', convite: 'Convite', lotes: 'Lotes & pastos', custos: 'Tipos de custo', sanitarios: 'Produtos sanitários', racas: 'Raças', touros: 'Touros / sêmen', unidades: 'Unidades', sync: 'Sincronização', backup: 'Backup' }

function DesktopConfiguracoes() {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [abaAtiva, setAbaAtiva] = useState(tabMap[tabParam] || 'Dados da fazenda')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (tabParam && tabMap[tabParam]) setAbaAtiva(tabMap[tabParam])
  }, [tabParam])

  const abas = [
    'Dados da fazenda',
    ...(user.papel === 'admin' ? ['Convite'] : []),
    'Lotes & pastos',
    'Tipos de custo',
    'Produtos sanitários',
    'Raças',
    'Touros / sêmen',
    'Usuários',
    'Unidades',
    'Sincronização',
    'Backup',
  ]

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Configurações</div>
          <div className="text-[13px] text-text-secondary font-medium">Preferências da fazenda e do sistema</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[22px_26px] bg-header-bg">
        <div className="grid grid-cols-[200px_1fr] gap-[20px]">
          <div className="flex flex-col gap-[3px]">
            {abas.map(a => (
              <button
                key={a}
                onClick={() => setAbaAtiva(a)}
                className={`py-[11px] px-[14px] rounded-chip text-[14px] font-semibold text-left cursor-pointer border transition-colors ${
                  abaAtiva === a
                    ? 'font-bold text-primary-dark bg-white border-border'
                    : 'text-text-body bg-transparent border-transparent hover:bg-white'
                }`}
              >{a}</button>
            ))}
          </div>

          <div>
            {abaAtiva === 'Dados da fazenda' && <TabDadosFazenda user={user} />}
            {abaAtiva === 'Convite' && <TabConvite user={user} />}
            {abaAtiva === 'Lotes & pastos' && <TabLotes />}
            {abaAtiva === 'Tipos de custo' && <TabTiposCusto />}
            {abaAtiva === 'Produtos sanitários' && <TabProdutosSanitarios />}
            {abaAtiva === 'Raças' && <TabRacas />}
            {abaAtiva === 'Touros / sêmen' && <TabTouros />}
            {abaAtiva === 'Usuários' && <TabUsuarios user={user} />}
            {abaAtiva === 'Unidades' && <TabUnidades />}
            {abaAtiva === 'Sincronização' && <TabSincronizacao />}
            {abaAtiva === 'Backup' && <TabBackup />}
          </div>
        </div>
      </div>
    </>
  )
}

export default function ConfiguracoesPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopConfiguracoes /> : <MobileConfiguracoes />
}
