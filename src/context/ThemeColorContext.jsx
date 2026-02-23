import { createContext, useContext } from 'react';
import { useSeasonColors } from '../hooks/useSeasonColors';
import { useSeason } from './SeasonContext';

const ThemeColorContext = createContext();

export const useThemeColor = () => {
  const context = useContext(ThemeColorContext);
  if (!context) {
    throw new Error('useThemeColor deve ser usado dentro de ThemeColorProvider');
  }
  return context;
};

export const ThemeColorProvider = ({ children }) => {
  const { currentSeason } = useSeason();
  const { darkerColor, dominantColor, lighterColor } = useSeasonColors(currentSeason?.logoUrl);

  const value = {
    primary: darkerColor || '#2563eb', // blue-600 como fallback
    primaryDark: darkerColor ? adjustBrightness(darkerColor, -0.15) : '#1e40af', // blue-800 como fallback
    primaryLight: dominantColor || '#3b82f6', // blue-500 como fallback
    background: lighterColor || 'rgb(249, 250, 251)', // gray-50 como fallback
    dominantColor
  };

  return (
    <ThemeColorContext.Provider value={value}>
      {children}
    </ThemeColorContext.Provider>
  );
};

// Função auxiliar para ajustar brilho de uma cor hex
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent * 100);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}
