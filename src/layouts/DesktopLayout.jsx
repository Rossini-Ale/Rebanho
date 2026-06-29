import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'

export default function DesktopLayout() {
  return (
    <div className="h-dvh flex bg-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
