import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { api } from '../lib/api'
import { categoriasCusto, categoriasReceita, produtosSanitarios, racas, touros } from '../lib/utils'
import { ChevronLeft, Trash2, Plus, Copy, Check, Download, Upload, FileText, AlertCircle } from 'lucide-react'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Modal from '../components/ui/Modal'


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

function TabTiposReceita() {
  const [itens, setItens] = useState(categoriasReceita)
  const [novo, setNovo] = useState('')

  useEffect(() => {
    api.configuracoes.buscar('categorias_receita')
      .then(res => { if (res?.valor) setItens(res.valor) })
      .catch(() => {})
  }, [])

  const persistir = (updated) => {
    setItens(updated)
    api.configuracoes.salvar('categorias_receita', updated).catch(() => {})
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
      <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Tipos de receita</div>
      <div className="text-[12.5px] text-text-secondary font-medium mb-[14px]">Categorias disponíveis ao registrar receitas no financeiro.</div>

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
  const [confirmando, setConfirmando] = useState(null)
  const [resetando, setResetando] = useState(null)
  const [novaSenha, setNovaSenha] = useState('')
  const [erroReset, setErroReset] = useState('')
  const [sucessoReset, setSucessoReset] = useState(false)
  const [salvandoReset, setSalvandoReset] = useState(false)

  const remover = async (userId) => {
    setRemovendo(userId)
    await api.fazendas.removerUsuario(user.fazenda_id, userId)
    setRemovendo(null)
    reload()
  }

  const abrirReset = (u) => {
    setResetando(u)
    setNovaSenha('')
    setErroReset('')
    setSucessoReset(false)
  }

  const salvarReset = async () => {
    if (!novaSenha || novaSenha.length < 6) { setErroReset('Mínimo 6 caracteres'); return }
    setSalvandoReset(true)
    setErroReset('')
    try {
      await api.fazendas.redefinirSenhaUsuario(user.fazenda_id, resetando.id, novaSenha)
      setSucessoReset(true)
      setNovaSenha('')
    } catch (err) {
      setErroReset(err.message || 'Erro ao redefinir senha')
    } finally { setSalvandoReset(false) }
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
            <div className="flex items-center gap-[4px]">
              <button
                onClick={() => abrirReset(u)}
                className="text-[12px] font-bold text-primary bg-transparent border-none cursor-pointer px-[8px] py-[4px] rounded-[8px] hover:bg-chip-bg transition-colors"
                title="Redefinir senha"
              >
                Redefinir senha
              </button>
              <button
                onClick={() => setConfirmando(u.id)}
                disabled={removendo === u.id}
                className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-danger transition-colors p-[4px]"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
      ))}

      {user.papel === 'admin' && user.codigo_convite && (
        <div className="mt-[14px] bg-chip-bg rounded-[12px] p-[12px_14px]">
          <div className="text-[12px] font-bold text-text-secondary mb-[2px]">Para adicionar operadores:</div>
          <div className="text-[12.5px] text-text-body font-medium">Compartilhe o código <span className="font-mono font-bold">{user.codigo_convite}</span> — eles usam na tela de cadastro.</div>
        </div>
      )}

      {confirmando && (
        <ConfirmDialog
          title="Remover usuário"
          message={`Tem certeza que deseja remover este usuário da fazenda? Essa ação não pode ser desfeita.`}
          confirmLabel="Remover"
          onConfirm={() => { remover(confirmando); setConfirmando(null) }}
          onCancel={() => setConfirmando(null)}
        />
      )}

      {resetando && (
        <Modal
          title="Redefinir senha"
          subtitle={resetando.nome}
          width={400}
          onClose={() => setResetando(null)}
          footer={
            sucessoReset ? (
              <Button onClick={() => setResetando(null)}>Fechar</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setResetando(null)}>Cancelar</Button>
                <Button onClick={salvarReset} disabled={salvandoReset || !novaSenha}>
                  {salvandoReset ? 'Salvando…' : 'Salvar nova senha'}
                </Button>
              </>
            )
          }
        >
          {sucessoReset ? (
            <div className="text-primary-medium text-[14px] font-semibold py-[4px]">Senha redefinida com sucesso!</div>
          ) : (
            <>
              <Input
                label="Nova senha"
                type="password"
                value={novaSenha}
                onChange={e => { setNovaSenha(e.target.value); setErroReset('') }}
                placeholder="Mínimo 6 caracteres"
              />
              {erroReset && <div className="text-danger text-[12.5px] font-semibold mt-[8px]">{erroReset}</div>}
            </>
          )}
        </Modal>
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

function parseCSV(texto) {
  const linhas = texto.trim().split('\n').map(l => l.trim()).filter(Boolean)
  if (linhas.length < 2) return { headers: [], rows: [], erro: 'Arquivo vazio ou sem dados.' }

  const sep = linhas[0].includes(';') ? ';' : ','
  const headers = linhas[0].split(sep).map(h => h.trim().toLowerCase().replace(/[^a-z_]/g, ''))

  const obrigatorios = ['brinco', 'sexo', 'raca']
  const faltando = obrigatorios.filter(c => !headers.includes(c))
  if (faltando.length) return { headers, rows: [], erro: `Colunas obrigatórias ausentes: ${faltando.join(', ')}` }

  const rows = linhas.slice(1).map(linha => {
    const vals = linha.split(sep).map(v => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] || '']))
  }).filter(r => r.brinco)

  return { headers, rows, erro: null }
}

