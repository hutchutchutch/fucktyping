export const RetroButton = ({
  children,
  variant = 'default',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' }) => (
  <button
    {...rest}
    className={`px-3 py-0.5 mt-2 bevel-up active:bevel-down ${
      variant === 'primary' ? 'bg-w95-2 text-white' : 'bg-w95-0'
    }`}
  >
    {children}
  </button>
) 