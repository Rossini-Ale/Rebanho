export const animais = [
  { id: 1, brinco: '0427', raca: 'Nelore', sexo: 'Fêmea', nascimento: '2023-04-12', origem: 'nascido_aqui', lote: 'Pasto 3', situacao: 'ativo', peso: 418, ultimaPesagem: '2026-05-12', pesoAnterior: 406, foto: null },
  { id: 2, brinco: '0915', raca: 'Nelore', sexo: 'Fêmea', nascimento: '2022-05-20', origem: 'nascido_aqui', lote: 'Pasto 3', situacao: 'prenhe', peso: 502, ultimaPesagem: '2026-05-10', pesoAnterior: 490, foto: null },
  { id: 3, brinco: '1138', raca: 'Angus', sexo: 'Macho', nascimento: '2024-06-15', origem: 'comprado', lote: 'Pasto 1', situacao: 'ativo', peso: 465, ultimaPesagem: '2026-05-12', pesoAnterior: 448, foto: null },
  { id: 4, brinco: '0822', raca: 'Nelore', sexo: 'Fêmea', nascimento: '2021-03-08', origem: 'nascido_aqui', lote: 'Curral', situacao: 'ativo', peso: 530, ultimaPesagem: '2026-05-12', pesoAnterior: 518, foto: null },
  { id: 5, brinco: '0428', raca: 'Nelore', sexo: 'Fêmea', nascimento: '2026-03-18', origem: 'nascido_aqui', lote: 'Maternidade', situacao: 'ativo', peso: 96, ultimaPesagem: '2026-06-01', pesoAnterior: 82, foto: null },
  { id: 6, brinco: '0560', raca: 'Nelore', sexo: 'Fêmea', nascimento: '2020-06-24', origem: 'comprado', lote: 'Quarentena', situacao: 'quarentena', peso: 545, ultimaPesagem: '2026-05-12', pesoAnterior: 538, foto: null },
  { id: 7, brinco: '0631', raca: 'Brahman', sexo: 'Macho', nascimento: '2022-12-10', origem: 'comprado', lote: 'Pasto 1', situacao: 'ativo', peso: 540, ultimaPesagem: '2026-05-12', pesoAnterior: 525, foto: null },
  { id: 8, brinco: '1204', raca: 'Girolando', sexo: 'Fêmea', nascimento: '2024-02-14', origem: 'nascido_aqui', lote: 'Pasto 1', situacao: 'ativo', peso: 410, ultimaPesagem: '2026-05-12', pesoAnterior: 398, foto: null },
  { id: 9, brinco: '0488', raca: 'Nelore', sexo: 'Fêmea', nascimento: '2023-08-02', origem: 'nascido_aqui', lote: 'Pasto 3', situacao: 'ativo', peso: 395, ultimaPesagem: '2026-05-10', pesoAnterior: 382, foto: null },
  { id: 10, brinco: '0502', raca: 'Angus', sexo: 'Macho', nascimento: '2023-01-20', origem: 'comprado', lote: 'Pasto 3', situacao: 'ativo', peso: 470, ultimaPesagem: '2026-05-12', pesoAnterior: 455, foto: null },
  { id: 11, brinco: '0533', raca: 'Nelore', sexo: 'Fêmea', nascimento: '2023-06-11', origem: 'nascido_aqui', lote: 'Pasto 3', situacao: 'ativo', peso: 410, ultimaPesagem: '2026-05-10', pesoAnterior: 400, foto: null },
  { id: 12, brinco: '0571', raca: 'Nelore', sexo: 'Fêmea', nascimento: '2023-02-28', origem: 'nascido_aqui', lote: 'Pasto 3', situacao: 'ativo', peso: 388, ultimaPesagem: '2026-05-12', pesoAnterior: 375, foto: null },
]

