export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
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
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all text-zinc-100 placeholder-zinc-500 ${
          error ? 'border-red-500' : 'border-zinc-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};
