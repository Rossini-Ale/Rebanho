import { Outlet } from 'react-router-dom'
import TabBar from '../components/layout/TabBar'

export default function MobileLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <TabBar />
    </div>
  )
}
