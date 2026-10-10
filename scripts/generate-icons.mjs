// One-off script: renders the Ironline app icon (a dumbbell mark on the
// signature Ember gradient) to every PNG size the PWA manifest / iOS need.
// Run with `node scripts/generate-icons.mjs`. Not needed at runtime.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public/icons", { recursive: true });

const mark = (size, { radius, padded = false } = {}) => {
  const r = radius ?? size * 0.22;
  const pad = padded ? size * 0.16 : 0;
  const inner = size - pad * 2;
  const cx = size / 2;
  const cy = size / 2;
  // Simple, bold dumbbell glyph — reads clearly at 16px and at 512px alike.
  const barW = inner * 0.62;
  const barH = inner * 0.1;
  const plateW = inner * 0.14;
  const plateH = inner * 0.46;
  const plateX1 = cx - barW / 2 - plateW / 2;
  const plateX2 = cx + barW / 2 - plateW / 2;

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FF3E63"/>
        <stop offset="100%" stop-color="#FF1F4C"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
    <g fill="#ffffff">
      <rect x="${cx - barW / 2}" y="${cy - barH / 2}" width="${barW}" height="${barH}" rx="${barH / 2}"/>
      <rect x="${plateX1 - plateW}" y="${cy - plateH / 2}" width="${plateW}" height="${plateH}" rx="${plateW / 2}"/>
      <rect x="${plateX2 + plateW}" y="${cy - plateH / 2}" width="${plateW}" height="${plateH}" rx="${plateW / 2}"/>
      <rect x="${plateX1 - plateW * 1.9}" y="${cy - plateH * 0.32}" width="${plateW * 0.7}" height="${plateH * 0.64}" rx="${plateW * 0.35}"/>
      <rect x="${plateX2 + plateW * 1.2}" y="${cy - plateH * 0.32}" width="${plateW * 0.7}" height="${plateH * 0.64}" rx="${plateW * 0.35}"/>
    </g>
  </svg>`;
};

const jobs = [
  { file: "public/icons/icon-192.png", size: 192, radius: 42 },
  { file: "public/icons/icon-512.png", size: 512, radius: 112 },
  { file: "public/icons/icon-maskable-512.png", size: 512, radius: 0, padded: true }, // full-bleed bg for maskable
  { file: "public/icons/apple-touch-icon.png", size: 180, radius: 40 },
];

for (const job of jobs) {
  const svg = mark(job.size, { radius: job.radius, padded: job.padded });
  await sharp(Buffer.from(svg)).png().toFile(job.file);
  console.log("wrote", job.file);
}

// Favicon (multi-res ico is overkill for a modern PWA — a 32px PNG-as-ico works everywhere that matters)
await sharp(Buffer.from(mark(64, { radius: 14 }))).png().toFile("public/favicon.png");
console.log("wrote public/favicon.png");
