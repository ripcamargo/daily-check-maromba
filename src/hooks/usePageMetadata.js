import { useEffect } from 'react';

/**
 * Hook para atualizar o título da página e o favicon dinamicamente
 * @param {string} title - Título a ser exibido na aba
 * @param {string} faviconUrl - URL do favicon (opcional)
 */
export const usePageMetadata = (title, faviconUrl = null) => {
  useEffect(() => {
    // Atualiza o título
    if (title) {
      document.title = title;
    }

    // Atualiza o favicon se fornecido
    if (faviconUrl) {
      // Remove favicons existentes
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(icon => icon.remove());

      // Cria novo favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = faviconUrl;
      document.head.appendChild(link);
    }
  }, [title, faviconUrl]);
};
