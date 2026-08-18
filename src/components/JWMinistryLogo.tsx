import React from 'react';

interface JWMinistryLogoProps {
  className?: string;
  size?: number | string;
  showBg?: boolean;
  alt?: string;
}

export const JWMinistryLogo: React.FC<JWMinistryLogoProps> = ({
  className = '',
  size = 48,
  alt = 'JW Ministry App Logo',
}) => {
  const sizePx = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      style={{ width: sizePx, height: sizePx }}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-2xl select-none shrink-0 shadow-xs ${className}`}
    >
      <img
        src="/jw-logo.jpg"
        alt={alt}
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover rounded-2xl"
        onError={(e) => {
          // If jw-logo.jpg is not loaded, fallback to /logo.svg
          (e.currentTarget as HTMLImageElement).src = '/logo.svg';
        }}
      />
    </div>
  );
};
