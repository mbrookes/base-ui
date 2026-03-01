import { describe, it, expect } from 'vitest';
import {
  getImageDimensions,
  validateImageDimensions,
  getImageAspectRatio,
} from './getImageDimensions';

describe('getImageDimensions', () => {
  it('gets dimensions of a PNG image', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 50;
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      });
    });

    const dimensions = await getImageDimensions(blob);
    expect(dimensions).not.toBeNull();
    expect(dimensions?.width).toBe(100);
    expect(dimensions?.height).toBe(50);
  });

  it('returns null for non-image blob', async () => {
    const blob = new Blob(['not an image'], { type: 'text/plain' });
    const dimensions = await getImageDimensions(blob);
    expect(dimensions).toBeNull();
  });
});

describe('validateImageDimensions', () => {
  it('validates image dimensions against constraints', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      });
    });

    const result = await validateImageDimensions(blob, {
      minWidth: 640,
      maxWidth: 1920,
      minHeight: 480,
      maxHeight: 1080,
    });

    expect(result).toBeNull(); // Valid
  });

  it('rejects image smaller than minWidth', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      });
    });

    const result = await validateImageDimensions(blob, {
      minWidth: 640,
    });

    expect(result).toContain('must be at least 640px');
  });

  it('rejects image larger than maxWidth', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 3000;
    canvas.height = 2000;
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      });
    });

    const result = await validateImageDimensions(blob, {
      maxWidth: 2000,
    });

    expect(result).toContain('must not exceed 2000px');
  });
});

describe('getImageAspectRatio', () => {
  it('calculates correct aspect ratio', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      });
    });

    const ratio = await getImageAspectRatio(blob);
    expect(ratio).toBeCloseTo(1920 / 1080, 5);
  });

  it('returns null for non-image', async () => {
    const blob = new Blob(['not an image'], { type: 'text/plain' });
    const ratio = await getImageAspectRatio(blob);
    expect(ratio).toBeNull();
  });
});
