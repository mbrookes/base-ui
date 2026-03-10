/**
 * Detect actual file type by reading magic numbers (file signatures).
 * This is more reliable than MIME type guessing.
 *
 * @param file - The file to analyze
 * @returns Promise resolving to detected MIME type or null if unknown
 *
 * @example
 * ```tsx
 * const actualType = await detectFileType(file);
 * // Better than relying on file.type which can be spoofed
 * ```
 */
export async function detectFileType(file: File | Blob): Promise<string | null> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png';
  }

  // GIF: 47 49 46 (GIF)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return 'image/gif';
  }

  // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF ... WEBP)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  // SVG: 3C 3F 78 6D 6C or 3C 73 76 67 (<?xml or <svg)
  if (
    (bytes[0] === 0x3c && bytes[1] === 0x3f && bytes[2] === 0x78 && bytes[3] === 0x6d) ||
    (bytes[0] === 0x3c && bytes[1] === 0x73 && bytes[2] === 0x76 && bytes[3] === 0x67)
  ) {
    return 'image/svg+xml';
  }

  // PDF: 25 50 44 46 (%PDF)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'application/pdf';
  }

  // ZIP: 50 4B (PK)
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    return 'application/zip';
  }

  return null;
}

/**
 * Check if a file's actual type (via magic numbers) matches expected types.
 * More reliable than relying on file.type property which can be spoofed.
 *
 * @param file - The file to validate
 * @param acceptedTypes - Array of accepted MIME types or extensions
 * @returns Promise resolving to true if file type matches, false otherwise
 *
 * @example
 * ```tsx
 * const isValid = await isValidFileType(file, ['image/jpeg', 'image/png']);
 * ```
 */
export async function isValidFileType(
  file: File | Blob,
  acceptedTypes: string[],
): Promise<boolean> {
  const detectedType = await detectFileType(file);

  if (!detectedType) {
    return false;
  }

  return acceptedTypes.some((acceptedType) => {
    // Exact match
    if (acceptedType === detectedType) {
      return true;
    }

    // Wildcard match (e.g., image/*)
    if (acceptedType.endsWith('/*')) {
      const prefix = acceptedType.slice(0, -2);
      return detectedType.startsWith(prefix);
    }

    return false;
  });
}
