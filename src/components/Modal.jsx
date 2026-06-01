import { X } from 'lucide-react';
import { useEffect } from 'react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className={`relative bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl ${sizes[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <h2 className="text-2xl font-bold text-zinc-100">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
