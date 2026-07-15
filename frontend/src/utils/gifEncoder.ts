/**
 * gifEncoder.ts
 * 
 * Pure TypeScript/browser GIF encoder.
 * Converts an array of HTMLImageElement or canvas ImageData into
 * an animated GIF data URI — entirely client-side, no backend needed.
 *
 * Uses a simplified LZW + GIF89a approach with 256-colour quantisation
 * via a median-cut-inspired algorithm.
 *
 * Usage:
 *   const gifDataUrl = await encodeGif(frames, { fps: 6, pingPong: true, width: 480 });
 */

export interface GifOptions {
  fps?: number;       // default 6
  width?: number;     // output width px, height proportional. default 480
  pingPong?: boolean; // append reversed frames. default true
  quality?: number;   // 1 (best) to 20 (worst) quantisation. default 10
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Encode an array of image data-URLs into an animated GIF data URI.
 * @param frameDataUrls  Array of base64 data URIs (JPEG or PNG)
 * @param options        Encoding options
 * @returns              "data:image/gif;base64,..." string
 */
export async function encodeGif(
  frameDataUrls: string[],
  options: GifOptions = {}
): Promise<string> {
  const { fps = 6, width = 480, pingPong = true, quality = 10 } = options;

  if (frameDataUrls.length === 0) throw new Error('No frames provided');

  // 1. Load all images and draw to canvas at target size
  const rawFrames = await Promise.all(frameDataUrls.map(url => loadImageData(url, width)));

  // 2. Apply ping-pong
  const frames = pingPong && rawFrames.length > 1
    ? [...rawFrames, ...rawFrames.slice(1, -1).reverse()]
    : rawFrames;

  const delay = Math.round(100 / fps); // centiseconds per frame

  // 3. Build GIF bytes
  const bytes = buildGif89a(frames, delay, quality);

  // 4. Base64 encode
  const b64 = uint8ArrayToBase64(bytes);
  return `data:image/gif;base64,${b64}`;
}

// ─── Image loading ────────────────────────────────────────────

async function loadImageData(dataUrl: string, targetWidth: number): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = targetWidth / img.naturalWidth;
      const w = targetWidth;
      const h = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(ctx.getImageData(0, 0, w, h));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ─── GIF89a builder ───────────────────────────────────────────

function buildGif89a(frames: ImageData[], delayCs: number, quality: number): Uint8Array {
  const w = frames[0].width;
  const h = frames[0].height;

  const out: number[] = [];

  // Header
  writeString(out, 'GIF89a');
  writeU16(out, w);
  writeU16(out, h);
  out.push(0x00); // packed: no global color table
  out.push(0x00); // bg color index
  out.push(0x00); // pixel aspect ratio

  // Netscape looping extension (loop forever)
  out.push(0x21, 0xFF, 0x0B);
  writeString(out, 'NETSCAPE2.0');
  out.push(0x03, 0x01, 0x00, 0x00, 0x00);

  for (const frame of frames) {
    // Quantise to 256 colours
    const { palette, indexed } = quantise(frame, quality);
    const palSize = palette.length; // must be power of 2
    const colorTableFlag = Math.ceil(Math.log2(palSize)) - 1;

    // Graphics control extension (delay + disposal)
    out.push(0x21, 0xF9, 0x04);
    out.push(0b00000100); // disposal=1 (do not dispose), user input=0, transparent=0
    writeU16(out, delayCs);
    out.push(0x00); // transparent color index (unused)
    out.push(0x00); // block terminator

    // Image descriptor
    out.push(0x2C);
    writeU16(out, 0); writeU16(out, 0); // left, top
    writeU16(out, frame.width);
    writeU16(out, frame.height);
    out.push(0x80 | colorTableFlag); // local color table, not interlaced

    // Local color table
    for (const [r, g, b] of palette) {
      out.push(r, g, b);
    }
    // Pad to power-of-2 size
    for (let i = palette.length; i < palSize; i++) out.push(0, 0, 0);

    // LZW-compressed image data
    const minCodeSize = Math.max(2, Math.ceil(Math.log2(palSize)));
    const compressed = lzwEncode(indexed, minCodeSize);
    out.push(minCodeSize);
    // Write in 255-byte sub-blocks
    for (let i = 0; i < compressed.length; i += 255) {
      const block = compressed.slice(i, i + 255);
      out.push(block.length, ...block);
    }
    out.push(0x00); // block terminator
  }

  out.push(0x3B); // GIF trailer
  return new Uint8Array(out);
}

// ─── Colour quantisation (simple popularity/median cut) ───────

type RGB = [number, number, number];

function quantise(img: ImageData, quality: number): { palette: RGB[]; indexed: Uint8Array } {
  const data = img.data;
  const pixels = img.width * img.height;

  // Sample every `quality` pixels for speed
  const sampled: RGB[] = [];
  for (let i = 0; i < pixels; i += quality) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    sampled.push([r, g, b]);
  }

