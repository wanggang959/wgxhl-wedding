import { publicAssetPreloadPaths, publicAssetPreloads } from './publicAssetManifest';

const rawPublicAssetBaseUrl = __PUBLIC_ASSET_BASE_URL__;

export const publicAssetBaseUrl = rawPublicAssetBaseUrl.trim().replace(/\/+$/, '');

export function publicAsset(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${publicAssetBaseUrl}${normalizedPath}`;
}

export function publicAssetCssUrl(path) {
  return `url("${publicAsset(path)}")`;
}

export const publicAssetCssVars = {
  '--asset-flower-left': publicAssetCssUrl('/optimized/flower-left.webp'),
  '--asset-flower-right': publicAssetCssUrl('/optimized/flower-right.webp'),
  '--asset-petal-1': publicAssetCssUrl('/optimized/petal-1.webp'),
  '--asset-petal-2': publicAssetCssUrl('/optimized/petal-2.webp'),
  '--asset-petal-3': publicAssetCssUrl('/optimized/petal-3.webp'),
};

export { publicAssetPreloadPaths, publicAssetPreloads };

const preloadedAssets = new Set();

function getAssetType(path, as) {
  if (as === 'audio') return 'audio/mpeg';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  return '';
}

function preloadAsset(path, as) {
  const href = publicAsset(path);
  if (preloadedAssets.has(href)) return;

  preloadedAssets.add(href);

  const alreadyPreloaded = Array.from(document.head.querySelectorAll('link[rel="preload"]')).some((link) => link.href === href);
  if (alreadyPreloaded) return;

  const link = document.createElement('link');
  const type = getAssetType(path, as);

  link.rel = 'preload';
  link.as = as;
  link.href = href;

  if (type) {
    link.type = type;
  }

  if ('fetchPriority' in link) {
    link.fetchPriority = 'low';
  }

  document.head.appendChild(link);
}

export function preloadPublicAssets() {
  if (typeof document === 'undefined') return;

  publicAssetPreloads.forEach(({ as, path }) => preloadAsset(path, as));
}
