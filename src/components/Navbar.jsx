import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar,
  CheckSquare,
  DollarSign,
  Dumbbell,
  LogIn,
  LogOut
} from 'lucide-react';
import { useSeason } from '../context/SeasonContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentSeason } = useSeason();
  const { isAdmin, signOut } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/atletas', label: 'Atletas', icon: Users },
    { path: '/temporadas', label: 'Temporadas', icon: Calendar },
    { path: '/checkin', label: 'Check-in', icon: CheckSquare },
    { path: '/pagamentos', label: 'Pagamentos', icon: DollarSign }
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 font-bold text-sm sm:text-xl min-w-0">
            {currentSeason?.logoUrl ? (
              <img 
                src={currentSeason.logoUrl} 
                alt={currentSeason.title}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            )}
            <span className="truncate max-w-[120px] sm:max-w-none">
              {currentSeason?.title || 'Daily Check Maromba'}
            </span>
          </Link>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-blue-600 font-semibold'
                      : 'hover:bg-blue-700'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden md:inline text-sm">{item.label}</span>
                </Link>
              );
            })}
            
            <div className="ml-auto">
              {isAdmin ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2 rounded-lg transition-all hover:bg-blue-700"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center p-2 rounded-lg transition-all hover:bg-blue-700"
                  title="Login Admin"
                >
                  <LogIn className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
