import { useEffect, useState } from 'react';
import { ensureFonts } from './logoSvg';

// Re-renders once the brand's fonts are loaded so text measurement is exact.
export function useFontsReady(concept, name) {
  const [tick, setTick] = useState(0);
  const key = concept ? `${concept.fonts.heading}|${concept.fonts.headingAr}|${name}` : '';
  useEffect(() => {
    if (!concept) return;
    let alive = true;
    ensureFonts(concept, name).then(() => alive && setTick((t) => t + 1));
    return () => { alive = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return tick;
}
