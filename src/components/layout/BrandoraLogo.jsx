import { Link } from 'react-router-dom';

export function BrandoraMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#1B1630" />
      <path d="M20 14h14a10 10 0 0 1 3.5 19.4A10.5 10.5 0 0 1 34.5 54H20z" fill="#9B6BFF" />
      <path d="M27 21h6a4 4 0 0 1 0 8h-6zM27 35h7.5a5 5 0 0 1 0 10H27z" fill="#1B1630" />
      <circle cx="46" cy="47" r="5" fill="#EBD3A0" />
    </svg>
  );
}

export default function BrandoraLogo({ to = '/', className = '' }) {
  return (
    <Link to={to} className={`flex items-center gap-2.5 ${className}`} aria-label="BRANDORA home">
      <BrandoraMark />
      <span dir="ltr" className="font-display text-[17px] font-bold tracking-[0.14em] text-paper">BRANDORA</span>
    </Link>
  );
}
