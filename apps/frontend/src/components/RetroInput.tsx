import React from 'react';

interface RetroInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const RetroInput: React.FC<RetroInputProps> = ({
  className,
  label,
  id,
  ...rest
}) => (
  <div className="mb-2">
    {label && (
      <label htmlFor={id} className="block mb-1 font-w98 text-sm">
        {label}
      </label>
    )}
    <input
      id={id}
      {...rest}
      className={`bevel-down px-2 py-1 bg-white focus:outline-none font-w98 text-sm ${className || ''}`}
      style={{ cursor: 'text', backgroundColor: 'white' }}
    />
  </div>
);

export const RetroTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({
  className,
  label,
  id,
  ...rest
}) => (
  <div className="mb-2">
    {label && (
      <label htmlFor={id} className="block mb-1 font-w98 text-sm">
        {label}
      </label>
    )}
    <textarea
      id={id}
      {...rest}
      className={`bevel-down px-2 py-1 bg-white focus:outline-none font-w98 text-sm w-full ${className || ''}`}
      style={{ cursor: 'text', backgroundColor: 'white' }}
    />
  </div>
);

export const RetroSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({
  className,
  label,
  id,
  children,
  ...rest
}) => (
  <div className="mb-2">
    {label && (
      <label htmlFor={id} className="block mb-1 font-w98 text-sm">
        {label}
      </label>
    )}
    <select
      id={id}
      {...rest}
      className={`bevel-down px-1 py-0 bg-white focus:outline-none font-w98 text-sm ${className || ''}`}
      style={{ cursor: 'default', backgroundColor: 'white' }}
    >
      {children}
    </select>
  </div>
);

export const RetroCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({
  className,
  label,
  id,
  ...rest
}) => (
  <div className="flex items-center gap-2 mb-1">
    <input
      id={id}
      type="checkbox"
      {...rest}
      className={`appearance-none w-4 h-4 bevel-down bg-white checked:bg-[#C0C0C0] ${className || ''}`}
      style={{ backgroundColor: 'white' }}
    />
    <label htmlFor={id} className="font-w98 text-sm cursor-pointer">
      {label}
    </label>
  </div>
);
