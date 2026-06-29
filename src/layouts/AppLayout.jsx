import useMediaQuery from '../hooks/useMediaQuery'
import MobileLayout from './MobileLayout'
import DesktopLayout from './DesktopLayout'

export default function AppLayout() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopLayout /> : <MobileLayout />
}