export const historico = [
  { animalId: 1, tipo: 'pesagem', descricao: 'Pesagem', detalhe: '12 mai · curral', valor: '418 kg', variacao: '+12 kg' },
  { animalId: 1, tipo: 'vacina', descricao: 'Vacina · Aftosa', detalhe: '12 mai · lote', valor: null, status: 'Em dia' },
  { animalId: 1, tipo: 'lote', descricao: 'Mudança de lote', detalhe: '02 abr', valor: 'Pasto 1 → 3', variacao: null },
  { animalId: 2, tipo: 'pesagem', descricao: 'Pesagem', detalhe: '10 mai · curral', valor: '502 kg', variacao: '+12 kg' },
  { animalId: 2, tipo: 'vacina', descricao: 'Vacina · Aftosa', detalhe: '12 mai · lote', valor: null, status: 'Em dia' },
  { animalId: 4, tipo: 'pesagem', descricao: 'Pesagem', detalhe: '12 mai · curral', valor: '530 kg', variacao: '+12 kg' },
  { animalId: 6, tipo: 'custo', descricao: 'Antibiótico — casco', detalhe: '22 jun · individual', valor: '−R$ 120', tag: 'INDIVIDUAL' },
  { animalId: 6, tipo: 'custo', descricao: 'Ração & suplemento', detalhe: 'rateio Pasto 3 · jun', valor: '−R$ 50', tag: 'RATEIO' },
]

export const lotes = [
  { id: 1, nome: 'Pasto 1', tipo: 'pasto', area: 42, capacidade: 100, mockQtd: 86 },
  { id: 2, nome: 'Pasto 2', tipo: 'pasto', area: 38, capacidade: 90, mockQtd: 64 },
  { id: 3, nome: 'Pasto 3', tipo: 'pasto', area: 30, capacidade: 80, mockQtd: 34 },
  { id: 4, nome: 'Maternidade', tipo: 'maternidade', area: 5, capacidade: 20, mockQtd: 9 },
  { id: 5, nome: 'Curral', tipo: 'curral', area: null, capacidade: null, mockQtd: 12 },
  { id: 6, nome: 'Quarentena', tipo: 'pasto', area: 10, capacidade: 30, mockQtd: 1 },
]

export function animaisPorLote(nomeDoLote) {
  return animais.filter(a => a.lote === nomeDoLote)
}

export function contarAnimaisLote(lote) {
  const reais = animais.filter(a => a.lote === lote.nome).length
  return lote.mockQtd || reais
}

export function pesoMedioLote(nomeDoLote) {
  const lista = animais.filter(a => a.lote === nomeDoLote)
  if (lista.length === 0) return 0
  return Math.round(lista.reduce((s, a) => s + a.peso, 0) / lista.length)
}

export const eventosSanitarios = [
  { id: 1, tipo: 'vacina', produto: 'Reforço Aftosa', alvo: 'lote', lote: 'Pasto 3', qtdAnimais: 34, data: '2026-06-21', urgencia: 'vencido', status: 'Era 21 jun · atrasado 2 dias' },
  { id: 2, tipo: 'vermifugo', produto: 'Vermífugo', alvo: 'lote', lote: 'Curral', qtdAnimais: 12, data: '2026-06-26', urgencia: 'proximo', status: '26 jun · em 3 dias' },
  { id: 3, tipo: 'vacina', produto: 'Brucelose (fêmeas)', alvo: 'lote', lote: 'Pasto 1', qtdAnimais: 48, data: '2026-06-28', urgencia: 'agendado', status: '28 jun · em 5 dias' },
  { id: 4, tipo: 'exame', produto: 'Pesagem + exame', alvo: 'lote', lote: 'Pasto 1', qtdAnimais: 86, data: '2026-06-30', urgencia: 'agendado', status: '30 jun · em 7 dias' },
]

export const historicoSanitario = [
  { id: 10, tipo: 'vacina', produto: 'Aftosa – Bovis', alvo: 'lote', lote: 'Pasto 1', qtdAnimais: 86, data: '2026-05-12', responsavel: 'João Carlos' },
  { id: 11, tipo: 'vermifugo', produto: 'Ivermectina', alvo: 'lote', lote: 'Curral', qtdAnimais: 12, data: '2026-04-20', responsavel: 'João Carlos' },
  { id: 12, tipo: 'vacina', produto: 'Aftosa – Bovis', alvo: 'lote', lote: 'Pasto 3', qtdAnimais: 34, data: '2026-03-21', responsavel: 'João Carlos' },
]

