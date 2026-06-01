import { useRef, useState, useCallback, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Calcula onde a imagem está realmente renderizada dentro do elemento <img object-contain>
const getRenderedBounds = (img) => {
  const elW = img.clientWidth;
  const elH = img.clientHeight;
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;
  const elRatio = elW / elH;
  const natRatio = natW / natH;

  let rW, rH, ox, oy;
  if (natRatio > elRatio) {
    // imagem mais larga que o container → barras em cima/baixo
    rW = elW;
    rH = elW / natRatio;
    ox = 0;
    oy = (elH - rH) / 2;
  } else {
    // imagem mais alta que o container → barras nas laterais
    rH = elH;
    rW = elH * natRatio;
    ox = (elW - rW) / 2;
    oy = 0;
  }
  return { rW, rH, ox, oy };
};

export const ImageCropper = ({ imageSrc, onCrop, onCancel }) => {
  const imgRef = useRef(null);
  const [sel, setSel] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [origin, setOrigin] = useState(null);

  const getRelPos = (e) => {
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const { rW, rH, ox, oy } = getRenderedBounds(img);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clamp(clientX - rect.left - ox, 0, rW),
      y: clamp(clientY - rect.top - oy, 0, rH),
    };
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    const pos = getRelPos(e);
    setOrigin(pos);
    setSel({ x: pos.x, y: pos.y, w: 0, h: 0 });
    setDragging(true);
  };

  const onMouseMove = useCallback((e) => {
    if (!dragging || !origin) return;
    const pos = getRelPos(e);
    // Seleção quadrada — evita distorção ao exportar para 400×400
    const size = Math.min(Math.abs(pos.x - origin.x), Math.abs(pos.y - origin.y));
    setSel({
      x: pos.x < origin.x ? origin.x - size : origin.x,
      y: pos.y < origin.y ? origin.y - size : origin.y,
      w: size,
      h: size,
    });
  }, [dragging, origin]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onMouseMove, { passive: false });
    window.addEventListener('touchend', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const handleConfirm = () => {
    if (!sel || sel.w < 10 || sel.h < 10) return;

    const img = imgRef.current;
    const { rW, rH } = getRenderedBounds(img);

    // Escala da imagem renderizada para a imagem natural
    const scaleX = img.naturalWidth / rW;
    const scaleY = img.naturalHeight / rH;

    const sx = Math.round(sel.x * scaleX);
    const sy = Math.round(sel.y * scaleY);
    const sw = Math.round(sel.w * scaleX);
    const sh = Math.round(sel.h * scaleY);

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;

    const imgEl = new Image();
    imgEl.onload = () => {
      canvas.getContext('2d').drawImage(imgEl, sx, sy, sw, sh, 0, 0, 400, 400);
      onCrop(canvas.toDataURL('image/jpeg', 0.85));
    };
    imgEl.src = imageSrc;
  };

  // Offset da imagem dentro do elemento para posicionar o overlay corretamente
  const bounds = imgRef.current ? getRenderedBounds(imgRef.current) : null;
  const hasSelection = sel && sel.w > 10 && sel.h > 10;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">
        Arraste sobre a foto para selecionar a área que virará a foto de perfil.
      </p>

      <div className="relative select-none overflow-hidden rounded-lg bg-zinc-950">
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Recorte"
          className="w-full object-contain max-h-[60vh] block"
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
          style={{ cursor: 'crosshair' }}
          draggable={false}
        />

        {hasSelection && bounds && (
          <>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.55)' }} />
            <div
              className="absolute pointer-events-none"
              style={{
                top: bounds.oy + sel.y,
                left: bounds.ox + sel.x,
                width: sel.w,
                height: sel.h,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                border: '2px solid #f59e0b',
              }}
            >
              {/* Grade dos terços */}
              <div style={{ position: 'absolute', inset: 0 }}>
                {[33.3, 66.6].map(p => (
                  <div key={`v${p}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${p}%`, width: 1, background: 'rgba(245,158,11,0.3)' }} />
                ))}
                {[33.3, 66.6].map(p => (
                  <div key={`h${p}`} style={{ position: 'absolute', left: 0, right: 0, top: `${p}%`, height: 1, background: 'rgba(245,158,11,0.3)' }} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 text-zinc-100 hover:bg-zinc-600 transition-all text-sm"
        >
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={!hasSelection}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" /> Usar como Perfil
        </button>
      </div>
    </div>
  );
};
