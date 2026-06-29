const BASE = '/api'

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
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (fazendaId) headers['x-fazenda-id'] = String(fazendaId)

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  })
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
    criar: (data) => request('/animais', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id, data) => request(`/animais/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    registrarPeso: (id, data) => request(`/animais/${id}/pesagens`, { method: 'POST', body: JSON.stringify(data) }),
    mover: (id, data) => request(`/animais/${id}/mover`, { method: 'POST', body: JSON.stringify(data) }),
    custos: (id) => request(`/animais/${id}/custos`),
    reproducao: (id) => request(`/animais/${id}/reproducao`),
  },

  lotes: {
    listar: () => request('/lotes'),
    buscar: (id) => request(`/lotes/${id}`),
    animais: (id) => request(`/lotes/${id}/animais`),
    criar: (data) => request('/lotes', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id, data) => request(`/lotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  sanidade: {
    listar: (params) => request(`/sanidade?${new URLSearchParams(params || {})}`),
    criar: (data) => request('/sanidade', { method: 'POST', body: JSON.stringify(data) }),
  },

  reproducao: {
    listar: () => request('/reproducao'),
    stats: () => request('/reproducao/stats'),
    cobertura: (data) => request('/reproducao/cobertura', { method: 'POST', body: JSON.stringify(data) }),
    parto: (data) => request('/reproducao/parto', { method: 'POST', body: JSON.stringify(data) }),
  },

  financeiro: {
    listar: (params) => request(`/financeiro?${new URLSearchParams(params || {})}`),
    resumo: (params) => request(`/financeiro/resumo?${new URLSearchParams(params || {})}`),
    porLote: () => request('/financeiro/por-lote'),
    criar: (data) => request('/financeiro', { method: 'POST', body: JSON.stringify(data) }),
  },

  auth: {
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },

  fazendas: {
    buscar: (id) => request(`/fazendas/${id}`),
    atualizar: (id, data) => request(`/fazendas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    usuarios: (id) => request(`/fazendas/${id}/usuarios`),
    removerUsuario: (fazendaId, userId) => request(`/fazendas/${fazendaId}/usuarios/${userId}`, { method: 'DELETE' }),
  },

  dashboard: {
    stats: () => request('/dashboard/stats'),
    alertas: () => request('/dashboard/alertas'),
  },
}
