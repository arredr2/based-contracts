import React from 'react';
import Image from 'next/image';

interface LogoProps {
  /** Variant of the logo to display - 'square' or 'banner' */
  variant?: 'square' | 'banner';
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Whether to maintain aspect ratio */
  preserveAspectRatio?: boolean;
  /** Alt text for the logo */
  alt?: string;
}

/**
 * Logo component for BasedContracts
 * Uses the SVG file from public directory
 */
const Logo: React.FC<LogoProps> = ({ 
  variant = 'square', 
  className = '',
  onClick,
  preserveAspectRatio = true,
  alt = 'BasedContracts Logo'
}) => {
  return (
    <div 
      className={`relative w-full h-full inline-block ${className}`}
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        aspectRatio: variant === 'square' ? '1' : 'auto'
      }}
    >
      <Image
        src={variant === 'square' ? '/BASEDCONTRACTS_LOGO-09.svg' : '/BASEDCONTRACTS_BANNER.svg'}
        alt={alt}
        fill={true}
        className={`${preserveAspectRatio ? 'object-contain' : 'object-fill'}`}
        priority={true}
        sizes="(max-width: 768px) 40px, 40px"
      />
    </div>
  );
};

export default Logo;
