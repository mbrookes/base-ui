/**
 * Get the width and height of an image from a File or blob.
 *
 * @param file - The image file to measure
 * @returns Promise resolving to {width, height} or null if unable to determine
 *
 * @example
 * ```tsx
 * const dimensions = await getImageDimensions(imageFile);
 * if (dimensions && dimensions.width > 2000) {
 *   console.log('Image is too wide');
 * }
 * ```
 */
export async function getImageDimensions(
  file: File | Blob,
): Promise<{ width: number; height: number } | null> {
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return null;
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

/**
 * Check if an image meets specified dimension constraints.
 *
 * @param file - The image file to validate
 * @param constraints - Min/max width and height constraints
 * @returns Promise resolving to error message if validation fails, or null if valid
 *
 * @example
 * ```tsx
 * const error = await validateImageDimensions(file, {
 *   minWidth: 800,
 *   maxWidth: 2000,
 *   minHeight: 600,
 *   maxHeight: 3000,
 * });
 * ```
 */
export async function validateImageDimensions(
  file: File | Blob,
  constraints: {
    minWidth?: number | undefined;
    maxWidth?: number | undefined;
    minHeight?: number | undefined;
    maxHeight?: number | undefined;
  },
): Promise<string | null> {
  const dimensions = await getImageDimensions(file);

  if (!dimensions) {
    return 'Unable to determine image dimensions';
  }

  if (constraints.minWidth != null && dimensions.width < constraints.minWidth) {
    return `Image width must be at least ${constraints.minWidth}px`;
  }

  if (constraints.maxWidth != null && dimensions.width > constraints.maxWidth) {
    return `Image width must not exceed ${constraints.maxWidth}px`;
  }

  if (constraints.minHeight != null && dimensions.height < constraints.minHeight) {
    return `Image height must be at least ${constraints.minHeight}px`;
  }

  if (constraints.maxHeight != null && dimensions.height > constraints.maxHeight) {
    return `Image height must not exceed ${constraints.maxHeight}px`;
  }

  return null;
}

/**
 * Calculate the aspect ratio of an image.
 *
 * @param file - The image file
 * @returns Promise resolving to aspect ratio (width / height) or null if unable to determine
 *
 * @example
 * ```tsx
 * const ratio = await getImageAspectRatio(file);
 * if (ratio && ratio > 2) {
 *   console.log('Very wide image');
 * }
 * ```
 */
export async function getImageAspectRatio(file: File | Blob): Promise<number | null> {
  const dimensions = await getImageDimensions(file);
  return dimensions ? dimensions.width / dimensions.height : null;
}
