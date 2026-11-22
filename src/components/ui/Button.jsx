import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-amethyst text-white hover:bg-[#AA80FF] shadow-[0_10px_30px_-10px_rgba(155,107,255,.7)]',
  light: 'bg-paper text-ink hover:bg-white',
  ghost: 'bg-transparent text-soft hover:text-paper hover:bg-white/5',
  outline: 'border border-line-2 text-paper hover:border-lilac/60 hover:bg-white/[.03]',
  subtle: 'bg-surface-2 text-paper hover:bg-[#241D3D] border border-line',
  danger: 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30',
};
const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-[10px]',
  md: 'h-11 px-5 text-[15px] gap-2 rounded-xl',
  lg: 'h-13 px-7 text-base gap-2.5 rounded-2xl',
  icon: 'h-9 w-9 justify-center rounded-[10px]',
};

const Button = forwardRef(function Button({ variant = 'primary', size = 'md', to, href, loading, className = '', children, ...props }, ref) {
  const cls = `inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-200 active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  const content = (<>{loading && <Loader2 className="h-4 w-4 animate-spin" />}{children}</>);
  if (to) return <Link ref={ref} to={to} className={cls} {...props}>{content}</Link>;
  if (href) return <a ref={ref} href={href} className={cls} {...props}>{content}</a>;
  return <button ref={ref} className={cls} disabled={loading || props.disabled} {...props}>{content}</button>;
});

export default Button;
