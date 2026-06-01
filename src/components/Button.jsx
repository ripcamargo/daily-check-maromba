import { useThemeColor } from '../context/ThemeColorContext';

export const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '', type = 'button' }) => {
  const { primary, primaryDark } = useThemeColor();

  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary: `text-white hover:opacity-90 active:opacity-75`,
    secondary: 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600 active:bg-zinc-500',
    danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700',
    outline: `border-2 hover:opacity-90 active:opacity-75`,
  };

  const getStyleForVariant = () => {
    if (variant === 'primary') return { backgroundColor: primary };
    if (variant === 'outline') return { borderColor: primary, color: primary };
    return {};
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={getStyleForVariant()}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
