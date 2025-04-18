import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary';
  icon?: string;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  children,
  variant = 'default',
  icon,
  className = '',
  onClick,
  ...rest
}) => {
  // Ensure onClick is properly handled
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      e.stopPropagation();
      onClick(e);
    }
  };

  return (
    <button
      {...rest}
      onClick={handleClick}
      className={`bevel-up active:bevel-down px-3 py-1 mt-2 font-w98 text-sm flex items-center gap-1 bg-[#C0C0C0] ${
        variant === 'primary' ? 'bg-w95-2 text-white' : ''
      } ${className}`}
      style={{ cursor: 'pointer' }}
    >
      {icon && <img src={icon} alt="" className="w-4 h-4" />}
      {children}
    </button>
  );
};
