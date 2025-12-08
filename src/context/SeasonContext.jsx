import { createContext, useContext, useState, useEffect } from 'react';
import { getActiveSeason, getSeasonById } from '../services/seasons';

const SeasonContext = createContext();

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error('useSeason deve ser usado dentro de SeasonProvider');
  }
  return context;
};

export const SeasonProvider = ({ children }) => {
  const [currentSeason, setCurrentSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadActiveSeason = async () => {
    try {
      setLoading(true);
      const season = await getActiveSeason();
      setCurrentSeason(season);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar temporada ativa:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSeason = async (seasonId = null) => {
    try {
      setLoading(true);
      const season = seasonId 
        ? await getSeasonById(seasonId)
        : await getActiveSeason();
      setCurrentSeason(season);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao atualizar temporada:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveSeason();
  }, []);

  const value = {
    currentSeason,
    loading,
    error,
    refreshSeason,
    loadActiveSeason
  };

  return (
    <SeasonContext.Provider value={value}>
      {children}
    </SeasonContext.Provider>
  );
};
