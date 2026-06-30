import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import CadastroPage from './pages/CadastroPage'
import InicioPage from './pages/InicioPage'
import AnimaisPage from './pages/AnimaisPage'
import AnimalPerfilPage from './pages/AnimalPerfilPage'
import AnimalCadastroPage from './pages/AnimalCadastroPage'
import RegistrarPesoPage from './pages/RegistrarPesoPage'
import MoverLotePage from './pages/MoverLotePage'
import RegistrarSaidaPage from './pages/RegistrarSaidaPage'
import LotesPage from './pages/LotesPage'
import LoteDetalhePage from './pages/LoteDetalhePage'
import LoteCadastroPage from './pages/LoteCadastroPage'
import SanidadePage from './pages/SanidadePage'
import EventoSanitarioPage from './pages/EventoSanitarioPage'
import ReproducaoPage from './pages/ReproducaoPage'
import CoberturaPage from './pages/CoberturaPage'
import PartoPage from './pages/PartoPage'
import FinanceiroPage from './pages/FinanceiroPage'
import NovoCustoPage from './pages/NovoCustoPage'
import RelatoriosPage from './pages/RelatoriosPage'
import NotificacoesPage from './pages/NotificacoesPage'
import ConfiguracoesPage from './pages/ConfiguracoesPage'
import MaisPage from './pages/MaisPage'
import NotFoundPage from './pages/NotFoundPage'
import useMediaQuery from './hooks/useMediaQuery'

function AuthGuard({ children }) {
  const user = localStorage.getItem('user')
  const token = localStorage.getItem('token')
  if (!user || !token) {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    return <Navigate to="/login" replace />
  }
  return children
}

function ModalRoutes() {
  const location = useLocation()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  if (!isDesktop) return null

  return (
    <Routes location={location}>
      <Route path="animais/novo" element={<AnimalCadastroPage />} />
      <Route path="lotes/novo" element={<LoteCadastroPage />} />
      <Route path="sanidade/novo" element={<EventoSanitarioPage />} />
      <Route path="reproducao/cobertura" element={<CoberturaPage />} />
      <Route path="reproducao/parto" element={<PartoPage />} />
      <Route path="financeiro/custo" element={<NovoCustoPage />} />
      <Route path="registrar-peso" element={<RegistrarPesoPage />} />
      <Route path="mover-lote" element={<MoverLotePage />} />
      <Route path="registrar-saida" element={<RegistrarSaidaPage />} />
      <Route path="*" element={null} />
    </Routes>
  )
}

function AppLayoutWithModals() {
  const location = useLocation()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const modalPaths = ['/animais/novo', '/lotes/novo', '/sanidade/novo', '/reproducao/cobertura', '/reproducao/parto', '/financeiro/custo', '/registrar-peso', '/mover-lote', '/registrar-saida']
  const isModalRoute = isDesktop && modalPaths.some(p => location.pathname === p)

  const bgPath = isModalRoute
    ? location.pathname.split('/').slice(0, -1).join('/') || '/'
    : null

  return (
    <>
      {isModalRoute ? (
        <Routes location={{ ...location, pathname: bgPath }}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<InicioPage />} />
            <Route path="/animais" element={<AnimaisPage />} />
            <Route path="/lotes" element={<LotesPage />} />
            <Route path="/sanidade" element={<SanidadePage />} />
            <Route path="/reproducao" element={<ReproducaoPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
            <Route path="*" element={<InicioPage />} />
          </Route>
        </Routes>
      ) : (
        <Outlet />
      )}
      <ModalRoutes />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route element={<AuthGuard><AppLayoutWithModals /></AuthGuard>}>
          <Route element={<AppLayout />}>
            <Route index element={<InicioPage />} />
            <Route path="animais" element={<AnimaisPage />} />
            <Route path="animais/novo" element={<AnimaisPage />} />
            <Route path="animais/:id" element={<AnimalPerfilPage />} />
            <Route path="registrar-peso" element={<AnimaisPage />} />
            <Route path="mover-lote" element={<AnimaisPage />} />
            <Route path="registrar-saida" element={<AnimaisPage />} />
            <Route path="lotes" element={<LotesPage />} />
            <Route path="lotes/novo" element={<LotesPage />} />
            <Route path="lotes/:id" element={<LoteDetalhePage />} />
            <Route path="sanidade" element={<SanidadePage />} />
            <Route path="sanidade/novo" element={<SanidadePage />} />
            <Route path="reproducao" element={<ReproducaoPage />} />
            <Route path="reproducao/cobertura" element={<ReproducaoPage />} />
            <Route path="reproducao/parto" element={<ReproducaoPage />} />
            <Route path="financeiro" element={<FinanceiroPage />} />
            <Route path="financeiro/custo" element={<FinanceiroPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="notificacoes" element={<NotificacoesPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
            <Route path="mais" element={<MaisPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
