import { useState, useEffect } from 'react';

export const useSeasonColors = (logoUrl) => {
  const [dominantColor, setDominantColor] = useState(null);

  useEffect(() => {
    if (!logoUrl) {
      setDominantColor(null);
      return;
    }

    const extractDominantColor = async () => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 10;
          canvas.height = 10;
          const ctx = canvas.getContext('2d');
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          let r = 0, g = 0, b = 0;
          const pixelCount = data.length / 4;
          
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }
          
          r = Math.round(r / pixelCount);
          g = Math.round(g / pixelCount);
          b = Math.round(b / pixelCount);
          
          const hex = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
          setDominantColor(hex);
        };
        
        img.onerror = () => {
          console.error('Erro ao carregar logo para extrair cores');
          setDominantColor(null);
        };
        
        img.src = logoUrl;
      } catch (err) {
        console.error('Erro ao extrair cor dominante:', err);
        setDominantColor(null);
      }
    };

    extractDominantColor();
  }, [logoUrl]);

  // Função para gerar uma versão mais escura da cor (para o navbar)
  const getDarkerColor = () => {
    if (!dominantColor) return null;
    
    const hex = dominantColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Escurece a cor em 30%
    const darkerR = Math.round(r * 0.7);
    const darkerG = Math.round(g * 0.7);
    const darkerB = Math.round(b * 0.7);
    
    return `#${((darkerR << 16) | (darkerG << 8) | darkerB).toString(16).padStart(6, '0')}`;
  };

  // Função para gerar uma versão bem clara da cor (para o background)
  const getLighterColor = () => {
    if (!dominantColor) return null;
    
    const hex = dominantColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Clareia a cor em 85% (muito clara)
    const lighterR = Math.round(r + (255 - r) * 0.85);
    const lighterG = Math.round(g + (255 - g) * 0.85);
    const lighterB = Math.round(b + (255 - b) * 0.85);
    
    return `rgb(${lighterR}, ${lighterG}, ${lighterB})`;
  };

  return {
    dominantColor,
    darkerColor: getDarkerColor(),
    lighterColor: getLighterColor()
  };
};
