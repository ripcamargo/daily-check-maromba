import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SeasonProvider, useSeason } from './context/SeasonContext';
import { ThemeColorProvider } from './context/ThemeColorContext';
import { AthletesProvider } from './context/AthletesContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { usePageMetadata } from './hooks/usePageMetadata';
import { useSeasonColors } from './hooks/useSeasonColors';
import Dashboard from './pages/Dashboard';
import Athletes from './pages/Athletes';
import Seasons from './pages/Seasons';
import Checkin from './pages/Checkin';
import Payments from './pages/Payments';
import Login from './pages/Login';
import GymWrapped from './pages/GymWrapped';
import './styles/global.css';

function AppContent() {
  const { currentSeason, loading } = useSeason();
  const { lighterColor } = useSeasonColors(currentSeason?.logoUrl);
  
  // Atualiza apenas o favicon baseado na temporada
  const faviconUrl = !loading && currentSeason?.logoUrl ? currentSeason.logoUrl : null;
  
  usePageMetadata('Daily Check Maromba', faviconUrl);

  const backgroundColor = currentSeason && lighterColor ? lighterColor : 'rgb(249, 250, 251)';

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor }}
    >
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/atletas" element={<Athletes />} />
        <Route path="/temporadas" element={<Seasons />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/pagamentos" element={<Payments />} />
        <Route path="/gym-wrapped" element={<GymWrapped />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SeasonProvider>
          <ThemeColorProvider>
            <AthletesProvider>
              <AppContent />
            </AthletesProvider>
          </ThemeColorProvider>
        </SeasonProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
