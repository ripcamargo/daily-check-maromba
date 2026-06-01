import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose = null }) => {
  const types = {
    success: {
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/30',
      text: 'text-emerald-400',
      icon: <CheckCircle className="w-5 h-5" />
    },
    error: {
      bg: 'bg-red-400/10',
      border: 'border-red-400/30',
      text: 'text-red-400',
      icon: <XCircle className="w-5 h-5" />
    },
    warning: {
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/30',
      text: 'text-amber-400',
      icon: <AlertCircle className="w-5 h-5" />
    },
    info: {
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/30',
      text: 'text-blue-400',
      icon: <Info className="w-5 h-5" />
    }
  };

  const style = types[type];

  return (
    <div className={`${style.bg} ${style.border} ${style.text} border rounded-lg p-4 flex items-start gap-3`}>
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-1">{message}</div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-70 transition-opacity">
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