export const produtosSanitarios = [
  'Aftosa – Bovis',
  'Brucelose – B19',
  'Raiva – Agrovet',
  'Carbúnculo – Sintovac',
  'Ivermectina 1%',
  'Albendazol 10%',
]

export const coberturas = [
  { id: 1, femeaId: 2, brinco: '0915', raca: 'Nelore', metodo: 'IA', touro: 'Sêmen Nelore Elite', dataCobertura: '2025-09-25', dataPrevParto: '2026-07-05', status: 'parto_proximo' },
  { id: 2, femeaId: 4, brinco: '0822', raca: 'Nelore', metodo: 'Monta', touro: '0631', dataCobertura: '2025-11-04', dataPrevParto: '2026-08-14', status: 'confirmada' },
  { id: 3, femeaId: 8, brinco: '1204', raca: 'Girolando', metodo: 'IA', touro: 'Sêmen Gir Leiteiro', dataCobertura: '2026-06-02', dataPrevParto: '2027-03-12', status: 'aguardando' },
  { id: 4, femeaId: 6, brinco: '0560', raca: 'Nelore', metodo: 'Monta', touro: '0631', dataCobertura: '2025-11-23', dataPrevParto: '2026-09-02', status: 'confirmada' },
]

export const touros = [
  { value: '0631', label: '0631 · Brahman' },
  { value: 'semen_nelore', label: 'Sêmen Nelore Elite' },
  { value: 'semen_gir', label: 'Sêmen Gir Leiteiro' },
]

export function fmtData(iso) {
  if (!iso) return '—'
  const [a, m, d] = iso.split('-')
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${a}`
}

export function fmtDataCurta(iso) {
  if (!iso) return '—'
  const [, m, d] = iso.split('-')
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  return `${parseInt(d)} ${meses[parseInt(m) - 1]}`
}

export const lancamentos = [
  { id: 1, tipo: 'venda', descricao: 'Venda · 6 bois', detalhe: '18 jun · 3.180 kg · R$ 305/@', valor: 64000, data: '2026-06-18' },
  { id: 2, tipo: 'venda', descricao: 'Venda · 4 novilhas', detalhe: '12 jun · 1.840 kg', valor: 48000, data: '2026-06-12' },
  { id: 3, tipo: 'custo', descricao: 'Ração · 80 sacas', detalhe: '08 jun · custo geral', valor: -7000, data: '2026-06-08' },
  { id: 4, tipo: 'compra', descricao: 'Compra · 2 touros', detalhe: '04 jun · Faz. Boa Vista', valor: -18000, data: '2026-06-04' },
  { id: 5, tipo: 'custo', descricao: 'Mão de obra', detalhe: '01 jun · mensal', valor: -4500, data: '2026-06-01' },
  { id: 6, tipo: 'custo', descricao: 'Medicamentos', detalhe: '28 mai · custo geral', valor: -2500, data: '2026-05-28' },
]

export const categoriasCusto = [
  'Mão de obra',
  'Ração & suplemento',
  'Medicamento / tratamento',
  'Manutenção',
  'Combustível',
  'Outros',
]

export const despesaPorCategoria = [
  { nome: 'Compra de animais', valor: 60000 },
  { nome: 'Ração & suplemento', valor: 42000 },
  { nome: 'Mão de obra', valor: 38000 },
  { nome: 'Medic. + manutenção', valor: 25000 },
]

export function fmtMoeda(valor) {
  const abs = Math.abs(valor)
  if (abs >= 1000) return `R$ ${Math.round(abs / 1000)}k`
  return `R$ ${abs}`
}

export const racas = ['Nelore', 'Angus', 'Brahman', 'Girolando', 'Tabapuã', 'Senepol']

export function calcularIdade(nascimento) {
  const nasc = new Date(nascimento)
  const hoje = new Date()
  let anos = hoje.getFullYear() - nasc.getFullYear()
  let meses = hoje.getMonth() - nasc.getMonth()
  if (meses < 0) { anos--; meses += 12 }
  if (hoje.getDate() < nasc.getDate()) { meses--; if (meses < 0) { anos--; meses += 12 } }
  if (anos > 0) return `${anos}a ${meses}m`
  return `${meses}m`
}
