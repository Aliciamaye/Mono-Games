// Enhanced Animated Button Component with Squeeze/Bounce Effects
import { motion } from 'framer-motion';
import { type CSSProperties, type ReactNode } from 'react';
import './AnimatedButton.css';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: CSSProperties;
  className?: string;
  pulse?: boolean;
  glow?: boolean;
}

export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  fullWidth = false,
  style,
  className = '',
  pulse = false,
  glow = false
}: AnimatedButtonProps) {
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'btn-xl'
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    accent: 'btn-accent',
    ghost: 'btn-ghost'
  };

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        animated-btn
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'btn-full' : ''}
        ${pulse ? 'btn-pulse' : ''}
        ${glow ? 'btn-glow' : ''}
        ${disabled ? 'btn-disabled' : ''}
        ${className}
      `}
      style={style}
      whileHover={disabled ? {} : {
        scale: 1.05,
        y: -2,
        transition: { type: 'spring', stiffness: 400, damping: 10 }
      }}
      whileTap={disabled ? {} : {
        scale: 0.95,
        y: 2,
        transition: { type: 'spring', stiffness: 400, damping: 10 }
      }}
      initial={{ scale: 1, y: 0 }}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-content">{children}</span>
      
      {/* Particle effect on hover */}
      <div className="btn-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
    </motion.button>
  );
}