  // Build palette via median cut
  const palette = medianCut(sampled, 256);

  // Pad palette to next power of 2
  const targetSize = nextPow2(Math.max(palette.length, 2));
  while (palette.length < targetSize) palette.push([0, 0, 0]);

  // Build index map
  const indexed = new Uint8Array(pixels);
  for (let i = 0; i < pixels; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    indexed[i] = nearestColour(r, g, b, palette);
  }

  return { palette, indexed };
}

function medianCut(pixels: RGB[], maxColors: number): RGB[] {
  if (pixels.length === 0) return [[0, 0, 0]];

  let buckets: RGB[][] = [pixels];

  while (buckets.length < maxColors) {
    // Find bucket with largest range
    let maxRange = -1;
    let splitIdx = 0;
    let splitChannel = 0;

    for (let b = 0; b < buckets.length; b++) {
      const bkt = buckets[b];
      if (bkt.length < 2) continue;
      for (let ch = 0; ch < 3; ch++) {
        let mn = 255, mx = 0;
        for (const px of bkt) { mn = Math.min(mn, px[ch]); mx = Math.max(mx, px[ch]); }
        const range = mx - mn;
        if (range > maxRange) { maxRange = range; splitIdx = b; splitChannel = ch; }
      }
    }

    if (maxRange === 0) break;

    const bkt = buckets[splitIdx];
    const ch = splitChannel;
    bkt.sort((a, b) => a[ch] - b[ch]);
    const mid = Math.floor(bkt.length / 2);
    buckets.splice(splitIdx, 1, bkt.slice(0, mid), bkt.slice(mid));
  }

  // Average each bucket
  return buckets.map(bkt => {
    let r = 0, g = 0, bl = 0;
    for (const px of bkt) { r += px[0]; g += px[1]; bl += px[2]; }
    const n = bkt.length;
    return [Math.round(r / n), Math.round(g / n), Math.round(bl / n)] as RGB;
  });
}

function nearestColour(r: number, g: number, b: number, palette: RGB[]): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const [pr, pg, pb] = palette[i];
    const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return best;
}

function nextPow2(n: number): number {
  let p = 2;
  while (p < n) p *= 2;
  return Math.min(p, 256);
}

// ─── LZW encoder ─────────────────────────────────────────────

function lzwEncode(indices: Uint8Array, minCodeSize: number): number[] {
  const clearCode = 1 << minCodeSize;
  const eofCode = clearCode + 1;

  let codeSize = minCodeSize + 1;
  let nextCode = eofCode + 1;

  const table = new Map<string, number>();
  const resetTable = () => {
    table.clear();
    for (let i = 0; i < clearCode; i++) table.set(String(i), i);
    codeSize = minCodeSize + 1;
    nextCode = eofCode + 1;
  };
  resetTable();

  const output: number[] = [];
  let buf = 0, bufLen = 0;

  const writeBits = (v: number, bits: number) => {
    buf |= v << bufLen;
    bufLen += bits;
    while (bufLen >= 8) {
      output.push(buf & 0xFF);
      buf >>= 8;
      bufLen -= 8;
    }
  };

  writeBits(clearCode, codeSize);

  let entry = String(indices[0]);
  for (let i = 1; i < indices.length; i++) {
    const next = entry + ',' + indices[i];
    if (table.has(next)) {
      entry = next;
    } else {
      writeBits(table.get(entry)!, codeSize);
      if (nextCode < 4096) {
        table.set(next, nextCode++);
        if (nextCode > (1 << codeSize)) codeSize++;
      } else {
        writeBits(clearCode, codeSize);
        resetTable();
      }
      entry = String(indices[i]);
    }
  }
  writeBits(table.get(entry)!, codeSize);
  writeBits(eofCode, codeSize);
  if (bufLen > 0) output.push(buf & 0xFF);

  return output;
}

// ─── Utilities ────────────────────────────────────────────────

function writeString(out: number[], s: string) {
  for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
}

function writeU16(out: number[], n: number) {
  out.push(n & 0xFF, (n >> 8) & 0xFF);
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
