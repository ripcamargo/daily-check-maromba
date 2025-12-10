import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, X, CheckSquare, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  console.log('FAB - isAdmin:', isAdmin, 'location:', location.pathname);

  // Não mostra o FAB na página de login
  if (location.pathname === '/login') {
    return null;
  }

  // Sempre mostra o FAB por enquanto para debug
  // if (!isAdmin) {
  //   return null;
  // }

  const actions = [
    {
      icon: CheckSquare,
      label: 'Check-in',
      path: '/checkin',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: DollarSign,
      label: 'Pagamentos',
      path: '/pagamentos',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const handleActionClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm transition-opacity duration-300 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed z-50" style={{ position: 'fixed', zIndex: 9999, right: '8px', bottom: '8px' }}>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse items-end gap-3 mb-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path}
              onClick={() => handleActionClick(action.path)}
              className={`
                ${action.color} text-white rounded-full shadow-lg
                flex items-center gap-3 px-5 py-3
                transform transition-all duration-300 ease-out
                hover:scale-105 hover:shadow-2xl active:scale-95
                ${isOpen 
                  ? 'translate-y-0 opacity-100 pointer-events-auto scale-100' 
                  : 'translate-y-8 opacity-0 pointer-events-none scale-90'
                }
              `}
              style={{
                transitionDelay: isOpen ? `${index * 70}ms` : '0ms'
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold text-sm whitespace-nowrap">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 rounded-full shadow-2xl
          flex items-center justify-center
          transform transition-all duration-300 ease-out
          hover:scale-110 active:scale-95
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45 shadow-red-500/50' 
            : 'bg-blue-600 hover:bg-blue-700 rotate-0 shadow-blue-600/50'
          }
          ${!isOpen ? 'animate-pulse' : ''}
        `}
        style={{
          animation: !isOpen ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
        }}
      >
        <Plus className="w-8 h-8 text-white" />
      </button>
      </div>
    </>
  );
};
