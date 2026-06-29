import { NavLink } from 'react-router-dom'
import { Home, Bug as Cow, Fence, MoreHorizontal } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/animais', label: 'Animais', icon: Cow },
  { to: '/lotes', label: 'Lotes', icon: Fence },
  { to: '/mais', label: 'Mais', icon: MoreHorizontal },
]

export default function TabBar() {
  return (
    <nav className="flex bg-white border-t border-border py-[10px] px-[14px] pb-[22px]">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className="flex-1 flex flex-col items-center gap-[5px] no-underline"
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <span className="w-[8px] h-[8px] rounded-full bg-primary" />
              ) : (
                <span className="w-[8px] h-[8px] rounded-full border-[1.5px] border-[#b8bdb0]" />
              )}
              <span className={`text-[11.5px] ${isActive ? 'font-bold text-primary' : 'font-semibold text-text-secondary'}`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
