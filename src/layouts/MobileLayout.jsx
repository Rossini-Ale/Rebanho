import { Outlet } from 'react-router-dom'

export default function MobileLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
