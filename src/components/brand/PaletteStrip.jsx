export default function PaletteStrip({ palette, className = 'h-2', rounded = 'rounded-full' }) {
  return (
    <div className={`flex overflow-hidden ${rounded} ${className}`}>
      {palette.map((c) => <span key={c.role} className="flex-1" style={{ background: c.hex }} title={c.hex} />)}
    </div>
  );
}
