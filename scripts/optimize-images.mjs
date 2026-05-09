import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const outputRoot = path.join(root, 'public', 'optimized');

const images = [
  {
    input: 'public/couple-photo.JPG',
    output: 'public/optimized/couple-photo.webp',
    width: 900,
    quality: 76,
  },
  {
    input: 'public/flower-left.png',
    output: 'public/optimized/flower-left.webp',
    width: 520,
    quality: 82,
  },
  {
    input: 'public/flower-right.png',
    output: 'public/optimized/flower-right.webp',
    width: 560,
    quality: 82,
  },
  ...['petal-1.png', 'petal-2.png', 'petal-3.png'].map((name) => ({
    input: `public/${name}`,
    output: `public/optimized/${name.replace('.png', '.webp')}`,
    width: 220,
    quality: 82,
  })),
  ...[
    'IMGL4513.JPG',
    'IMGL4519.JPG',
    'IMGL4578.JPG',
    'IMGL4693.JPG',
    'IMGL4914.JPG',
    'IMGL4938.JPG',
    'IMGL4949.JPG',
    'IMGL5105.JPG',
    'proposal.jpg',
    'proposal-ring.jpg',
  ].map((name) => ({
    input: `public/gallery/${name}`,
    output: `public/optimized/gallery/${name.replace(/\.(jpe?g|JPG)$/i, '.webp')}`,
    width: name.startsWith('proposal') ? 900 : 1200,
    quality: name.startsWith('proposal') ? 78 : 76,
  })),
];

await fs.mkdir(outputRoot, { recursive: true });
await fs.mkdir(path.join(outputRoot, 'gallery'), { recursive: true });

const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

let originalTotal = 0;
let optimizedTotal = 0;

for (const image of images) {
  const inputPath = path.join(root, image.input);
  const outputPath = path.join(root, image.output);
  const original = await fs.stat(inputPath);

  await sharp(inputPath)
    .rotate()
    .resize({
      width: image.width,
      withoutEnlargement: true,
    })
    .webp({
      quality: image.quality,
      effort: 5,
    })
    .toFile(outputPath);

  const optimized = await fs.stat(outputPath);
  originalTotal += original.size;
  optimizedTotal += optimized.size;

  console.log(`${image.input} -> ${image.output}`);
  console.log(`  ${formatBytes(original.size)} -> ${formatBytes(optimized.size)}`);
}

console.log('');
console.log(`Total: ${formatBytes(originalTotal)} -> ${formatBytes(optimizedTotal)}`);
