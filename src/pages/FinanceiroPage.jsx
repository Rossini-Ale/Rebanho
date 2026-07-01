import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import useApi from '../hooks/useApi'
import KPITile from '../components/ui/KPITile'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Toast from '../components/ui/Toast'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import useToast from '../hooks/useToast'
import { api } from '../lib/api'
import { fmtMoeda, fmtDataCurta, categoriasCusto } from '../lib/utils'
import { ChevronLeft, Download, Wallet, Pencil, Trash2 } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonTable } from '../components/ui/Skeleton'

const mesesAbrev = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
const mesAtual = meses[new Date().getMonth()]

function MobileFinanceiro() {
  const navigate = useNavigate()
  const { data: lancamentos, loading } = useApi(() => api.financeiro.listar(), [])
  const { data: resumo } = useApi(() => api.financeiro.resumo(), [])
  const lista = lancamentos || []
  const rec = resumo ? parseFloat(resumo.receita) : 0
  const desp = resumo ? parseFloat(resumo.despesa) : 0
  const res = rec - desp

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-[20px] pt-[8px] pb-[12px]">
        <div className="flex items-center gap-[14px]">
          <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0"><ChevronLeft size={24} /></button>
          <span className="text-[19px] font-extrabold text-primary-dark">Financeiro</span>
        </div>
        <span className="text-[13px] font-bold text-primary bg-chip-bg py-[6px] px-[12px] rounded-chip">{mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)} ▾</span>
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[8px]">
        <div className="bg-primary rounded-[16px] p-[18px] mb-[14px]">
          <div className="text-[13px] text-accent-light font-semibold">Resultado do mês</div>
          <div className="font-mono text-[34px] font-bold text-white leading-[1.1]">+{fmtMoeda(res)}</div>
          <div className="text-[12.5px] text-accent-light font-semibold mt-[3px]">vendas − (compras + custos)</div>
        </div>

        <div className="flex gap-[10px] mb-[16px]">
          <div className="flex-1 bg-white border border-[#eee9df] rounded-[14px] p-[12px_13px]">
            <div className="text-[11.5px] text-text-secondary font-bold">VENDAS</div>
            <div className="font-mono text-[16px] font-bold text-primary-medium">{fmtMoeda(rec)}</div>
          </div>
          <div className="flex-1 bg-white border border-[#eee9df] rounded-[14px] p-[12px_13px]">
            <div className="text-[11.5px] text-text-secondary font-bold">DESPESAS</div>
            <div className="font-mono text-[16px] font-bold text-danger">{fmtMoeda(desp)}</div>
          </div>
        </div>

        <div className="text-[13px] font-extrabold text-text-secondary uppercase tracking-[.04em] mb-[8px]">Lançamentos</div>
        {loading && <div className="text-center text-text-secondary py-[20px]">Carregando…</div>}
        <div className="flex flex-col gap-[9px]">
          {lista.map(l => (
            <div key={l.id} className="bg-white border border-[#eee9df] rounded-[13px] p-[13px_15px] flex justify-between items-center">
              <div>
                <div className="text-[14.5px] font-bold text-primary-dark">{l.descricao || l.categoria}</div>
                <div className="text-[12px] text-text-secondary">{l.categoria} · {fmtDataCurta(l.data)}</div>
              </div>
              <span className={`font-mono text-[14.5px] font-bold ${parseFloat(l.valor) > 0 ? 'text-primary-medium' : 'text-danger'}`}>
                {parseFloat(l.valor) > 0 ? '+' : '−'}{fmtMoeda(l.valor)}
              </span>
            </div>
          ))}
          {!loading && lista.length === 0 && (
            <div className="text-center text-text-secondary py-[20px] text-[14px]">Nenhum lançamento registrado.</div>
          )}
        </div>
      </div>

      <div className="px-[22px] py-[10px] pb-[24px]">
        <button onClick={() => navigate('/financeiro/custo')} className="w-full bg-white border-[1.5px] border-primary text-primary rounded-[15px] py-[15px] text-[15px] font-extrabold text-center cursor-pointer">+ Novo lançamento</button>
      </div>
    </div>
  )
}

const mesesNomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const selectStyle = "appearance-none bg-white border-[1.5px] border-field-border rounded-sidebar-item py-[9px] px-[14px] pr-[30px] text-[13.5px] font-bold text-primary-dark outline-none cursor-pointer"
const selectBg = { backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%237c8378\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }

