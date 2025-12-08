import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  CheckSquare, 
  DollarSign, 
  Dumbbell 
} from 'lucide-react';
import { useSeason } from '../context/SeasonContext';

export const Navbar = () => {
  const location = useLocation();
  const { currentSeason } = useSeason();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/atletas', label: 'Atletas', icon: Users },
    { path: '/temporadas', label: 'Temporadas', icon: Calendar },
    { path: '/checkin', label: 'Check-in', icon: CheckSquare },
    { path: '/pagamentos', label: 'Pagamentos', icon: DollarSign }
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl">
            {currentSeason?.logoUrl ? (
              <img 
                src={currentSeason.logoUrl} 
                alt={currentSeason.title}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <Dumbbell className="w-8 h-8" />
            )}
            <span>
              {currentSeason?.title || 'Daily Check Maromba'}
            </span>
          </Link>

          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-blue-600 font-semibold'
                      : 'hover:bg-blue-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
