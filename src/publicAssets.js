const rawPublicAssetBaseUrl = import.meta.env.VITE_PUBLIC_ASSET_BASE_URL || '';

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
