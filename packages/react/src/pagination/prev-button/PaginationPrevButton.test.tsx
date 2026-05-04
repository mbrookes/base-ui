import { expect, vi } from 'vitest';
import { screen } from '@mui/internal-test-utils';
import { Pagination } from '@base-ui/react/pagination';
import { createRenderer, describeConformance } from '#test-utils';

function TestPagination(props: Pagination.Root.Props & { page?: number; defaultPage?: number }) {
  return (
    <Pagination.Root count={10} defaultPage={5} {...props}>
      <Pagination.List>
        <Pagination.PrevButton />
      </Pagination.List>
    </Pagination.Root>
  );
}

describe('<Pagination.PrevButton />', () => {
  const { render } = createRenderer();

  describeConformance(<Pagination.PrevButton />, () => ({
    refInstanceof: window.HTMLLIElement,
    render(node) {
      return render(
        <Pagination.Root count={10} defaultPage={5}>
          <Pagination.List>{node}</Pagination.List>
        </Pagination.Root>,
      );
    },
  }));

  it('renders a button with the previous page label', async () => {
    await render(<TestPagination />);
    expect(screen.getByRole('button', { name: 'Go to previous page' })).not.toBe(null);
  });

  it('accepts a custom aria-label for the button', async () => {
    await render(
      <Pagination.Root count={10} defaultPage={5}>
        <Pagination.List>
          <Pagination.PrevButton aria-label="Page précédente" />
        </Pagination.List>
      </Pagination.Root>,
    );
    expect(screen.getByRole('button', { name: 'Page précédente' })).not.toBe(null);
  });

  it('is disabled and has data-disabled when on the first page', async () => {
    await render(<TestPagination defaultPage={1} />);
    const button = screen.getByRole('button', { name: 'Go to previous page' });
    expect(button).toBeDisabled();
    expect(button.closest('li')).toHaveAttribute('data-disabled');
  });

  it('is enabled when not on the first page', async () => {
    await render(<TestPagination defaultPage={3} />);
    expect(screen.getByRole('button', { name: 'Go to previous page' })).not.toBeDisabled();
  });

  it('navigates to the previous page on click', async () => {
    const handlePageChange = vi.fn();
    const { user } = await render(
      <TestPagination defaultPage={5} onPageChange={handlePageChange} />,
    );

    await user.pointer({
      keys: '[MouseLeft]',
      target: screen.getByRole('button', { name: 'Go to previous page' }),
    });

    expect(handlePageChange).toHaveBeenCalledWith(
      4,
      expect.objectContaining({ reason: 'item-press' }),
    );
  });

  it('is disabled when root is disabled', async () => {
    await render(<TestPagination defaultPage={5} disabled />);
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeDisabled();
  });

  it('renders custom children', async () => {
    await render(
      <Pagination.Root count={10} defaultPage={5}>
        <Pagination.List>
          <Pagination.PrevButton>Prev</Pagination.PrevButton>
        </Pagination.List>
      </Pagination.Root>,
    );
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toHaveTextContent('Prev');
  });

  it('throws a descriptive error when rendered outside Pagination.Root', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(render(<Pagination.PrevButton />)).rejects.toThrow(
        'Base UI: PaginationRootContext is missing.',
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
