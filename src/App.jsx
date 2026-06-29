import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

function AuthGuard({ children }) {
  const user = localStorage.getItem('user')
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route index element={<InicioPage />} />
          <Route path="animais" element={<AnimaisPage />} />
          <Route path="animais/novo" element={<AnimalCadastroPage />} />
          <Route path="animais/:id" element={<AnimalPerfilPage />} />
          <Route path="registrar-peso" element={<RegistrarPesoPage />} />
          <Route path="mover-lote" element={<MoverLotePage />} />
          <Route path="registrar-saida" element={<RegistrarSaidaPage />} />
          <Route path="lotes" element={<LotesPage />} />
          <Route path="lotes/novo" element={<LoteCadastroPage />} />
          <Route path="lotes/:id" element={<LoteDetalhePage />} />
          <Route path="sanidade" element={<SanidadePage />} />
          <Route path="sanidade/novo" element={<EventoSanitarioPage />} />
          <Route path="reproducao" element={<ReproducaoPage />} />
          <Route path="reproducao/cobertura" element={<CoberturaPage />} />
          <Route path="reproducao/parto" element={<PartoPage />} />
          <Route path="financeiro" element={<FinanceiroPage />} />
          <Route path="financeiro/custo" element={<NovoCustoPage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
          <Route path="notificacoes" element={<NotificacoesPage />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
          <Route path="mais" element={<MaisPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
