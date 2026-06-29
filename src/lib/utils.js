export function calcularIdade(nascimento) {
  if (!nascimento) return '—'
  const nasc = new Date(nascimento)
  const hoje = new Date()
  let anos = hoje.getFullYear() - nasc.getFullYear()
  let meses = hoje.getMonth() - nasc.getMonth()
  if (meses < 0) { anos--; meses += 12 }
  if (hoje.getDate() < nasc.getDate()) { meses--; if (meses < 0) { anos--; meses += 12 } }
  if (anos > 0) return `${anos}a ${meses}m`
  return `${meses}m`
}

export function fmtData(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  return `${d.getUTCDate()} ${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function fmtDataCurta(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  return `${d.getUTCDate()} ${meses[d.getUTCMonth()]}`
}

export function fmtMoeda(valor) {
  const abs = Math.abs(valor)
  if (abs >= 1000) return `R$ ${Math.round(abs / 1000)}k`
  return `R$ ${abs}`
}

export const racas = ['Nelore', 'Angus', 'Brahman', 'Girolando', 'Tabapuã', 'Senepol']

export const categoriasCusto = [
  'Mão de obra',
  'Ração & suplemento',
  'Medicamento / tratamento',
  'Manutenção',
  'Combustível',
  'Outros',
]

export const categoriasReceita = [
  'Venda de gado',
  'Leite',
  'Aluguel de pasto',
  'Subsídio / incentivo',
  'Outros',
]

export const produtosSanitarios = [
  'Aftosa – Bovis',
  'Brucelose – B19',
  'Raiva – Agrovet',
  'Carbúnculo – Sintovac',
  'Ivermectina 1%',
  'Albendazol 10%',
]

export const touros = [
  { value: '0631', label: '0631 · Brahman' },
  { value: 'semen_nelore', label: 'Sêmen Nelore Elite' },
  { value: 'semen_gir', label: 'Sêmen Gir Leiteiro' },
]
