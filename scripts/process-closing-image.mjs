import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const inputPath = path.join(root, 'public', 'IMGL4677.png');
const outputPath = path.join(root, 'public', 'optimized', 'gallery', 'IMGL4677-closing.webp');

await fs.mkdir(path.dirname(outputPath), { recursive: true });

await sharp(inputPath)
  .rotate()
  .trim({ threshold: 8 })
  .resize({
    width: 1400,
    withoutEnlargement: true,
  })
  .webp({
    quality: 86,
    effort: 5,
    alphaQuality: 100,
  })
  .toFile(outputPath);

const optimized = await sharp(outputPath).metadata();
const stats = await fs.stat(outputPath);

console.log(`Processed ${path.relative(root, inputPath)} -> ${path.relative(root, outputPath)}`);
console.log(`  ${optimized.width}x${optimized.height}, ${(stats.size / 1024).toFixed(1)} KB`);
