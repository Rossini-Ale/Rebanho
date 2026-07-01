import { useNavigate, Navigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import useMediaQuery from '../hooks/useMediaQuery'

const itens = [
  { label: 'Sanidade', to: '/sanidade' },
  { label: 'Reprodução', to: '/reproducao' },
  { label: 'Financeiro', to: '/financeiro' },
  { label: 'Relatórios', to: '/relatorios' },
  { label: 'Configurações', to: '/configuracoes' },
]

export default function MaisPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = (user.nome || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  if (isDesktop) return <Navigate to="/" replace />

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[12px] px-[22px] py-[8px] pt-[14px]">
        <button onClick={() => navigate(-1)} className="text-primary bg-transparent border-none cursor-pointer p-0">
          <ChevronLeft size={24} />
        </button>
        <div className="text-[21px] font-extrabold text-primary-dark">Mais</div>
      </div>

      <div className="mx-[22px] mb-[14px] bg-chip-bg rounded-[14px] py-[13px] px-[16px] flex items-center gap-[12px]">
        <span className="w-[36px] h-[36px] rounded-full bg-primary text-white flex items-center justify-center text-[13px] font-bold shrink-0">{initials}</span>
        <div className="flex-1">
          <div className="text-[13.5px] font-bold text-primary-dark">{user.nome || 'Usuário'}</div>
          <div className="text-[12px] text-text-body font-medium">{user.papel === 'admin' ? 'Administrador' : 'Operador'}</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-[22px] pb-[8px]">
        <div className="bg-white border border-[#eee9df] rounded-[16px] overflow-hidden">
          {itens.map((item, i) => (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className="w-full flex items-center gap-[14px] py-[15px] px-[16px] bg-transparent border-none cursor-pointer"
              style={i < itens.length - 1 ? { borderBottom: '1px solid #f0ede4' } : {}}
            >
              <span className="w-[34px] h-[34px] rounded-chip bg-chip-bg shrink-0" />
              <span className="flex-1 text-left text-[15.5px] font-bold text-primary-dark">{item.label}</span>
              <span className="text-[#b8bdb0] font-bold">›</span>
            </button>
          ))}
        </div>

        <div onClick={handleLogout} className="text-center py-[18px] text-[14.5px] font-bold text-danger cursor-pointer">
          Sair
        </div>
      </div>
    </div>
  )
}
