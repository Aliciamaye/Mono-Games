import React, { useState, useRef, MouseEvent } from 'react';
import './Button.css';

interface RippleEffect {
  x: number;
  y: number;
  id: number;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  ripple?: boolean;
  fullWidth?: boolean;
}

/**
 * Enhanced button with micro-interactions
 * - Ripple effect on click
 * - Loading state
 * - Hover animations
 * - Icon support
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  ripple = true,
  fullWidth = false,
  disabled,
  className = '',
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { x, y, id: Date.now() };
      
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }
    
    if (onClick && !disabled && !loading) {
      onClick(e);
    }
  };

  const buttonClasses = [
    'enhanced-button',
    `enhanced-button--${variant}`,
    `enhanced-button--${size}`,
    fullWidth ? 'enhanced-button--full-width' : '',
    loading ? 'enhanced-button--loading' : '',
    disabled ? 'enhanced-button--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={buttonRef}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      <span className="enhanced-button__content">
        {loading && (
          <span className="enhanced-button__loader">
            <span className="spinner" />
          </span>
        )}
        {icon && !loading && (
          <span className="enhanced-button__icon">{icon}</span>
        )}
        <span className="enhanced-button__text">{children}</span>
      </span>
      
      {ripple && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="button-ripple"
          style={{
            left: ripple.x,
            top: ripple.y
          }}
        />
      ))}
    </button>
  );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  tooltip?: string;
}

/**
 * Icon-only button with tooltip
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'medium',
  tooltip,
  className = '',
  ...props
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="icon-button-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className={`icon-button icon-button--${variant} icon-button--${size} ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        {...props}
      >
        {icon}
      </button>
      {tooltip && showTooltip && (
        <div className="icon-button-tooltip">
          {tooltip}
        </div>
      )}
    </div>
  );
};

interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
}

/**
 * Group buttons together
 */
export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  fullWidth = false
}) => {
  return (
    <div 
      className={`button-group button-group--${orientation} ${fullWidth ? 'button-group--full-width' : ''}`}
    >
      {children}
    </div>
  );
};

export default Button;
