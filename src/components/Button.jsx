import { useThemeColor } from '../context/ThemeColorContext';

export const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '', type = 'button' }) => {
  const { primary, primaryDark } = useThemeColor();
  
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: `text-white hover:opacity-90 active:opacity-75`,
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    outline: `text-white border-2 hover:opacity-90 active:opacity-75`
  };

  const getStyleForVariant = () => {
    if (variant === 'primary') {
      return {
        backgroundColor: primary,
        borderColor: primary
      };
    } else if (variant === 'outline') {
      return {
        borderColor: primary,
        color: primary
      };
    }
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
