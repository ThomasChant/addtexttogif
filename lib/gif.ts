'use client';

import GIF from 'gif.js';
import {decompressFrames, parseGIF} from 'gifuct-js';
import {getTemplate} from './templates';
import {GifFrame, OverlayItem, RenderResult} from './editor-types';

export interface ParsedGif {
  frames: GifFrame[];
  width: number;
  height: number;
  totalDuration: number;
}

export async function parseGif(file: File): Promise<ParsedGif> {
  const arrayBuffer = await file.arrayBuffer();
  const parsed = parseGIF(arrayBuffer);
  const frames = decompressFrames(parsed, true);
  const width = frames[0]?.dims.width ?? 0;
  const height = frames[0]?.dims.height ?? 0;

  const parsedFrames: GifFrame[] = frames.map((frame, index) => {
    const delayMs = Math.max(frame.delay ?? 10, 2) * 10;
    const imageData = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
    const canvas = document.createElement('canvas');
    canvas.width = frame.dims.width;
    canvas.height = frame.dims.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }
    ctx.putImageData(imageData, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    return {
      id: index,
      delay: delayMs,
      imageData,
      dataUrl
    };
  });

  const totalDuration = parsedFrames.reduce((acc, frame) => acc + frame.delay, 0);

  return {
    frames: parsedFrames,
    width,
    height,
    totalDuration
  };
}

export function formatDuration(ms: number) {
  const seconds = ms / 1000;
  return `${seconds.toFixed(2)}s`;
}

export async function renderGif(
  frames: GifFrame[],
  overlays: OverlayItem[],
  dimensions: {width: number; height: number}
): Promise<RenderResult> {
  if (!frames.length) {
    throw new Error('No frames to render');
  }

  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to access 2D context');
  }

  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: dimensions.width,
    height: dimensions.height,
    workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js'
  });

  const totalDuration = frames.reduce((acc, frame) => acc + frame.delay, 0);
  let elapsed = 0;

  frames.forEach((frame) => {
    ctx.putImageData(frame.imageData, 0, 0);

    const activeOverlays = overlays.filter(
      (overlay) => elapsed + frame.delay > overlay.start && elapsed < overlay.end
    );

    activeOverlays.forEach((overlay) => {
      drawOverlay(ctx, overlay, dimensions);
    });

    gif.addFrame(ctx, {copy: true, delay: frame.delay});
    elapsed += frame.delay;
  });

  return new Promise((resolve, reject) => {
    gif.on('finished', (blob: Blob) => {
      const blobUrl = URL.createObjectURL(blob);
      resolve({blobUrl, fileName: `addtextgif-${Date.now()}.gif`});
    });
    gif.on('abort', () => reject(new Error('GIF rendering aborted')));
    gif.render();
  });
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: OverlayItem,
  dimensions: {width: number; height: number}
) {
  const template = getTemplate(overlay.templateId);
  const {width, height} = dimensions;
  const x = overlay.x * width;
  const y = overlay.y * height;

  ctx.save();
  ctx.font = `${template.fontWeight ?? 500} ${template.fontSize}px ${template.fontFamily}`;
  ctx.fillStyle = template.color;
  ctx.textBaseline = 'top';

  const textMetrics = ctx.measureText(overlay.text);
  const textWidth = textMetrics.width;
  const textHeight = template.fontSize;
  const padding = template.padding;
  const backgroundX = x - textWidth / 2 - padding / 2;
  const backgroundY = y - padding / 2;
  const backgroundWidth = textWidth + padding;
  const backgroundHeight = textHeight + padding;

  ctx.shadowColor = template.shadow ?? 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = template.shadow ? 8 : 0;

  ctx.fillStyle = template.backgroundColor;
  roundRect(ctx, backgroundX, backgroundY, backgroundWidth, backgroundHeight, template.borderRadius);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = template.color;
  ctx.fillText(overlay.text, x - textWidth / 2, y);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
