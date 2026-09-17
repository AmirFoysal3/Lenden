import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
  useImage?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = 'h-9 w-9',
  size = 36,
  useImage = true,
}) => {
  const [imgError, setImgError] = React.useState(false);

  if (useImage && !imgError) {
    return (
      <img
        src="/app-logo.png"
        alt="Personal Money Ledger Logo"
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={`rounded-xl object-contain shrink-0 shadow-2xs ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Pixel-perfect vector representation of the uploaded wallet logo with Taka ৳ symbol and green exchange badge
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="app-logo-vector"
    >
      {/* Background Squircle Card */}
      <rect
        x="2"
        y="2"
        width="116"
        height="116"
        rx="28"
        fill="#F4F5F6"
      />

      {/* Top Bill/Note Layers protruding slightly from the wallet */}
      <path
        d="M34 26C34 24.8954 34.8954 24 36 24H76C77.1046 24 78 24.8954 78 26V30H34V26Z"
        fill="#CBD5E1"
      />
      <path
        d="M37 29C37 27.8954 37.8954 27 39 27H81C82.1046 27 83 27.8954 83 29V34H37V29Z"
        fill="#FFFFFF"
      />

      {/* Main Charcoal Wallet Body */}
      <rect
        x="32"
        y="32"
        width="54"
        height="54"
        rx="11"
        fill="#262A32"
      />

      {/* Wallet Right Closure Strap */}
      <path
        d="M70 47H86C89.3137 47 92 49.6863 92 53V57C92 60.3137 89.3137 63 86 63H70V47Z"
        fill="#262A32"
        stroke="#1E2229"
        strokeWidth="1.5"
      />
      {/* Snap Button on strap */}
      <circle cx="82" cy="55" r="3.2" fill="#E2E8F0" />
      <circle cx="82" cy="55" r="1.5" fill="#94A3B8" />

      {/* Bengali Taka ৳ Symbol on the wallet */}
      <text
        x="51"
        y="67"
        textAnchor="middle"
        fontFamily="sans-serif, system-ui"
        fontWeight="800"
        fontSize="30"
        fill="#FFFFFF"
      >
        ৳
      </text>

      {/* Green Exchange Circle Badge at bottom right */}
      <circle
        cx="82"
        cy="82"
        r="18"
        fill="#238551"
        stroke="#FFFFFF"
        strokeWidth="3.5"
      />

      {/* Left Up Arrow (↑) */}
      <path
        d="M76 86V76.5M76 76.5L72.5 80M76 76.5L79.5 80"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Down Arrow (↓) */}
      <path
        d="M87 77.5V87M87 87L83.5 83.5M87 87L90.5 83.5"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
