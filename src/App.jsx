import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SeasonProvider, useSeason } from './context/SeasonContext';
import { AthletesProvider } from './context/AthletesContext';
import { Navbar } from './components/Navbar';
import { usePageMetadata } from './hooks/usePageMetadata';
import Dashboard from './pages/Dashboard';
import Athletes from './pages/Athletes';
import Seasons from './pages/Seasons';
import Checkin from './pages/Checkin';
import Payments from './pages/Payments';
import './styles/global.css';

function AppContent() {
  const { currentSeason, loading } = useSeason();
  
  // Atualiza apenas o favicon baseado na temporada
  const faviconUrl = !loading && currentSeason?.logoUrl ? currentSeason.logoUrl : null;
  
  usePageMetadata('Daily Check Maromba', faviconUrl);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/atletas" element={<Athletes />} />
        <Route path="/temporadas" element={<Seasons />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/pagamentos" element={<Payments />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AthletesProvider>
        <SeasonProvider>
          <AppContent />
        </SeasonProvider>
      </AthletesProvider>
    </Router>
  );
}

export default App;
