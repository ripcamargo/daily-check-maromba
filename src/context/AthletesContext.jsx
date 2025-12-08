import { createContext, useContext, useState, useEffect } from 'react';
import { getAllAthletes } from '../services/athletes';

const AthletesContext = createContext();

export const useAthletes = () => {
  const context = useContext(AthletesContext);
  if (!context) {
    throw new Error('useAthletes deve ser usado dentro de AthletesProvider');
  }
  return context;
};

export const AthletesProvider = ({ children }) => {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAthletes = async () => {
    try {
      setLoading(true);
      const athletesList = await getAllAthletes();
      setAthletes(athletesList);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar atletas:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAthletes = async () => {
    await loadAthletes();
  };

  const getAthleteById = (athleteId) => {
    return athletes.find(athlete => athlete.id === athleteId);
  };

  useEffect(() => {
    loadAthletes();
  }, []);

  const value = {
    athletes,
    loading,
    error,
    refreshAthletes,
    getAthleteById
  };

  return (
    <AthletesContext.Provider value={value}>
      {children}
    </AthletesContext.Provider>
  );
};
