import { memo, useMemo } from 'react';
import { buildLogoSvg } from '../../lib/logoSvg';
import { useFontsReady } from '../../lib/useFontsReady';

function Logo({ name, concept, variant = 'primary', layout, logo, className = '', style }) {
  const tick = useFontsReady(concept, name);
  const svg = useMemo(
    () => buildLogoSvg({ name, concept, variant, layout, logo }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, concept, variant, layout, logo?.mark, logo?.layout, logo?.colorway, tick],
  );
  return <div className={`logo-svg [&>svg]:h-full [&>svg]:w-full [&>svg]:max-w-full ${className}`} style={style} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default memo(Logo);
