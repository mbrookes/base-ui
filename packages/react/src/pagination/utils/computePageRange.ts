export interface ComputePageRangeResult {
  /**
   * Pages shown at the start of the list (first boundary).
   */
  startPages: number[];
  /**
   * Pages shown around the current page (sibling window), including any
   * single-page gap-fills that replace what would otherwise be an ellipsis.
   */
  middlePages: number[];
  /**
   * Pages shown at the end of the list (last boundary).
   */
  endPages: number[];
  /**
   * Whether an ellipsis should appear between startPages and middlePages.
   */
  showStartEllipsis: boolean;
  /**
   * Whether an ellipsis should appear between middlePages and endPages.
   */
  showEndEllipsis: boolean;
}

function range(start: number, end: number): number[] {
  if (start > end) {
    return [];
  }
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}

/**
 * Computes the page ranges and ellipsis positions for a pagination control.
 *
 * - Pages `[1, boundaryCount]` are always shown at the start.
 * - Pages `[count-boundaryCount+1, count]` are always shown at the end.
 * - Pages `[page-siblingCount, page+siblingCount]` are always shown in the middle.
 * - If the gap between the start boundary and the middle window is exactly 1 page,
 *   that page is shown instead of an ellipsis.
 * - If the gap is 2 or more pages, an ellipsis is shown.
 * - The same logic applies for the gap between the middle window and the end boundary.
 */
export function computePageRange(
  page: number,
  count: number,
  siblingCount: number,
  boundaryCount: number,
): ComputePageRangeResult {
  // Start boundary: [1, boundaryCount], clamped to count
  const startPages = range(1, Math.min(boundaryCount, count));

  // End boundary: [count-boundaryCount+1, count], but must not overlap startPages
  const endStart = Math.max(count - boundaryCount + 1, boundaryCount + 1);
  const endPages = range(Math.max(endStart, 1), count);

  // Sibling window around the current page, clamped to [1, count]
  const sibStart = Math.max(page - siblingCount, 1);
  const sibEnd = Math.min(page + siblingCount, count);

  // Right edge of the start boundary and left edge of the end boundary
  const startEdge = startPages.length > 0 ? startPages[startPages.length - 1] : 0;
  const endEdge = endPages.length > 0 ? endPages[0] : count + 1;

  // Pages in the gap between startPages and the sibling window
  const leftBridge = range(startEdge + 1, sibStart - 1);
  // Pages in the gap between the sibling window and endPages
  const rightBridge = range(sibEnd + 1, endEdge - 1);

  const showStartEllipsis = leftBridge.length > 1;
  const showEndEllipsis = rightBridge.length > 1;

  // If the gap is exactly 1 page, show that page instead of an ellipsis
  const leftFill = leftBridge.length === 1 ? leftBridge : [];
  const rightFill = rightBridge.length === 1 ? rightBridge : [];

  const startSet = new Set(startPages);
  const endSet = new Set(endPages);

  // Middle pages = filled left gap + sibling window + filled right gap,
  // with pages already in the boundary windows removed to avoid duplicates.
  const middlePages = [...leftFill, ...range(sibStart, sibEnd), ...rightFill].filter(
    (p) => !startSet.has(p) && !endSet.has(p),
  );

  return { startPages, middlePages, endPages, showStartEllipsis, showEndEllipsis };
}
