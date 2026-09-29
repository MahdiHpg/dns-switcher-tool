// Generator for the DNS Switcher app icon.
// Design = the exact brand mark shown next to the app name in the sidebar:
//   renderer/styles.css  .brand-logo  → 38px box, border-radius 12px, background var(--accent-grad)
//   renderer/index.html  .brand-logo  → 22px white "globe" svg inside the 38px box
// Run: node make-icon.js  →  assets/icon.{ico,png}  +  src-tauri/icons/icon.{ico,png}
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZES = [256, 128, 64, 48, 32, 16];

// ---------- design tokens (mirrors the renderer stylesheet) ----------
// --accent-grad: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)
const GRADIENT = [
  [0.0, [0x63, 0x66, 0xf1]],
  [0.5, [0x8b, 0x5c, 0xf6]],
  [1.0, [0x22, 0xd3, 0xee]],
];
const CORNER_RATIO = 12 / 38; // .brand-logo border-radius ÷ box size
const GLYPH_RATIO = 22 / 38; // the 22px svg inside the 38px box
const GLYPH_STROKE = 2; // svg stroke-width
const VIEW = 24; // svg viewBox size
const GLYPH_WHITE = [255, 255, 255];

const clamp01 = (value) => (value < 0 ? 0 : value > 1 ? 1 : value);
const lerp = (from, to, t) => from + (to - from) * t;

const gradientAt = (t) => {
  const value = clamp01(t);
  for (let i = 0; i < GRADIENT.length - 1; i += 1) {
    const [from, rgbFrom] = GRADIENT[i];
    const [to, rgbTo] = GRADIENT[i + 1];
    if (value <= to) {
      const k = (value - from) / (to - from);
      return [0, 1, 2].map((c) => Math.round(lerp(rgbFrom[c], rgbTo[c], k)));
    }
  }
  return GRADIENT[GRADIENT.length - 1][1];
};

// ---------- geometry helpers ----------

/// فاصله‌ی علامت‌دار از مربع گوشه‌گرد (مثبت = بیرون)
const roundedSquareDistance = (x, y, size, radius) => {
  const half = size / 2;
  const dx = Math.abs(x - half) - (half - radius);
  const dy = Math.abs(y - half) - (half - radius);
  const outside = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  return outside + Math.min(Math.max(dx, dy), 0) - radius;
};

const distToSegment = (px, py, x1, y1, x2, y2) => {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const t = clamp01(((px - x1) * vx + (py - y1) * vy) / (vx * vx + vy * vy || 1));
  return Math.hypot(px - (x1 + t * vx), py - (y1 + t * vy));
};

/// فاصله تا خط دورِ آیکون «کره» در فضای viewBox (۲۴×۲۴)
///
/// مسیر نصف‌النهار در SVG چهار کمان به شعاع ۱۵.۳ است که در نقاط (12,2)، (16,12)،
/// (12,22) و (8,12) به هم می‌رسند؛ مرکز کمان‌های سمت راست x=0.71 و سمت چپ x=23.29 است.
const MERIDIAN_RADIUS = 15.3;
const MERIDIAN_RIGHT = 0.71;
const MERIDIAN_LEFT = 23.29;
const MERIDIAN_CENTER_Y = 12.31; // مرکز کمان بالا
const MERIDIAN_CENTER_Y_LOW = 11.69; // مرکز کمان پایین

const glyphDistance = (x, y) => {
  // دایره‌ی بیرونی کره
  let d = Math.abs(Math.hypot(x - 12, y - 12) - 10);
  // خط استوا: M2 12h20
  d = Math.min(d, distToSegment(x, y, 2, 12, 22, 12));
  // نصف‌النهار؛ بیرون از قطب‌ها ادامه ندارد
  if (Math.abs(y - 12) <= 10) {
    const centerY = y < 12 ? MERIDIAN_CENTER_Y : MERIDIAN_CENTER_Y_LOW;
    d = Math.min(d, Math.abs(Math.hypot(x - MERIDIAN_RIGHT, y - centerY) - MERIDIAN_RADIUS));
    d = Math.min(d, Math.abs(Math.hypot(x - MERIDIAN_LEFT, y - centerY) - MERIDIAN_RADIUS));
  }
  return d;
};

// ---------- rasteriser ----------

/// هر اندازه مستقیماً رندر می‌شود تا در ۱۶ و ۳۲ پیکسل هم لبه‌ها تمیز بمانند
const renderIcon = (size) => {
  const pixels = Buffer.alloc(size * size * 4);
  const radius = size * CORNER_RATIO;
  const scale = (size * GLYPH_RATIO) / VIEW; // پیکسل به‌ازای هر واحد viewBox
  const strokeHalf = GLYPH_STROKE / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const cx = x + 0.5;
      const cy = y + 0.5;

      const background = clamp01(0.5 - roundedSquareDistance(cx, cy, size, radius));

      // ۱۳۵ درجه مثل CSS: از گوشه‌ی بالا-چپ تا پایین-راست
      const t = size > 1 ? (x + y) / (2 * (size - 1)) : 0;
      const base = gradientAt(t);

      const glyph = clamp01(
        0.5 + (strokeHalf - glyphDistance((cx - size / 2) / scale + 12, (cy - size / 2) / scale + 12)) * scale
      );

      const i = (y * size + x) * 4;
      for (let c = 0; c < 3; c += 1) pixels[i + c] = Math.round(lerp(base[c], GLYPH_WHITE[c], glyph));
      pixels[i + 3] = Math.round(background * 255);
    }
  }
  return pixels;
};

// ---------- PNG / ICO writers ----------

let CRC_TABLE = null;
const crc32 = (buf) => {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i += 1) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
};

const pngChunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
};

const buildPng = (size, rgba) => {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // truecolour + alpha
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
};

const buildIco = (images) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + 16 * images.length;
  const entries = images.map((image) => {
    const entry = Buffer.alloc(16);
    entry[0] = image.size >= 256 ? 0 : image.size;
    entry[1] = image.size >= 256 ? 0 : image.size;
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(image.png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += image.png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((image) => image.png)]);
};

// ---------- write every target ----------

const images = SIZES.map((size) => ({ size, png: buildPng(size, renderIcon(size)) }));
const ico = buildIco(images);
const largestPng = images[0].png;

const targets = [
  path.join(__dirname, 'assets'),
  path.join(__dirname, 'src-tauri', 'icons'),
];

targets.forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'icon.ico'), ico);
  fs.writeFileSync(path.join(dir, 'icon.png'), largestPng);
});

console.log(`icon.ico (${SIZES.join('/')}) + icon.png (256) written to ${targets.join(' and ')}`);
