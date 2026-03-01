import { describe, it, expect } from 'vitest';
import { detectFileType, isValidFileType } from './detectFileType';

describe('detectFileType', () => {
  it('detects PNG file from magic numbers', async () => {
    // PNG signature: 89 50 4E 47
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);
    const blob = new Blob([pngHeader], { type: 'application/octet-stream' });
    const type = await detectFileType(blob);
    expect(type).toBe('image/png');
  });

  it('detects JPEG file from magic numbers', async () => {
    // JPEG signature: FF D8 FF
    const jpegHeader = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    ]);
    const blob = new Blob([jpegHeader], { type: 'application/octet-stream' });
    const type = await detectFileType(blob);
    expect(type).toBe('image/jpeg');
  });

  it('detects GIF file from magic numbers', async () => {
    // GIF signature: 47 49 46
    const gifHeader = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    const blob = new Blob([gifHeader], { type: 'application/octet-stream' });
    const type = await detectFileType(blob);
    expect(type).toBe('image/gif');
  });

  it('detects PDF file from magic numbers', async () => {
    // PDF signature: 25 50 44 46 (%PDF)
    const pdfHeader = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x00, 0x00, 0x00, 0x00,
    ]);
    const blob = new Blob([pdfHeader], { type: 'application/octet-stream' });
    const type = await detectFileType(blob);
    expect(type).toBe('application/pdf');
  });

  it('returns null for unknown file type', async () => {
    const unknownHeader = new Uint8Array([
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    const blob = new Blob([unknownHeader], { type: 'application/octet-stream' });
    const type = await detectFileType(blob);
    expect(type).toBeNull();
  });
});

describe('isValidFileType', () => {
  it('validates file type against accepted types', async () => {
    // PNG signature
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);
    const blob = new Blob([pngHeader], { type: 'application/octet-stream' });

    const result = await isValidFileType(blob, ['image/png', 'image/jpeg']);
    expect(result).toBe(true);
  });

  it('rejects file type not in accepted list', async () => {
    // PNG signature
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);
    const blob = new Blob([pngHeader], { type: 'application/octet-stream' });

    const result = await isValidFileType(blob, ['image/jpeg', 'image/webp']);
    expect(result).toBe(false);
  });

  it('accepts wildcard mime types', async () => {
    // PNG signature (image/png matches image/*)
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);
    const blob = new Blob([pngHeader], { type: 'application/octet-stream' });

    const result = await isValidFileType(blob, ['image/*']);
    expect(result).toBe(true);
  });

  it('returns false for unknown file type', async () => {
    const unknownHeader = new Uint8Array([
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    const blob = new Blob([unknownHeader], { type: 'application/octet-stream' });

    const result = await isValidFileType(blob, ['image/png']);
    expect(result).toBe(false);
  });
});
