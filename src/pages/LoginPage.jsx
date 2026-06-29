import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { api } from '../lib/api'

export default function LoginPage() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const user = await api.auth.login({ usuario, senha })
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/')
    } catch (err) {
      setErro(err.message || 'Usuário ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  const formFields = (
    <>
      <Input label="Usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} className="mb-[16px]" />
      <Input label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="mb-[8px]" />
      {erro && <div className="text-danger text-[13px] font-semibold mb-[8px]">{erro}</div>}
      <div className="text-right text-[13px] font-bold text-text-secondary mb-[22px] opacity-50">Esqueci a senha</div>
      <Button type="submit" fullWidth disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</Button>
      <div
        onClick={() => navigate('/cadastro')}
        className="text-center text-[13.5px] font-bold text-primary mt-[16px] cursor-pointer"
      >
        Não tem conta? Criar conta
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
            <div className="text-[34px] font-extrabold text-white leading-[1.15] tracking-[-0.02em]">Toda a fazenda<br />na palma da mão.</div>
            <div className="text-[15px] text-sidebar-inactive font-medium mt-[14px] max-w-[380px]">Rebanho, sanidade, reprodução e finanças num só lugar — funciona offline no campo e sincroniza sozinho.</div>
          </div>
          <div className="text-[13px] text-[#7e8f7a] font-semibold">Rebanho · Gestão pecuária</div>
        </div>
        <div className="w-[440px] bg-bg flex flex-col justify-center p-[48px]">
          <div className="text-[24px] font-extrabold text-primary-dark mb-[6px]">Entrar</div>
          <div className="text-[14px] text-text-secondary font-medium mb-[28px]">Acesse com seu usuário da fazenda</div>
          <form onSubmit={handleLogin}>{formFields}</form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-[28px] bg-bg">
      <div className="flex items-center gap-[12px] mb-[8px]">
        <span className="w-[44px] h-[44px] rounded-[13px] bg-primary" />
        <span className="text-[26px] font-extrabold text-primary-dark tracking-[-0.02em]">Rebanho</span>
      </div>
      <div className="text-[14px] text-text-secondary font-medium mb-[28px]">Gestão inteligente do rebanho</div>
      <form onSubmit={handleLogin}>
        {formFields}
        <div className="text-center text-[13.5px] text-text-secondary font-semibold mt-[14px]">Trabalha offline · sincroniza ao reconectar</div>
      </form>
    </div>
  )
}
