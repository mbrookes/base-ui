import { expect, vi } from 'vitest';
import { screen } from '@mui/internal-test-utils';
import { Pagination } from '@base-ui/react/pagination';
import { createRenderer } from '#test-utils';

function TestPagination(props: Pagination.Root.Props & Pagination.Pages.Props) {
  const { siblingCount, boundaryCount, getAriaLabel, ...rootProps } = props;
  return (
    <Pagination.Root count={11} defaultPage={6} {...rootProps}>
      <Pagination.List>
        <Pagination.Pages
          siblingCount={siblingCount}
          boundaryCount={boundaryCount}
          getAriaLabel={getAriaLabel}
        />
      </Pagination.List>
    </Pagination.Root>
  );
}

describe('<Pagination.Pages />', () => {
  const { render } = createRenderer();

  it('renders page buttons', async () => {
    await render(<TestPagination />);
    expect(screen.getByRole('button', { name: 'page 6' })).not.toBe(null);
  });

  it('marks the current page with aria-current', async () => {
    await render(<TestPagination defaultPage={3} />);
    expect(screen.getByRole('button', { name: 'page 3' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders ellipsis elements for large ranges', async () => {
    await render(<TestPagination />);
    // count=11, page=6 → both ellipses
    expect(screen.getAllByText('…')).toHaveLength(2);
  });

  it('renders no ellipsis when the range is fully visible', async () => {
    await render(<TestPagination count={3} defaultPage={2} />);
    expect(screen.queryByText('…')).toBe(null);
  });

  it('changes page when a page button is clicked', async () => {
    const handlePageChange = vi.fn();
    const { user } = await render(
      <TestPagination defaultPage={1} onPageChange={handlePageChange} />,
    );

    await user.pointer({
      keys: '[MouseLeft]',
      target: screen.getByRole('button', { name: 'Go to page 2' }),
    });

    expect(handlePageChange).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ reason: 'item-press' }),
    );
  });

  it('respects siblingCount', async () => {
    await render(<TestPagination defaultPage={6} siblingCount={2} />);
    // With siblingCount=2, middle window is [4,5,6,7,8]
    expect(screen.getByRole('button', { name: 'Go to page 4' })).not.toBe(null);
    expect(screen.getByRole('button', { name: 'Go to page 8' })).not.toBe(null);
  });

  it('respects boundaryCount', async () => {
    await render(<TestPagination defaultPage={6} boundaryCount={2} />);
    // With boundaryCount=2, boundary windows are [1,2] and [10,11]
    expect(screen.getByRole('button', { name: 'Go to page 2' })).not.toBe(null);
    expect(screen.getByRole('button', { name: 'Go to page 10' })).not.toBe(null);
  });

  it('disables all page buttons when root is disabled', async () => {
    await render(<TestPagination count={5} defaultPage={3} disabled />);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('data-disabled');
    }
  });

  it('uses a custom getAriaLabel for page buttons', async () => {
    await render(
      <TestPagination
        count={5}
        defaultPage={2}
        getAriaLabel={(p, isCurrent) => (isCurrent ? `Seite ${p}` : `Zur Seite ${p}`)}
      />,
    );
    expect(screen.getByRole('button', { name: 'Seite 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Zur Seite 3' })).not.toBe(null);
  });

  it('throws a descriptive error when rendered outside Pagination.Root', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(render(<Pagination.Pages />)).rejects.toThrow(
        'Base UI: PaginationRootContext is missing.',
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
