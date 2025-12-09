import { getInitials, getRandomColor } from '../utils/formatters';

export const Avatar = ({ 
  name, 
  photoUrl = null, 
  size = 'md', 
  className = '' 
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-2xl'
  };

  const sizeClass = sizes[size];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  const initials = getInitials(name);
  const bgColor = getRandomColor(name);

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
};
