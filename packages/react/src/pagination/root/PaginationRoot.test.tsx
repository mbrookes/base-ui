import { expect, vi } from 'vitest';
import { screen } from '@mui/internal-test-utils';
import { Pagination } from '@base-ui/react/pagination';
import { createRenderer, describeConformance } from '#test-utils';

function TestPagination(props: Pagination.Root.Props) {
  return (
    <Pagination.Root count={10} {...props}>
      <Pagination.List>
        <Pagination.Items />
      </Pagination.List>
    </Pagination.Root>
  );
}

describe('<Pagination.Root />', () => {
  const { render } = createRenderer();

  describeConformance(<Pagination.Root count={10} />, () => ({
    render,
    refInstanceof: window.HTMLElement,
  }));

  describe('rendering', () => {
    it('renders a navigation landmark and the current page', async () => {
      await render(<TestPagination defaultPage={3} />);

      expect(screen.getByRole('navigation', { name: 'pagination navigation' })).not.toBe(null);

      const currentPage = screen.getByRole('button', { name: 'page 3, current page' });
      expect(currentPage).toHaveAttribute('aria-current', 'page');
      expect(currentPage).toHaveTextContent('3');
    });

    it('renders ellipsis items when the range is truncated', async () => {
      await render(<TestPagination count={11} defaultPage={6} />);

      expect(screen.getAllByText('…')).toHaveLength(2);
    });
  });

  describe('uncontrolled', () => {
    it('changes page on click', async () => {
      const { user } = await render(<TestPagination defaultPage={1} />);

      await user.pointer({
        keys: '[MouseLeft]',
        target: screen.getByRole('button', { name: 'Go to page 2' }),
      });

      expect(screen.getByRole('button', { name: 'page 2, current page' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('does not update when the change is canceled', async () => {
      const { user } = await render(
        <TestPagination
          defaultPage={1}
          onPageChange={(_page, details) => {
            details.cancel();
          }}
        />,
      );

      await user.pointer({
        keys: '[MouseLeft]',
        target: screen.getByRole('button', { name: 'Go to page 2' }),
      });

      expect(screen.getByRole('button', { name: 'page 1, current page' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  });

  describe('controlled', () => {
    it('reflects page prop updates', async () => {
      const { setProps } = await render(<TestPagination page={2} />);

      expect(screen.getByRole('button', { name: 'page 2, current page' })).toHaveAttribute(
        'aria-current',
        'page',
      );

      await setProps({ page: 4 });

      expect(screen.getByRole('button', { name: 'page 4, current page' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('calls onPageChange with event details before parent updates', async () => {
      const handlePageChange = vi.fn();
      const { user } = await render(<TestPagination page={3} onPageChange={handlePageChange} />);

      await user.pointer({
        keys: '[MouseLeft]',
        target: screen.getByRole('button', { name: 'Go to page 4' }),
      });

      expect(handlePageChange).toHaveBeenCalledOnce();
      expect(handlePageChange.mock.calls[0][0]).toBe(4);
      expect(handlePageChange.mock.calls[0][1].reason).toBe('item-press');
      expect(screen.getByRole('button', { name: 'page 3, current page' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  });

  describe('prop: disabled', () => {
    it('disables all interactive buttons', async () => {
      await render(<TestPagination defaultPage={4} disabled showFirstButton showLastButton />);

      for (const button of screen.getAllByRole('button')) {
        expect(button).toBeDisabled();
      }
    });
  });
});
