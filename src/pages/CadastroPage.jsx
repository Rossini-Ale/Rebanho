import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { api } from '../lib/api'

export default function CadastroPage() {
  const [form, setForm] = useState({
    nome: '', usuario: '', email: '', senha: '', confirmarSenha: '',
    papel: 'operador', nome_fazenda: '', localizacao_fazenda: '', codigo_convite: '',
  })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleCadastro = async (e) => {
    e.preventDefault()
    setErro('')

    if (!form.nome || !form.usuario || !form.senha) {
      setErro('Preencha todos os campos obrigatórios')
      return
    }
    if (form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres')
      return
    }
    if (form.senha !== form.confirmarSenha) {
      setErro('As senhas não conferem')
      return
    }
    if (form.papel === 'admin' && !form.nome_fazenda) {
      setErro('Informe o nome da fazenda')
      return
    }
    if (form.papel === 'operador' && !form.codigo_convite) {
      setErro('Informe o código de convite da fazenda')
      return
    }

    setLoading(true)
    try {
      await api.auth.register({
        nome: form.nome,
        usuario: form.usuario,
        email: form.email,
        senha: form.senha,
        papel: form.papel,
        nome_fazenda: form.papel === 'admin' ? form.nome_fazenda : undefined,
        localizacao_fazenda: form.papel === 'admin' ? form.localizacao_fazenda : undefined,
        codigo_convite: form.papel === 'operador' ? form.codigo_convite : undefined,
      })
      const user = await api.auth.login({ usuario: form.usuario, senha: form.senha })
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/')
    } catch (err) {
      setErro(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const formFields = (
    <>
      <Input label="Nome completo *" value={form.nome} onChange={e => update('nome', e.target.value)} placeholder="Ex: Maria Silva" className="mb-[16px]" />
      <Input label="Usuário *" value={form.usuario} onChange={e => update('usuario', e.target.value)} placeholder="Ex: maria.silva" className="mb-[16px]" />
      <Input label="E-mail" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="Ex: maria@fazenda.com" className="mb-[16px]" />
      <Select
        label="Função"
        value={form.papel}
        onChange={e => update('papel', e.target.value)}
        options={[
          { value: 'operador', label: 'Operador (entrar em fazenda existente)' },
          { value: 'admin', label: 'Administrador (criar nova fazenda)' },
        ]}
        className="mb-[16px]"
      />

      {form.papel === 'admin' && (
        <>
          <div className="bg-chip-bg rounded-[14px] p-[14px_16px] mb-[16px]">
            <div className="text-[12.5px] font-bold text-primary-dark mb-[2px]">Nova fazenda</div>
            <div className="text-[12px] text-text-secondary font-medium">Ao criar a conta, um código de convite será gerado para você compartilhar com seus operadores.</div>
          </div>
          <Input label="Nome da fazenda *" value={form.nome_fazenda} onChange={e => update('nome_fazenda', e.target.value)} placeholder="Ex: Fazenda Santa Rita" className="mb-[16px]" />
          <Input label="Localização" value={form.localizacao_fazenda} onChange={e => update('localizacao_fazenda', e.target.value)} placeholder="Ex: Uberaba, MG" className="mb-[16px]" />
        </>
      )}

      {form.papel === 'operador' && (
        <>
          <div className="bg-chip-bg rounded-[14px] p-[14px_16px] mb-[16px]">
            <div className="text-[12.5px] font-bold text-primary-dark mb-[2px]">Entrar em fazenda existente</div>
            <div className="text-[12px] text-text-secondary font-medium">Peça o código de convite ao administrador da fazenda.</div>
          </div>
          <Input label="Código de convite *" value={form.codigo_convite} onChange={e => update('codigo_convite', e.target.value.toUpperCase())} placeholder="Ex: SANTA-RITA-4X7K" className="mb-[16px]" />
        </>
      )}

      <Input label="Senha *" type="password" value={form.senha} onChange={e => update('senha', e.target.value)} placeholder="Mínimo 6 caracteres" className="mb-[16px]" />
      <Input label="Confirmar senha *" type="password" value={form.confirmarSenha} onChange={e => update('confirmarSenha', e.target.value)} placeholder="Repita a senha" className="mb-[8px]" />
      {erro && <div className="text-danger text-[13px] font-semibold mb-[8px]">{erro}</div>}
      <Button type="submit" fullWidth disabled={loading} className="mt-[14px]">{loading ? 'Criando conta…' : 'Criar conta'}</Button>
      <div
        onClick={() => navigate('/login')}
        className="text-center text-[13.5px] font-bold text-primary mt-[16px] cursor-pointer"
      >
        Já tem conta? Entrar
      </div>
    </>
  )

  if (isDesktop) {
    return (
      <div className="h-dvh flex">
        <div className="flex-1 bg-primary-dark flex flex-col justify-between p-[48px]">
          <div className="flex items-center gap-[12px]">
            <span className="w-[38px] h-[38px] rounded-[11px] bg-primary-medium" />
            <span className="text-[22px] font-extrabold text-white">Rebanho</span>
          </div>
          <div>
            <div className="text-[34px] font-extrabold text-white leading-[1.15] tracking-[-0.02em]">Gerencie sua<br />fazenda com<br />facilidade.</div>
            <div className="text-[15px] text-sidebar-inactive font-medium mt-[14px] max-w-[380px]">Crie sua conta e tenha acesso completo ao controle do rebanho, sanidade, reprodução e finanças.</div>
          </div>
          <div className="text-[13px] text-[#7e8f7a] font-semibold">Rebanho · Gestão pecuária</div>
        </div>
        <div className="w-[470px] bg-bg flex flex-col justify-center p-[48px] overflow-auto">
          <div className="text-[24px] font-extrabold text-primary-dark mb-[6px]">Criar conta</div>
          <div className="text-[14px] text-text-secondary font-medium mb-[28px]">Preencha os dados para começar</div>
          <form onSubmit={handleCadastro}>{formFields}</form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-[28px] bg-bg py-[40px]">
      <div className="flex items-center gap-[12px] mb-[8px]">
        <span className="w-[44px] h-[44px] rounded-[13px] bg-primary" />
        <span className="text-[26px] font-extrabold text-primary-dark tracking-[-0.02em]">Rebanho</span>
      </div>
      <div className="text-[14px] text-text-secondary font-medium mb-[28px]">Criar nova conta</div>
      <form onSubmit={handleCadastro}>{formFields}</form>
    </div>
  )
}
