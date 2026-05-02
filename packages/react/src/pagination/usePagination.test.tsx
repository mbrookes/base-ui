import * as React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePagination } from './usePagination';

function createClickEvent() {
  return { nativeEvent: new MouseEvent('click') } as React.MouseEvent;
}

describe('usePagination', () => {
  describe('basic behavior', () => {
    it('renders 1 page with no ellipsis for count=1', () => {
      const { result } = renderHook(() => usePagination({ count: 1 }));
      const types = result.current.items.map((i) => i.type);
      expect(types).toEqual(['previous', 'page', 'next']);
    });

    it('defaults to page 1', () => {
      const { result } = renderHook(() => usePagination({ count: 10 }));
      expect(result.current.page).toBe(1);
    });
  });

  describe('boundary disabled states', () => {
    it('disables previous on page 1', () => {
      const { result } = renderHook(() => usePagination({ count: 5, defaultPage: 1 }));
      const prev = result.current.items.find((i) => i.type === 'previous')!;
      expect(prev.disabled).toBe(true);
    });

    it('enables previous when not on first page', () => {
      const { result } = renderHook(() => usePagination({ count: 5, defaultPage: 3 }));
      const prev = result.current.items.find((i) => i.type === 'previous')!;
      expect(prev.disabled).toBe(false);
    });

    it('disables next on last page', () => {
      const { result } = renderHook(() => usePagination({ count: 5, defaultPage: 5 }));
      const next = result.current.items.find((i) => i.type === 'next')!;
      expect(next.disabled).toBe(true);
    });

    it('enables next when not on last page', () => {
      const { result } = renderHook(() => usePagination({ count: 5, defaultPage: 3 }));
      const next = result.current.items.find((i) => i.type === 'next')!;
      expect(next.disabled).toBe(false);
    });
  });

  describe('showFirstButton / showLastButton', () => {
    it('shows first button when enabled', () => {
      const { result } = renderHook(() => usePagination({ count: 5, showFirstButton: true }));
      const types = result.current.items.map((i) => i.type);
      expect(types).toContain('first');
    });

    it('shows last button when enabled', () => {
      const { result } = renderHook(() => usePagination({ count: 5, showLastButton: true }));
      const types = result.current.items.map((i) => i.type);
      expect(types).toContain('last');
    });

    it('disables first button on page 1', () => {
      const { result } = renderHook(() =>
        usePagination({ count: 5, showFirstButton: true, defaultPage: 1 }),
      );
      const first = result.current.items.find((i) => i.type === 'first')!;
      expect(first.disabled).toBe(true);
    });

    it('disables last button on last page', () => {
      const { result } = renderHook(() =>
        usePagination({ count: 5, showLastButton: true, defaultPage: 5 }),
      );
      const last = result.current.items.find((i) => i.type === 'last')!;
      expect(last.disabled).toBe(true);
    });
  });

  describe('hidePrevButton / hideNextButton', () => {
    it('hides previous button', () => {
      const { result } = renderHook(() => usePagination({ count: 5, hidePrevButton: true }));
      const types = result.current.items.map((i) => i.type);
      expect(types).not.toContain('previous');
    });

    it('hides next button', () => {
      const { result } = renderHook(() => usePagination({ count: 5, hideNextButton: true }));
      const types = result.current.items.map((i) => i.type);
      expect(types).not.toContain('next');
    });
  });

  describe('ellipsis', () => {
    it('does not show ellipsis when count <= 7', () => {
      const { result } = renderHook(() => usePagination({ count: 7, defaultPage: 4 }));
      const types = result.current.items.map((i) => i.type);
      expect(types).not.toContain('start-ellipsis');
      expect(types).not.toContain('end-ellipsis');
    });

    it('shows start-ellipsis when current page is far from start', () => {
      const { result } = renderHook(() => usePagination({ count: 10, defaultPage: 8 }));
      const types = result.current.items.map((i) => i.type);
      expect(types).toContain('start-ellipsis');
    });

    it('shows end-ellipsis when current page is far from end', () => {
      const { result } = renderHook(() => usePagination({ count: 10, defaultPage: 2 }));
      const types = result.current.items.map((i) => i.type);
      expect(types).toContain('end-ellipsis');
    });

    it('shows both ellipses when current page is in the middle', () => {
      const { result } = renderHook(() => usePagination({ count: 11, defaultPage: 6 }));
      const types = result.current.items.map((i) => i.type);
      expect(types).toContain('start-ellipsis');
      expect(types).toContain('end-ellipsis');
    });

    it('ellipsis items have undefined onClick', () => {
      const { result } = renderHook(() => usePagination({ count: 11, defaultPage: 6 }));
      const ellipses = result.current.items.filter(
        (i) => i.type === 'start-ellipsis' || i.type === 'end-ellipsis',
      );
      for (const item of ellipses) {
        expect(item.onClick).toBe(undefined);
      }
    });
  });

  describe('siblingCount', () => {
    it('siblingCount=0 shows fewer pages around current', () => {
      const { result } = renderHook(() =>
        usePagination({ count: 10, defaultPage: 5, siblingCount: 0 }),
      );
      const pages = result.current.items.filter((i) => i.type === 'page').map((i) => i.page);
      expect(pages).toEqual([1, 5, 10]);
    });

    it('siblingCount=2 shows more pages around current', () => {
      const { result } = renderHook(() =>
        usePagination({ count: 15, defaultPage: 8, siblingCount: 2 }),
      );
      const pages = result.current.items.filter((i) => i.type === 'page').map((i) => i.page);
      expect(pages).toContain(6);
      expect(pages).toContain(7);
      expect(pages).toContain(8);
      expect(pages).toContain(9);
      expect(pages).toContain(10);
    });
  });

  describe('boundaryCount', () => {
    it('boundaryCount=0 shows no boundary pages', () => {
      const { result } = renderHook(() =>
        usePagination({ count: 10, defaultPage: 5, boundaryCount: 0 }),
      );
      const pages = result.current.items.filter((i) => i.type === 'page').map((i) => i.page);
      expect(pages).not.toContain(1);
      expect(pages).not.toContain(10);
    });

    it('boundaryCount=2 shows two pages at start and end', () => {
      const { result } = renderHook(() =>
        usePagination({ count: 15, defaultPage: 8, boundaryCount: 2 }),
      );
      const pages = result.current.items.filter((i) => i.type === 'page').map((i) => i.page);
      expect(pages).toContain(1);
      expect(pages).toContain(2);
      expect(pages).toContain(14);
      expect(pages).toContain(15);
    });
  });

  describe('controlled state', () => {
    it('uses controlled page', () => {
      const { result } = renderHook(() => usePagination({ count: 10, page: 5 }));
      expect(result.current.page).toBe(5);
    });

    it('reflects selected=true on controlled page', () => {
      const { result } = renderHook(() => usePagination({ count: 10, page: 5 }));
      const selectedItem = result.current.items.find((i) => i.selected);
      expect(selectedItem?.page).toBe(5);
    });
  });

  describe('uncontrolled state', () => {
    it('updates page when onClick is called', () => {
      const { result } = renderHook(() => usePagination({ count: 10, defaultPage: 1 }));
      const page2 = result.current.items.find((i) => i.type === 'page' && i.page === 2)!;
      act(() => {
        page2.onClick!(createClickEvent());
      });
      expect(result.current.page).toBe(2);
    });
  });

  describe('disabled', () => {
    it('marks all page items as disabled when disabled=true', () => {
      const { result } = renderHook(() => usePagination({ count: 5, disabled: true }));
      const pageItems = result.current.items.filter((i) => i.type === 'page');
      for (const item of pageItems) {
        expect(item.disabled).toBe(true);
      }
    });
  });

  describe('onPageChange cancellation', () => {
    it('does not update page when onPageChange calls cancel()', () => {
      const { result } = renderHook(() =>
        usePagination({
          count: 10,
          defaultPage: 1,
          onPageChange: (_page, details) => {
            details.cancel();
          },
        }),
      );
      const page2 = result.current.items.find((i) => i.type === 'page' && i.page === 2)!;
      act(() => {
        page2.onClick!(createClickEvent());
      });
      expect(result.current.page).toBe(1);
    });

    it('updates page when onPageChange does not cancel', () => {
      const spy = vi.fn();
      const { result } = renderHook(() =>
        usePagination({ count: 10, defaultPage: 1, onPageChange: spy }),
      );
      const page3 = result.current.items.find((i) => i.type === 'page' && i.page === 3)!;
      act(() => {
        page3.onClick!(createClickEvent());
      });
      expect(spy).toHaveBeenCalledOnce();
      expect(result.current.page).toBe(3);
    });
  });
});
