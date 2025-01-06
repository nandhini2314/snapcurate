import React from 'react';
import Image from 'next/image';
const logoImage = '/SnapCurate.png';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`logo ${className}`} style={{ borderRadius: '30%', overflow: 'hidden' }}>
      {/* Use the Next.js Image component */}
      <Image src={logoImage} alt="Logo" width={400} height={400} />
    </div>
  );
};
