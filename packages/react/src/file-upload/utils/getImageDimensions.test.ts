import { describe, it, expect, vi, afterEach } from 'vitest';
import { getImageDimensions } from './getImageDimensions';

describe('getImageDimensions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null in non-browser environments (window undefined)', async () => {
    vi.stubGlobal('window', undefined);

    const file = new Blob(['data'], { type: 'image/png' });
    const result = await getImageDimensions(file);
    expect(result).toBeNull();
  });

  it('returns null in non-browser environments (Image undefined)', async () => {
    vi.stubGlobal('Image', undefined);

    const file = new Blob(['data'], { type: 'image/png' });
    const result = await getImageDimensions(file);
    expect(result).toBeNull();
  });
});
