import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { publicAssetPreloads } from './src/publicAssetManifest.js';

function cleanAssetBaseUrl(value) {
  return (value || '').trim().replace(/\/+$/, '');
}

function resolvePublicAssetBaseUrl(mode) {
  const env = loadEnv(mode, process.cwd(), '');

  return cleanAssetBaseUrl(
    process.env.PUBLIC_ASSET_BASE_URL ||
      process.env.VITE_PUBLIC_ASSET_BASE_URL ||
      env.PUBLIC_ASSET_BASE_URL ||
      env.VITE_PUBLIC_ASSET_BASE_URL
  );
}

function resolveAutoScrollSpeed(mode) {
  const env = loadEnv(mode, process.cwd(), '');
  const rawSpeed =
    process.env.AUTO_SCROLL_SPEED ||
    process.env.VITE_AUTO_SCROLL_SPEED ||
    env.AUTO_SCROLL_SPEED ||
    env.VITE_AUTO_SCROLL_SPEED;
  const speed = Number.parseFloat(rawSpeed);

  if (!Number.isFinite(speed)) {
    return 42;
  }

  return Math.min(Math.max(speed, 12), 120);
}

function publicAssetUrl(path, baseUrl) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

function getAssetType(path, as) {
  if (as === 'audio') return 'audio/mpeg';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  return '';
}

function renderPreloadLinks(publicAssetBaseUrl) {
  return publicAssetPreloads
    .map(({ as, path }) => {
      const attrs = [
        'rel="preload"',
        `as="${as}"`,
        `href="${publicAssetUrl(path, publicAssetBaseUrl)}"`,
        'fetchpriority="low"',
      ];
      const type = getAssetType(path, as);

      if (type) {
        attrs.push(`type="${type}"`);
      }

      return `    <link ${attrs.join(' ')} />`;
    })
    .join('\n');
}

export default defineConfig(({ mode }) => {
  const publicAssetBaseUrl = resolvePublicAssetBaseUrl(mode);
  const autoScrollSpeed = resolveAutoScrollSpeed(mode);
  const preloadLinks = renderPreloadLinks(publicAssetBaseUrl);

  return {
    plugins: [
      react(),
      {
        name: 'public-asset-base-url',
        transformIndexHtml(html) {
          const resolvedHtml = html
            .replaceAll('%PUBLIC_ASSET_BASE_URL%', publicAssetBaseUrl)
            .replaceAll('%VITE_PUBLIC_ASSET_BASE_URL%', publicAssetBaseUrl);

          return resolvedHtml.replace('    <meta charset="UTF-8" />', `    <meta charset="UTF-8" />\n${preloadLinks}`);
        },
      },
    ],
    define: {
      __PUBLIC_ASSET_BASE_URL__: JSON.stringify(publicAssetBaseUrl),
      __AUTO_SCROLL_SPEED__: JSON.stringify(autoScrollSpeed),
    },
  };
});