function TabImportarCSV() {
  const { data: lotes } = useApi(() => api.lotes.listar(), [])
  const [preview, setPreview] = useState(null)
  const [erro, setErro] = useState('')
  const [importando, setImportando] = useState(false)
  const [progresso, setProgresso] = useState(null)
  const [resultado, setResultado] = useState(null)

  const TEMPLATE = 'brinco,sexo,raca,nascimento,origem\n1001,Macho,Nelore,2023-05-10,nascido_aqui\n1002,Fêmea,Angus,2022-11-03,comprado'

  const baixarTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'template-animais.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErro(''); setPreview(null); setResultado(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const { headers, rows, erro: err } = parseCSV(ev.target.result)
      if (err) { setErro(err); return }
      setPreview({ headers, rows })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImportar = async () => {
    if (!preview?.rows?.length) return
    setImportando(true)
    let ok = 0; let erros = 0
    for (const r of preview.rows) {
      try {
        const sexoFmt = r.sexo?.toLowerCase().includes('f') ? 'Fêmea' : 'Macho'
        const origemFmt = r.origem?.includes('comprado') ? 'comprado' : 'nascido_aqui'
        const loteObj = lotes?.find(l => l.nome?.toLowerCase() === (r.lote || '').toLowerCase())
        await api.animais.criar({
          brinco: r.brinco,
          sexo: sexoFmt,
          raca: r.raca || 'Nelore',
          data_nascimento: r.nascimento || null,
          origem: origemFmt,
          lote_id: loteObj?.id || null,
        })
        ok++
      } catch { erros++ }
      setProgresso(`${ok + erros}/${preview.rows.length}`)
    }
    setImportando(false)
    setProgresso(null)
    setResultado({ ok, erros })
    setPreview(null)
  }

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="text-[15px] font-extrabold text-primary-dark mb-[4px]">Importar animais</div>
      <div className="text-[12.5px] text-text-secondary font-medium mb-[18px]">
        Importe um arquivo CSV com seus animais. Baixe o template para ver o formato esperado.
      </div>

      <div className="flex gap-[10px] mb-[18px]">
        <button
          onClick={baixarTemplate}
          className="flex items-center gap-[7px] bg-chip-bg border border-field-border rounded-sidebar-item py-[9px] px-[14px] text-[13.5px] font-bold text-primary-dark cursor-pointer"
        >
          <FileText size={15} /> Baixar template
        </button>
        <label className="flex items-center gap-[7px] bg-primary text-white rounded-sidebar-item py-[9px] px-[14px] text-[13.5px] font-bold cursor-pointer">
          <Upload size={15} /> Selecionar CSV
          <input type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
        </label>
      </div>

      {erro && (
        <div className="flex items-start gap-[8px] bg-[#fde8e4] rounded-[12px] p-[12px_14px] mb-[14px]">
          <AlertCircle size={15} className="text-danger shrink-0 mt-[1px]" />
          <span className="text-[13px] text-danger font-semibold">{erro}</span>
        </div>
      )}

      {resultado && (
        <div className="bg-chip-bg rounded-[12px] p-[14px_16px] mb-[14px]">
          <div className="text-[14px] font-extrabold text-primary-dark mb-[4px]">Importação concluída</div>
          <div className="text-[13px] text-text-body font-medium">
            <span className="text-primary-medium font-bold">{resultado.ok} animais importados</span>
            {resultado.erros > 0 && <span className="text-danger font-bold"> · {resultado.erros} erros</span>}
          </div>
        </div>
      )}

      {preview && (
        <>
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[14px] font-extrabold text-primary-dark">{preview.rows.length} animais encontrados</span>
            <button onClick={() => setPreview(null)} className="text-[12.5px] font-bold text-text-secondary bg-transparent border-none cursor-pointer">Cancelar</button>
          </div>

          <div className="border border-border rounded-[12px] overflow-hidden mb-[14px]">
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="bg-chip-bg border-b border-border">
                    {preview.headers.map(h => (
                      <th key={h} className="py-[8px] px-[12px] text-left font-bold text-text-secondary uppercase tracking-[.04em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 8).map((r, i) => (
                    <tr key={i} className="border-b border-[#f0ede4] last:border-b-0">
                      {preview.headers.map(h => (
                        <td key={h} className="py-[8px] px-[12px] text-text-body font-medium">{r[h] || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.rows.length > 8 && (
              <div className="py-[8px] px-[12px] text-[12px] text-text-secondary font-medium bg-chip-bg">
                + {preview.rows.length - 8} linhas não mostradas
              </div>
            )}
          </div>

          <Button onClick={handleImportar} disabled={importando}>
            {importando ? `Importando… ${progresso || ''}` : `Importar ${preview.rows.length} animais`}
          </Button>
        </>
      )}

      <div className="mt-[18px] bg-chip-bg rounded-[12px] p-[12px_14px]">
        <div className="text-[12.5px] font-bold text-primary-dark mb-[4px]">Colunas do CSV</div>
        <div className="text-[12px] text-text-body font-medium leading-[1.6]">
          <b>brinco</b> (obrigatório), <b>sexo</b> (Macho/Fêmea, obrigatório), <b>raca</b> (obrigatório)<br/>
          nascimento (AAAA-MM-DD), origem (nascido_aqui/comprado), lote (nome do lote)
        </div>
      </div>
    </div>
  )
}

function TabSeguranca() {
  const [form, setForm] = useState({ atual: '', nova: '', confirmar: '' })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const update = (f, v) => { setForm(s => ({ ...s, [f]: v })); setErro(''); setSucesso(false) }

  const salvar = async () => {
    if (!form.atual) { setErro('Informe a senha atual'); return }
    if (!form.nova || form.nova.length < 6) { setErro('A nova senha deve ter pelo menos 6 caracteres'); return }
    if (form.nova !== form.confirmar) { setErro('As senhas não conferem'); return }
    setSalvando(true)
    setErro('')
    try {
      await api.auth.mudarSenha({ senha_atual: form.atual, nova_senha: form.nova })
      setSucesso(true)
      setForm({ atual: '', nova: '', confirmar: '' })
    } catch (err) {
      setErro(err.message || 'Erro ao alterar senha')
    } finally { setSalvando(false) }
  }

  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <div className="text-[15px] font-extrabold text-primary-dark mb-[4px]">Segurança</div>
      <div className="text-[12.5px] text-text-secondary font-medium mb-[18px]">Altere sua senha de acesso ao sistema.</div>

      <Input
        label="Senha atual"
        type="password"
        value={form.atual}
        onChange={e => update('atual', e.target.value)}
        className="mb-[14px]"
      />
      <Input
        label="Nova senha"
        type="password"
        value={form.nova}
        onChange={e => update('nova', e.target.value)}
        placeholder="Mínimo 6 caracteres"
        className="mb-[14px]"
      />
      <Input
        label="Confirmar nova senha"
        type="password"
        value={form.confirmar}
        onChange={e => update('confirmar', e.target.value)}
        className="mb-[18px]"
      />

      {erro && <div className="text-danger text-[13px] font-semibold mb-[12px]">{erro}</div>}
      {sucesso && <div className="text-primary-medium text-[13px] font-semibold mb-[12px]">Senha alterada com sucesso!</div>}

      <Button onClick={salvar} disabled={salvando}>
        {salvando ? 'Salvando…' : 'Alterar senha'}
      </Button>
    </div>
  )
}

const GRUPOS_CONFIG = (isAdmin) => [
  {
    titulo: 'Fazenda',
    itens: [
      { key: 'fazenda', label: 'Dados da fazenda' },
      ...(isAdmin ? [{ key: 'convite', label: 'Convite' }] : []),
      { key: 'usuarios', label: 'Usuários' },
      { key: 'lotes', label: 'Lotes & pastos' },
    ],
  },
  {
    titulo: 'Pecuária',
    itens: [
      { key: 'racas', label: 'Raças' },
      { key: 'touros', label: 'Touros / sêmen' },
      { key: 'sanitarios', label: 'Produtos sanitários' },
    ],
  },
  {
    titulo: 'Financeiro',
    itens: [
      { key: 'custos', label: 'Tipos de custo' },
      { key: 'receitas', label: 'Tipos de receita' },
    ],
  },
  {
    titulo: 'Sistema',
    itens: [
      { key: 'seguranca', label: 'Segurança' },
      { key: 'importar', label: 'Importar animais' },
      { key: 'unidades', label: 'Unidades' },
      { key: 'sync', label: 'Sincronização' },
      { key: 'backup', label: 'Backup & exportar' },
    ],
  },
]

function renderTab(key, user) {
  switch (key) {
    case 'fazenda': return <TabDadosFazenda user={user} />
    case 'convite': return <TabConvite user={user} />
    case 'lotes': return <TabLotes />
    case 'custos': return <TabTiposCusto />
    case 'receitas': return <TabTiposReceita />
    case 'sanitarios': return <TabProdutosSanitarios />
    case 'racas': return <TabRacas />
    case 'touros': return <TabTouros />
    case 'usuarios': return <TabUsuarios user={user} />
    case 'seguranca': return <TabSeguranca />
    case 'importar': return <TabImportarCSV />
    case 'unidades': return <TabUnidades />
    case 'sync': return <TabSincronizacao />
    case 'backup': return <TabBackup />
    default: return null
  }
}

function MobileConfiguracoes() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [abaAtiva, setAbaAtiva] = useState(null)
  const grupos = GRUPOS_CONFIG(user.papel === 'admin')
  const todasAbas = grupos.flatMap(g => g.itens)

  if (abaAtiva) {
    const titulo = todasAbas.find(a => a.key === abaAtiva)?.label || ''
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-[14px] px-[20px] pt-[8px] pb-[14px]">
          <button onClick={() => setAbaAtiva(null)} className="text-primary bg-transparent border-none cursor-pointer p-0">
            <ChevronLeft size={24} />
          </button>
          <span className="text-[19px] font-extrabold text-primary-dark">{titulo}</span>
        </div>
        <div className="flex-1 overflow-auto px-[22px] pb-[20px]">
          {renderTab(abaAtiva, user)}
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
        {grupos.map(grupo => (
          <div key={grupo.titulo} className="mb-[20px]">
            <div className="text-[11.5px] font-extrabold text-text-secondary uppercase tracking-[.08em] mb-[8px] px-[2px]">
              {grupo.titulo}
            </div>
            <div className="bg-white border border-[#eee9df] rounded-[16px] overflow-hidden">
              {grupo.itens.map((item, i) => (
                <button
                  key={item.key}
                  onClick={() => setAbaAtiva(item.key)}
                  className="w-full flex items-center py-[15px] px-[16px] bg-transparent border-none cursor-pointer"
                  style={i < grupo.itens.length - 1 ? { borderBottom: '1px solid #f0ede4' } : {}}
                >
                  <span className="flex-1 text-left text-[15px] font-bold text-primary-dark">{item.label}</span>
                  <span className="text-[#b8bdb0] font-bold">›</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-chip-bg rounded-[14px] p-[13px_16px] text-[12.5px] text-text-body font-semibold">
          Versão 1.0
        </div>
      </div>
    </div>
  )
}


function DesktopConfiguracoes() {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const grupos = GRUPOS_CONFIG(user.papel === 'admin')

  const grupoInicial = () => {
    if (!tabParam) return grupos[0].titulo
    const g = grupos.find(g => g.itens.some(i => i.key === tabParam))
    return g ? g.titulo : grupos[0].titulo
  }

  const [grupoAtivo, setGrupoAtivo] = useState(grupoInicial)

  useEffect(() => {
    if (tabParam) {
      const g = grupos.find(g => g.itens.some(i => i.key === tabParam))
      if (g) setGrupoAtivo(g.titulo)
    }
  }, [tabParam])

  const grupo = grupos.find(g => g.titulo === grupoAtivo)

  return (
    <>
      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Configurações</div>
          <div className="text-[13px] text-text-secondary font-medium">{grupoAtivo}</div>
        </div>
      </div>

      {/* 4 abas */}
      <div className="flex gap-[4px] px-[26px] py-[14px] border-b border-border bg-header-bg">
        {grupos.map(g => (
          <button
            key={g.titulo}
            onClick={() => setGrupoAtivo(g.titulo)}
            className={`py-[8px] px-[18px] rounded-chip text-[13.5px] font-bold border-none cursor-pointer transition-colors ${
              grupoAtivo === g.titulo
                ? 'bg-primary text-white'
                : 'bg-white text-text-body border border-border hover:border-primary hover:text-primary'
            }`}
          >
            {g.titulo}
          </button>
        ))}
      </div>

      {/* Conteúdo empilhado */}
      <div className="flex-1 overflow-auto p-[24px_26px] bg-header-bg">
        <div className="max-w-[680px] mx-auto flex flex-col gap-[16px]">
          {grupo?.itens.map(item => (
            <div key={item.key}>
              {renderTab(item.key, user)}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default function ConfiguracoesPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopConfiguracoes /> : <MobileConfiguracoes />
}
