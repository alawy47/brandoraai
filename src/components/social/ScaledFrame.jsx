import { forwardRef, useEffect, useRef, useState } from 'react';

// Renders a fixed-size design (the export target) scaled to fit its container.
const ScaledFrame = forwardRef(function ScaledFrame({ width, height, children, className = '' }, ref) {
  const outer = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={outer} className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
        <div ref={ref} style={{ width, height }}>{children}</div>
      </div>
    </div>
  );
});

export default ScaledFrame;
