import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Beef,
  Fence,
  ShieldCheck,
  Heart,
  Wallet,
  BarChart3,
  Bell,
  LogOut,
  Settings,
  Copy,
  Check,
  Users,
} from 'lucide-react'

const menuItems = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/animais', label: 'Animais', icon: Beef },
  { to: '/lotes', label: 'Lotes & pastos', icon: Fence },
  { to: '/sanidade', label: 'Sanidade', icon: ShieldCheck },
  { to: '/reproducao', label: 'Reprodução', icon: Heart },
  { to: '/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { to: '/notificacoes', label: 'Notificações', icon: Bell },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const menuRef = useRef(null)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = (user.nome || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const papelLabel = user.papel === 'admin' ? 'Admin' : 'Operador'

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const copiarCodigo = () => {
    navigator.clipboard.writeText(user.codigo_convite)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  useEffect(() => {
    if (!menuAberto) return
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAberto(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuAberto])

  return (
    <aside className="w-[215px] bg-primary-dark flex flex-col py-[22px] px-[16px] shrink-0">
      <div className="flex items-center gap-[10px] mb-[30px] px-[8px]">
        <span className="w-[30px] h-[30px] rounded-[9px] bg-primary-medium flex items-center justify-center">
          <Beef size={18} className="text-white" />
        </span>
        <div>
          <div className="text-[18px] font-extrabold text-white tracking-[-0.01em] leading-tight">Rebanho</div>
          {user.fazenda_nome && <div className="text-[11px] text-sidebar-inactive font-medium">{user.fazenda_nome}</div>}
        </div>
      </div>

      <nav className="flex flex-col gap-[3px]">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-[10px] py-[11px] px-[14px] rounded-sidebar-item text-[14.5px] no-underline transition-colors ${
                isActive
                  ? 'bg-primary text-white font-bold'
                  : 'text-sidebar-inactive font-semibold hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto relative" ref={menuRef}>
        {menuAberto && (
          <div className="absolute bottom-[56px] left-0 right-0 bg-white rounded-[14px] shadow-[0_12px_40px_rgba(0,0,0,0.25)] overflow-hidden z-20">
            <div className="px-[16px] py-[14px] border-b border-[#f0ede4]">
              <div className="text-[14px] font-extrabold text-primary-dark">{user.nome || 'Usuário'}</div>
              <div className="text-[12px] text-text-secondary font-medium">{user.fazenda_nome || 'Minha Fazenda'} · {papelLabel}</div>
            </div>

            {user.papel === 'admin' && user.codigo_convite && (
              <div className="px-[16px] py-[12px] border-b border-[#f0ede4]">
                <div className="text-[11px] font-bold text-text-secondary uppercase tracking-[.04em] mb-[6px]">Código de convite</div>
                <div className="flex items-center gap-[8px]">
                  <span className="font-mono text-[14px] font-bold text-primary-dark tracking-[.02em] flex-1">{user.codigo_convite}</span>
                  <button
                    onClick={copiarCodigo}
                    className="bg-chip-bg rounded-[8px] p-[6px] cursor-pointer border-none text-primary-dark hover:bg-border transition-colors"
                  >
                    {copiado ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}

            <div className="py-[4px]">
              <button
                onClick={() => { setMenuAberto(false); navigate('/configuracoes') }}
                className="w-full flex items-center gap-[10px] py-[11px] px-[16px] bg-transparent border-none cursor-pointer text-left hover:bg-[#f5f4ef] transition-colors"
              >
                <Settings size={16} className="text-text-secondary" />
                <span className="text-[14px] font-semibold text-primary-dark">Configurações</span>
              </button>
              <button
                onClick={() => { setMenuAberto(false); navigate('/configuracoes?tab=usuarios') }}
                className="w-full flex items-center gap-[10px] py-[11px] px-[16px] bg-transparent border-none cursor-pointer text-left hover:bg-[#f5f4ef] transition-colors"
              >
                <Users size={16} className="text-text-secondary" />
                <span className="text-[14px] font-semibold text-primary-dark">Usuários</span>
              </button>
            </div>

            <div className="border-t border-[#f0ede4] py-[4px]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-[10px] py-[11px] px-[16px] bg-transparent border-none cursor-pointer text-left hover:bg-danger-bg transition-colors"
              >
                <LogOut size={16} className="text-danger" />
                <span className="text-[14px] font-semibold text-danger">Sair</span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="w-full flex items-center gap-[10px] py-[10px] px-[8px] bg-transparent border-none cursor-pointer rounded-sidebar-item hover:bg-[rgba(255,255,255,0.08)] transition-colors"
        >
          <span className="w-[32px] h-[32px] rounded-full bg-primary-medium text-white flex items-center justify-center text-[13px] font-bold">
            {initials}
          </span>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[13.5px] font-bold text-white truncate">{user.nome || 'Usuário'}</div>
            <div className="text-[11.5px] text-[#7e8f7a]">{papelLabel}</div>
          </div>
        </button>
      </div>
    </aside>
  )
}
