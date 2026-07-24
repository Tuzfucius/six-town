export function resolveGalleryAsset(assetPath: string) {
  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${basePath}${assetPath.replace(/^\/+/, '')}`;
}
