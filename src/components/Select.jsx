export const Select = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = null,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all text-zinc-100 ${
          error ? 'border-red-500' : 'border-zinc-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="">Selecione...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};
