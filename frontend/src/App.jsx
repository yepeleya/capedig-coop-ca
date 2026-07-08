import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Accueil             from './pages/public/Accueil'
import APropos              from './pages/public/APropos'
import Activites            from './pages/public/Activites'
import Actualites           from './pages/public/Actualites'
import ActualiteDetail       from './pages/public/ActualiteDetail'
import AnnonceDetail         from './pages/public/AnnonceDetail'
import Contact               from './pages/public/Contact'
import LoginProducteur       from './pages/auth/LoginProducteur'
import LoginAdmin            from './pages/auth/LoginAdmin'
import DashboardProducteur   from './pages/producteur/Dashboard'
import DashboardAdmin        from './pages/admin/Dashboard'
import ProducteursAdmin      from './pages/admin/Producteurs'
import AnnoncesAdmin         from './pages/admin/Annonces'
import ActualitesAdmin       from './pages/admin/Actualites'
import DocumentsAdmin        from './pages/admin/Documents'
import StatistiquesAdmin     from './pages/admin/Statistiques'
import MessagesAdmin         from './pages/admin/Messages'
import ParametresAdmin       from './pages/admin/Parametres'
import RapportsAdmin         from './pages/admin/Rapports'
import ProjetsAdmin          from './pages/admin/Projets'
import { useLenis } from './hooks/useLenis'

function App() {
  useLenis()

  return (
    <BrowserRouter>
      <Routes>
        {/* Pages publiques */}
        <Route path="/"            element={<Accueil    />} />
        <Route path="/a-propos"    element={<APropos    />} />
        <Route path="/activites"   element={<Activites  />} />
        <Route path="/actualites"  element={<Actualites />} />
        <Route path="/actualites/:id" element={<ActualiteDetail />} />
        <Route path="/annonces/:id"   element={<AnnonceDetail   />} />
        <Route path="/contact"     element={<Contact    />} />

        {/* Auth */}
        <Route path="/login-producteur" element={<LoginProducteur />} />
        <Route path="/login-admin"      element={<LoginAdmin      />} />
        {/* Alias courants vers la connexion admin */}
        <Route path="/admin/login"  element={<Navigate to="/login-admin" replace />} />
        <Route path="/admin-login"  element={<Navigate to="/login-admin" replace />} />
        <Route path="/admin_login"  element={<Navigate to="/login-admin" replace />} />

        {/* Espaces privés */}
        <Route path="/producteur/dashboard" element={<DashboardProducteur />} />

        {/* Dashboard admin */}
        {/* /admin seul redirige vers le dashboard (qui renvoie lui-même vers
            /login-admin si l'utilisateur n'est pas connecté) */}
        <Route path="/admin"               element={<DashboardAdmin     />} />
        <Route path="/admin/dashboard"     element={<DashboardAdmin     />} />
        <Route path="/admin/producteurs"   element={<ProducteursAdmin   />} />
        <Route path="/admin/annonces"      element={<AnnoncesAdmin      />} />
        <Route path="/admin/actualites"    element={<ActualitesAdmin    />} />
        <Route path="/admin/documents"     element={<DocumentsAdmin     />} />
        <Route path="/admin/statistiques"  element={<StatistiquesAdmin  />} />
        <Route path="/admin/messages"      element={<MessagesAdmin      />} />
        <Route path="/admin/parametres"    element={<ParametresAdmin    />} />
        <Route path="/admin/rapports"      element={<RapportsAdmin      />} />
        <Route path="/admin/projets"       element={<ProjetsAdmin       />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
