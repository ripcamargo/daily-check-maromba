export const Card = ({ children, className = '', title = null, subtitle = null, actions = null }) => {
  return (
    <div className={`bg-zinc-900 rounded-xl shadow-md p-6 border border-zinc-800 ${className}`}>
      {title && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-zinc-100">{title}</h3>
            {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
