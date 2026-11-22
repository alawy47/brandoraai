import { useEffect, useState } from 'react';
import { ensureFonts } from './logoSvg';

// Re-renders once the logo's fonts are loaded so text measurement is exact.
export function useFontsReady(concept, name, cfg) {
  const [tick, setTick] = useState(0);
  const merged = concept ? { ...concept.logo, ...cfg } : null;
  const key = concept ? `${concept.fonts.heading}|${concept.fonts.headingAr}|${merged.font}|${merged.fontAr}|${merged.weight}|${name}` : '';
  useEffect(() => {
    if (!concept) return;
    let alive = true;
    ensureFonts(concept, name, merged).then(() => alive && setTick((t) => t + 1));
    return () => { alive = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return tick;
}
