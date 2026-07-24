import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DEFAULT_SOURCE = 'E:\\桌面\\pic';
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const projectRoot = process.cwd();
const sourceRoot = path.resolve(process.env.GALLERY_SOURCE_DIR || DEFAULT_SOURCE);
const outputRoot = path.join(projectRoot, 'public', 'gallery');
const thumbnailRoot = path.join(outputRoot, 'thumbs');
const displayRoot = path.join(outputRoot, 'display');
const manifestPath = path.join(projectRoot, 'src', 'data', 'gallery.generated.ts');

type SourceImage = {
  absolutePath: string;
  relativePath: string;
};

type GalleryManifestItem = {
  id: string;
  thumbnailSrc: string;
  displaySrc: string;
  width: number;
  height: number;
  date: string;
  location: string;
  index: number;
};

async function collectImages(directory: string, baseDirectory = directory): Promise<SourceImage[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectImages(absolutePath, baseDirectory);
    if (!entry.isFile() || !SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) return [];
    return [{
      absolutePath,
      relativePath: path.relative(baseDirectory, absolutePath).split(path.sep).join('/'),
    }];
  }));
  return nested.flat();
}

function compareSourceImages(left: SourceImage, right: SourceImage) {
  return left.relativePath.localeCompare(right.relativePath, 'zh-CN', {
    numeric: true,
    sensitivity: 'base',
  });
}

function readDirectoryMetadata(relativePath: string) {
  const segments = relativePath.split('/');
  const date = segments[0] ?? '';
  const locationSegment = segments.length > 2 ? segments[segments.length - 2] : '';
  return {
    date,
    location: locationSegment.replace(/^\d+[_\-\s]*/, ''),
  };
}

function stableId(relativePath: string) {
  return createHash('sha1').update(relativePath.normalize('NFC')).digest('hex').slice(0, 16);
}

async function processImage(source: SourceImage, index: number): Promise<GalleryManifestItem> {
  const id = stableId(source.relativePath);
  const thumbnailName = `${id}.webp`;
  const displayName = `${id}.webp`;

  await sharp(source.absolutePath)
    .rotate()
    .resize(640, 800, { fit: 'cover', position: 'centre' })
    .webp({ quality: 74, effort: 5 })
    .toFile(path.join(thumbnailRoot, thumbnailName));

  const displayInfo = await sharp(source.absolutePath)
    .rotate()
    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(path.join(displayRoot, displayName));

  return {
    id,
    thumbnailSrc: `/gallery/thumbs/${thumbnailName}`,
    displaySrc: `/gallery/display/${displayName}`,
    width: displayInfo.width,
    height: displayInfo.height,
    ...readDirectoryMetadata(source.relativePath),
    index: index + 1,
  };
}

function createManifestSource(items: GalleryManifestItem[]) {
  return `import type { GalleryImage } from '../types/gallery';

// 此文件由 npm run gallery:sync 自动生成，请勿手工修改。
export const galleryImages = ${JSON.stringify(items, null, 2)} as const satisfies readonly GalleryImage[];
`;
}

async function main() {
  const images = (await collectImages(sourceRoot)).sort(compareSourceImages);
  if (!images.length) throw new Error(`未在 ${sourceRoot} 中找到 JPG、JPEG 或 PNG 图片。`);

  await rm(outputRoot, { recursive: true, force: true });
  await Promise.all([
    mkdir(thumbnailRoot, { recursive: true }),
    mkdir(displayRoot, { recursive: true }),
  ]);

  const items: GalleryManifestItem[] = [];
  for (const [index, image] of images.entries()) {
    items.push(await processImage(image, index));
    console.log(`[gallery] ${index + 1}/${images.length} ${image.relativePath}`);
  }

  await writeFile(manifestPath, createManifestSource(items), 'utf8');
  await writeFile(
    path.join(outputRoot, 'README.md'),
    '# gallery\n\n此目录由 `npm run gallery:sync` 生成，包含画廊缩略图和展示图。\n',
    'utf8',
  );
  console.log(`[gallery] 已生成 ${items.length} 张图片：${outputRoot}`);
}

void main().catch((error: unknown) => {
  console.error('[gallery] 素材同步失败：', error);
  process.exitCode = 1;
});