function DesktopFinanceiro() {
  const navigate = useNavigate()
  const [mesSel, setMesSel] = useState(new Date().getMonth() + 1)
  const [anoSel, setAnoSel] = useState(new Date().getFullYear())
  const { data: lancamentos, loading, reload } = useApi(() => api.financeiro.listar({ mes: mesSel, ano: anoSel }), [mesSel, anoSel])
  const { data: resumo, reload: reloadResumo } = useApi(() => api.financeiro.resumo({ mes: mesSel, ano: anoSel }), [mesSel, anoSel])
  const { data: mensal } = useApi(() => api.dashboard.mensal(), [])
  const { data: catConfig } = useApi(() => api.configuracoes.buscar('categorias_custo').catch(() => null), [])
  const { data: porLoteData } = useApi(() => api.financeiro.porLote(), [])
  const catList = catConfig?.valor || categoriasCusto
  const { toast, showToast, hideToast } = useToast()
  const lista = lancamentos || []
  const rec = resumo ? parseFloat(resumo.receita) : 0
  const desp = resumo ? parseFloat(resumo.despesa) : 0
  const res = rec - desp
  const porCategoria = resumo?.por_categoria || []
  const maxCat = porCategoria.length ? Math.max(...porCategoria.map(c => parseFloat(c.total))) : 1

  const [editando, setEditando] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [salvandoEdit, setSalvandoEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const abrirEdicao = (l) => {
    const val = parseFloat(l.valor)
    setEditForm({
      tipo: val > 0 ? 'receita' : 'custo',
      categoria: l.categoria || '',
      valor: String(Math.abs(val)),
      data: l.data ? l.data.slice(0, 10) : '',
      descricao: l.descricao || '',
    })
    setEditando(l)
  }

  const handleEditSave = async () => {
    setSalvandoEdit(true)
    try {
      const valorNum = editForm.tipo === 'receita'
        ? Math.abs(parseFloat(editForm.valor))
        : -Math.abs(parseFloat(editForm.valor))
      await api.financeiro.atualizar(editando.id, {
        tipo: editForm.tipo,
        categoria: editForm.categoria,
        valor: valorNum,
        data: editForm.data,
        descricao: editForm.descricao,
      })
      showToast('Lançamento atualizado!')
      setEditando(null)
      reload()
      reloadResumo()
    } catch (err) {
      showToast(err.message || 'Erro ao salvar', 'error')
    } finally { setSalvandoEdit(false) }
  }

  const handleDelete = async (l) => {
    try {
      await api.financeiro.excluir(l.id)
      showToast('Lançamento excluído!')
      setConfirmDelete(null)
      reload()
      reloadResumo()
    } catch (err) {
      showToast(err.message || 'Erro ao excluir', 'error')
    }
  }

  const updateEdit = (field, value) => setEditForm(f => ({ ...f, [field]: value }))

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex justify-between items-center px-[26px] py-[20px] border-b border-border bg-header-bg">
        <div>
          <div className="text-[21px] font-extrabold text-primary-dark tracking-[-0.01em]">Financeiro</div>
          <div className="text-[13px] text-text-secondary font-medium">Resultado de {mesesNomes[mesSel - 1].toLowerCase()} {anoSel}</div>
        </div>
        <div className="flex gap-[10px] items-center">
          <div className="flex gap-[8px] items-center">
            <select value={mesSel} onChange={e => setMesSel(Number(e.target.value))} className={selectStyle} style={selectBg}>
              {mesesNomes.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={anoSel} onChange={e => setAnoSel(Number(e.target.value))} className={selectStyle} style={selectBg}>
              {[new Date().getFullYear(), new Date().getFullYear() - 1].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button
            onClick={() => {
              const dados = { exportado_em: new Date().toISOString(), lancamentos: lista, resumo: { receita: rec, despesa: desp, resultado: res } }
              const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `financeiro-${mesesNomes[mesSel - 1].toLowerCase()}-${anoSel}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer flex items-center gap-[6px]"
          ><Download size={15} /> Exportar</button>
          <button onClick={() => navigate('/financeiro/custo')} className="bg-primary text-white rounded-sidebar-item py-[9px] px-[16px] text-[13.5px] font-bold cursor-pointer border-none">+ Lançamento</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[22px_26px] bg-header-bg">
        <div className="grid grid-cols-4 gap-[14px] mb-[16px]">
          <KPITile label="Receita" value={fmtMoeda(rec)} subtitle={mesesNomes[mesSel - 1].toLowerCase()} />
          <KPITile label="Despesa" value={fmtMoeda(desp)} subtitle={mesesNomes[mesSel - 1].toLowerCase()} />
          <KPITile label="Resultado" value={`+${fmtMoeda(res)}`} subtitle={mesesNomes[mesSel - 1].toLowerCase()} />
          <KPITile label="Margem" value={rec ? `${Math.round((res / rec) * 100)}%` : '—'} subtitle={`acum. ${anoSel}`} variant="primary" />
        </div>

        <div className="grid grid-cols-[1.5fr_1fr] gap-[14px]">
          <div className="bg-white border border-border rounded-[14px] p-[18px]">
            {(() => {
              const dados = (mensal || []).filter(m => m.receita > 0 || m.despesa > 0)
              if (dados.length === 0) {
                return (
                  <>
                    <div className="flex justify-between items-center mb-[14px]">
                      <span className="text-[15px] font-extrabold text-primary-dark">Receita × Despesa</span>
                    </div>
                    <div className="flex items-center justify-center h-[180px] text-text-secondary text-[14px] font-medium">Sem dados suficientes</div>
                  </>
                )
              }
              const maxVal = Math.max(...dados.map(d => Math.max(d.receita, d.despesa))) || 1
              const barW = Math.min(15, Math.floor(400 / dados.length / 2.5))
              return (
                <>
                  <div className="flex justify-between items-center mb-[14px]">
                    <span className="text-[15px] font-extrabold text-primary-dark">Receita × Despesa</span>
                    <span className="text-[12px] text-text-secondary font-semibold">{dados[0].nome} – {dados[dados.length - 1].nome}</span>
                  </div>
                  <svg viewBox="0 0 560 180" className="w-full h-[180px]">
                    <line x1="40" y1="150" x2="548" y2="150" stroke="#cfd4c7" strokeWidth="1.5" />
                    {dados.map((d, i) => {
                      const x = 64 + i * (500 / dados.length)
                      const h1 = Math.round((d.receita / maxVal) * 120)
                      const h2 = Math.round((d.despesa / maxVal) * 120)
                      return (
                        <g key={i}>
                          <rect x={x} y={150 - h1} width={barW} height={h1} rx="2" fill={i === dados.length - 1 ? '#588157' : '#3a5a40'}>
                            <title>Receita {d.nome}: R$ {d.receita.toLocaleString('pt-BR')}</title>
                          </rect>
                          <rect x={x + barW + 3} y={150 - h2} width={barW} height={h2} rx="2" fill="#b54a2f">
                            <title>Despesa {d.nome}: R$ {d.despesa.toLocaleString('pt-BR')}</title>
                          </rect>
                        </g>
                      )
                    })}
                  </svg>
                  <div className="flex gap-[16px] text-[12px] font-semibold mt-[6px]"><span className="text-primary">■ Receita</span><span className="text-danger">■ Despesa</span></div>
                </>
              )
            })()}
          </div>

          <div className="bg-white border border-border rounded-[14px] p-[18px]">
            <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Despesa por categoria</div>
            <div className="flex flex-col gap-[12px]">
              {porCategoria.map((d, i) => (
                <div key={d.categoria}>
                  <div className="flex justify-between text-[13px] mb-[5px]">
                    <span className="font-semibold text-text-body">{d.categoria}</span>
                    <span className="font-mono font-bold text-primary-dark">{fmtMoeda(parseFloat(d.total))}</span>
                  </div>
                  <div className="h-[8px] bg-segmented-bg rounded-[6px]">
                    <div className="h-full rounded-[6px]" style={{ width: `${Math.round((parseFloat(d.total) / maxCat) * 100)}%`, background: i === 0 ? '#b54a2f' : '#c9882a' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[14px] bg-white border border-border rounded-[14px] p-[18px]">
          <div className="flex justify-between items-center mb-[14px]">
            <span className="text-[15px] font-extrabold text-primary-dark">Lançamentos</span>
          </div>
          <div className="grid grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr_0.5fr] py-[10px] px-[4px] text-[12px] font-semibold text-text-secondary border-b border-border mb-[2px]"><span>Descrição</span><span>Tipo</span><span>Data</span><span className="text-right">Valor</span><span></span></div>
          {lista.map(l => {
            const val = parseFloat(l.valor)
            const isPositive = val > 0
            const tipoLabel = isPositive ? 'Receita' : (l.tipo === 'compra' ? 'Compra' : 'Custo')
            const tipoColor = isPositive ? 'text-primary-medium' : 'text-danger'
            return (
              <div key={l.id} className="group grid grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr_0.5fr] py-[11px] px-[4px] text-[13.5px] text-text-body items-center rounded-[8px] hover:bg-[#f5f3ec] transition-colors">
                <span className="font-bold text-primary-dark">{l.descricao || l.categoria}</span>
                <span className={`text-[12px] font-bold ${tipoColor}`}>{tipoLabel}</span>
                <span className="font-mono">{fmtDataCurta(l.data)}</span>
                <span className={`font-mono font-bold text-right ${isPositive ? 'text-primary-medium' : 'text-danger'}`}>{isPositive ? '+' : '−'}{fmtMoeda(l.valor)}</span>
                <span className="flex gap-[6px] justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => abrirEdicao(l)} className="p-[6px] rounded-[8px] bg-transparent border-none cursor-pointer text-text-secondary hover:bg-chip-bg hover:text-primary-dark transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => setConfirmDelete(l)} className="p-[6px] rounded-[8px] bg-transparent border-none cursor-pointer text-text-secondary hover:bg-[#fde8e4] hover:text-danger transition-colors"><Trash2 size={14} /></button>
                </span>
              </div>
            )
          })}
          {loading && !lista.length && <SkeletonTable rows={4} cols={4} />}
          {!loading && lista.length === 0 && (
            <EmptyState icon={Wallet} title="Nenhum lançamento" description="Registre receitas e despesas para acompanhar as finanças da fazenda." actionLabel="Novo lançamento" onAction={() => navigate('/financeiro/custo')} />
          )}
        </div>

        {porLoteData && porLoteData.length > 0 && (
          <div className="mt-[14px] bg-white border border-border rounded-[14px] p-[18px]">
            <div className="text-[15px] font-extrabold text-primary-dark mb-[14px]">Rentabilidade por lote</div>
            <div className="grid grid-cols-[1fr_.8fr_.8fr_1fr] py-[10px] px-[4px] text-[12px] font-semibold text-text-secondary border-b border-border mb-[2px]">
              <span>Lote</span><span className="text-right">Receita</span><span className="text-right">Despesa</span><span className="text-right">Resultado</span>
            </div>
            {porLoteData.map(l => (
              <div key={l.nome} className="grid grid-cols-[1fr_.8fr_.8fr_1fr] py-[10px] px-[4px] text-[13.5px] text-text-body items-center rounded-[8px] hover:bg-[#f5f3ec] transition-colors">
                <span className="font-bold text-primary-dark">{l.nome}</span>
                <span className="font-mono text-right text-primary-medium">{fmtMoeda(l.receita)}</span>
                <span className="font-mono text-right text-danger">{fmtMoeda(l.despesa)}</span>
                <span className={`font-mono font-bold text-right ${l.resultado >= 0 ? 'text-primary-medium' : 'text-danger'}`}>
                  {l.resultado >= 0 ? '+' : '−'}{fmtMoeda(Math.abs(l.resultado))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {editando && editForm && (
        <Modal
          title="Editar lançamento"
          subtitle={editando.descricao || editando.categoria}
          width={460}
          onClose={() => setEditando(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button onClick={handleEditSave} disabled={salvandoEdit}>
                {salvandoEdit ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </>
          }
        >
          <Select
            label="Tipo"
            value={editForm.tipo}
            onChange={e => updateEdit('tipo', e.target.value)}
            options={[{ value: 'receita', label: 'Receita' }, { value: 'custo', label: 'Custo' }, { value: 'compra', label: 'Compra' }]}
            className="mb-[16px]"
          />
          <Select
            label="Categoria"
            value={editForm.categoria}
            onChange={e => updateEdit('categoria', e.target.value)}
            options={catList.map(c => ({ value: c, label: c }))}
            className="mb-[16px]"
          />
          <Input
            label="Valor (R$)"
            value={editForm.valor}
            onChange={e => updateEdit('valor', e.target.value)}
            mono
            className="mb-[16px]"
          />
          <Input
            label="Data"
            type="date"
            value={editForm.data}
            onChange={e => updateEdit('data', e.target.value)}
            className="mb-[16px]"
          />
          <Input
            label="Descrição"
            value={editForm.descricao}
            onChange={e => updateEdit('descricao', e.target.value)}
            placeholder="Descrição do lançamento"
            className="mb-[4px]"
          />
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir lançamento"
          message={`Tem certeza que deseja excluir "${confirmDelete.descricao || confirmDelete.categoria}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}

export default function FinanceiroPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopFinanceiro /> : <MobileFinanceiro />
}
