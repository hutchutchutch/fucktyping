export const RetroInput = ({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...rest}
    className={`px-2 py-0.5 bg-white bevel-down focus:outline-none ${className || ''}`}
  />
) 