import { memo, useMemo } from 'react';
import { buildLogoSvg } from '../../lib/logoSvg';
import { useFontsReady } from '../../lib/useFontsReady';

function Logo({ name, concept, variant = 'primary', layout, logo, descriptor, className = '', style }) {
  const tick = useFontsReady(concept, name, logo);
  const logoKey = logo ? JSON.stringify(logo) : '';
  const cfgKey = JSON.stringify(concept.logo);
  const svg = useMemo(
    () => buildLogoSvg({ name, concept, variant, layout, logo, descriptor }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, cfgKey, concept.palette, variant, layout, logoKey, descriptor, tick],
  );
  return <div className={`logo-svg [&>svg]:h-full [&>svg]:w-full [&>svg]:max-w-full ${className}`} style={style} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default memo(Logo);
