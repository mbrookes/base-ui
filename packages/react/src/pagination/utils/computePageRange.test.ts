import { describe, expect, it } from 'vitest';
import { computePageRange } from './computePageRange';

describe('computePageRange', () => {
  describe('basic ranges', () => {
    it('shows all pages when count is small', () => {
      const result = computePageRange(1, 3, 1, 1);
      expect(result.startPages).toEqual([1]);
      expect(result.middlePages).toEqual([2]);
      expect(result.endPages).toEqual([3]);
      expect(result.showStartEllipsis).toBe(false);
      expect(result.showEndEllipsis).toBe(false);
    });

    it('shows both ellipses when current page is in the middle of a large range', () => {
      const result = computePageRange(6, 11, 1, 1);
      expect(result.startPages).toEqual([1]);
      expect(result.middlePages).toEqual([5, 6, 7]);
      expect(result.endPages).toEqual([11]);
      expect(result.showStartEllipsis).toBe(true);
      expect(result.showEndEllipsis).toBe(true);
    });

    it('shows no start ellipsis and expands window when on the first page', () => {
      const result = computePageRange(1, 11, 1, 1);
      expect(result.startPages).toEqual([1]);
      expect(result.middlePages).toEqual([2, 3, 4, 5]);
      expect(result.endPages).toEqual([11]);
      expect(result.showStartEllipsis).toBe(false);
      expect(result.showEndEllipsis).toBe(true);
    });

    it('shows no end ellipsis and expands window when on the last page', () => {
      const result = computePageRange(11, 11, 1, 1);
      expect(result.startPages).toEqual([1]);
      expect(result.middlePages).toEqual([7, 8, 9, 10]);
      expect(result.endPages).toEqual([11]);
      expect(result.showStartEllipsis).toBe(true);
      expect(result.showEndEllipsis).toBe(false);
    });

    it('handles a single page', () => {
      const result = computePageRange(1, 1, 1, 1);
      expect(result.startPages).toEqual([1]);
      expect(result.middlePages).toEqual([]);
      expect(result.endPages).toEqual([]);
      expect(result.showStartEllipsis).toBe(false);
      expect(result.showEndEllipsis).toBe(false);
    });
  });

  describe('gap filling', () => {
    it('fills a single-page left gap instead of showing an ellipsis', () => {
      // page=4, count=7: sibling window [3,4,5], start=[1], end=[7]
      // leftBridge = [2] (length 1) → no ellipsis, fill with 2
      const result = computePageRange(4, 7, 1, 1);
      expect(result.showStartEllipsis).toBe(false);
      expect(result.middlePages).toContain(2);
    });

    it('fills a single-page right gap instead of showing an ellipsis', () => {
      // page=4, count=7: sibling window [3,4,5], start=[1], end=[7]
      // rightBridge = [6] (length 1) → no ellipsis, fill with 6
      const result = computePageRange(4, 7, 1, 1);
      expect(result.showEndEllipsis).toBe(false);
      expect(result.middlePages).toContain(6);
    });

    it('shows an ellipsis when the gap is 2 or more pages', () => {
      // page=5, count=10: sibling=[4,5,6], start=[1], end=[10]
      // leftBridge=[2,3], rightBridge=[7,8,9] → both ellipses
      const result = computePageRange(5, 10, 1, 1);
      expect(result.showStartEllipsis).toBe(true);
      expect(result.showEndEllipsis).toBe(true);
    });
  });

  describe('siblingCount', () => {
    it('expands the middle window with a higher siblingCount', () => {
      const result = computePageRange(6, 11, 2, 1);
      expect(result.middlePages).toEqual([4, 5, 6, 7, 8]);
    });
  });

  describe('boundaryCount', () => {
    it('expands boundary windows with a higher boundaryCount', () => {
      const result = computePageRange(6, 11, 1, 2);
      expect(result.startPages).toEqual([1, 2]);
      expect(result.endPages).toEqual([10, 11]);
    });

    it('fills a single-page gap when boundary and sibling window are close', () => {
      // boundaryCount=2, siblingCount=1, page=5, count=11
      // startPages=[1,2], endPages=[10,11], sibling=[4,5,6]
      // leftBridge = range(3, 3) = [3] → fill
      const result = computePageRange(5, 11, 1, 2);
      expect(result.showStartEllipsis).toBe(false);
      expect(result.middlePages).toContain(3);
    });
  });

  describe('no duplicate pages', () => {
    it('does not duplicate pages at boundaries when sibling window overlaps', () => {
      const result = computePageRange(2, 11, 1, 1);
      const allPages = [...result.startPages, ...result.middlePages, ...result.endPages];
      const uniquePages = new Set(allPages);
      expect(allPages.length).toBe(uniquePages.size);
    });

    it('does not duplicate boundary pages when count equals boundaryCount', () => {
      const result = computePageRange(1, 2, 1, 2);
      const allPages = [...result.startPages, ...result.middlePages, ...result.endPages];
      const uniquePages = new Set(allPages);
      expect(allPages.length).toBe(uniquePages.size);
    });
  });
});
