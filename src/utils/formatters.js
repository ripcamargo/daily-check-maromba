import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para o padrão brasileiro
 */
export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
  if (!date) return '';
  try {
    // Se a data é uma string no formato yyyy-MM-dd, parse local
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      return format(localDate, pattern, { locale: ptBR });
    }
    // Caso contrário, usa o comportamento padrão
    return format(new Date(date), pattern, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Formata um valor monetário para BRL
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

/**
 * Formata uma porcentagem
 */
export const formatPercentage = (value) => {
  return `${(value || 0).toFixed(1)}%`;
};

/**
 * Trunca um texto longo
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Formata o nome do nível de experiência
 */
export const formatExperienceLevel = (level) => {
  const levels = {
    'PRO': 'Profissional',
    'Intermediário': 'Intermediário',
    'Iniciante': 'Iniciante'
  };
  return levels[level] || level;
};

/**
 * Gera iniciais de um nome
 */
export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Valida se uma string é uma data válida
 */
export const isValidDate = (dateString) => {
  try {
    const date = parseISO(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Gera uma cor aleatória para avatar
 */
export const getRandomColor = (seed) => {
  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
    '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'
  ];
  const index = Math.abs(hashCode(seed)) % colors.length;
  return colors[index];
};

const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};
