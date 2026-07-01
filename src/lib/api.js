const BASE = '/api'

function getToken() {
  return localStorage.getItem('token')
}

function getFazendaId() {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    return user?.fazenda_id || null
  } catch {
    return null
  }
}

async function request(path, options = {}) {
  const fazendaId = getFazendaId()
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (fazendaId) headers['x-fazenda-id'] = String(fazendaId)
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  })
  if (res.status === 401 && !path.startsWith('/auth/')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    throw new Error('Sessão expirada')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Erro na requisição')
  }
  return res.json()
}

export const api = {
  animais: {
    listar: (params) => request(`/animais?${new URLSearchParams(params || {})}`),
    buscar: (id) => request(`/animais/${id}`),
    historico: (id) => request(`/animais/${id}/historico`),
    pesagens: (id) => request(`/animais/${id}/pesagens`),
    genealogia: (id) => request(`/animais/${id}/genealogia`),
    criar: (data) => request('/animais', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id, data) => request(`/animais/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    registrarPeso: (id, data) => request(`/animais/${id}/pesagens`, { method: 'POST', body: JSON.stringify(data) }),
    mover: (id, data) => request(`/animais/${id}/mover`, { method: 'POST', body: JSON.stringify(data) }),
    custos: (id) => request(`/animais/${id}/custos`),
    reproducao: (id) => request(`/animais/${id}/reproducao`),
    excluir: (id) => request(`/animais/${id}`, { method: 'DELETE' }),
  },

  lotes: {
    listar: () => request('/lotes'),
    buscar: (id) => request(`/lotes/${id}`),
    animais: (id) => request(`/lotes/${id}/animais`),
    criar: (data) => request('/lotes', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id, data) => request(`/lotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    excluir: (id) => request(`/lotes/${id}`, { method: 'DELETE' }),
  },

  sanidade: {
    listar: (params) => request(`/sanidade?${new URLSearchParams(params || {})}`),
    criar: (data) => request('/sanidade', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id, data) => request(`/sanidade/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    excluir: (id) => request(`/sanidade/${id}`, { method: 'DELETE' }),
  },

  reproducao: {
    listar: () => request('/reproducao'),
    stats: () => request('/reproducao/stats'),
    cobertura: (data) => request('/reproducao/cobertura', { method: 'POST', body: JSON.stringify(data) }),
    atualizarCobertura: (id, data) => request(`/reproducao/cobertura/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    excluirCobertura: (id) => request(`/reproducao/cobertura/${id}`, { method: 'DELETE' }),
    parto: (data) => request('/reproducao/parto', { method: 'POST', body: JSON.stringify(data) }),
  },

  financeiro: {
    listar: (params) => request(`/financeiro?${new URLSearchParams(params || {})}`),
    resumo: (params) => request(`/financeiro/resumo?${new URLSearchParams(params || {})}`),
    porLote: () => request('/financeiro/por-lote'),
    criar: (data) => request('/financeiro', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id, data) => request(`/financeiro/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    excluir: (id) => request(`/financeiro/${id}`, { method: 'DELETE' }),
  },

  auth: {
    login: async (data) => {
      const res = await request('/auth/login', { method: 'POST', body: JSON.stringify(data) })
      if (res.token) localStorage.setItem('token', res.token)
      return res
    },
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
    mudarSenha: (data) => request('/auth/senha', { method: 'PUT', body: JSON.stringify(data) }),
    logout: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    },
  },

  fazendas: {
    buscar: (id) => request(`/fazendas/${id}`),
    atualizar: (id, data) => request(`/fazendas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    usuarios: (id) => request(`/fazendas/${id}/usuarios`),
    removerUsuario: (fazendaId, userId) => request(`/fazendas/${fazendaId}/usuarios/${userId}`, { method: 'DELETE' }),
    redefinirSenhaUsuario: (fazendaId, userId, nova_senha) => request(`/fazendas/${fazendaId}/usuarios/${userId}/senha`, { method: 'PUT', body: JSON.stringify({ nova_senha }) }),
  },

  dashboard: {
    stats: () => request('/dashboard/stats'),
    alertas: () => request('/dashboard/alertas'),
    mensal: () => request('/dashboard/mensal'),
  },

  relatorios: {
    rebanho: (params) => request(`/relatorios/rebanho?${new URLSearchParams(params || {})}`),
    sanidade: (params) => request(`/relatorios/sanidade?${new URLSearchParams(params || {})}`),
    financeiro: (params) => request(`/relatorios/financeiro?${new URLSearchParams(params || {})}`),
  },

  configuracoes: {
    buscar: (chave) => request(`/configuracoes/${chave}`),
    salvar: (chave, valor) => request(`/configuracoes/${chave}`, { method: 'PUT', body: JSON.stringify({ valor }) }),
  },
}
