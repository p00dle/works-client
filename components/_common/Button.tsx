import * as React from 'react';

interface ButtonParams {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  text?: string;
}

export const Button: React.FC<ButtonParams> = function Button({onClick = () => void 0, className = '', children, text, disabled = false}) {
  const content = children || text || '';
  return (
    <button className={"btn " + className} onClick={onClick} disabled={disabled}>{content}</button>
  );
}