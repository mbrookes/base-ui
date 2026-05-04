import { expect, vi } from 'vitest';
import { screen } from '@mui/internal-test-utils';
import { Pagination } from '@base-ui/react/pagination';
import { createRenderer, describeConformance } from '#test-utils';

function TestPagination(props: Pagination.Root.Props) {
  return (
    <Pagination.Root count={10} defaultPage={5} {...props}>
      <Pagination.List>
        <Pagination.FirstButton />
      </Pagination.List>
    </Pagination.Root>
  );
}

describe('<Pagination.FirstButton />', () => {
  const { render } = createRenderer();

  describeConformance(<Pagination.FirstButton />, () => ({
    refInstanceof: window.HTMLLIElement,
    render(node) {
      return render(
        <Pagination.Root count={10} defaultPage={5}>
          <Pagination.List>{node}</Pagination.List>
        </Pagination.Root>,
      );
    },
  }));

  it('renders a button with the first page label', async () => {
    await render(<TestPagination />);
    expect(screen.getByRole('button', { name: 'Go to first page' })).not.toBe(null);
  });

  it('accepts a custom aria-label for the button', async () => {
    await render(
      <Pagination.Root count={10} defaultPage={5}>
        <Pagination.List>
          <Pagination.FirstButton aria-label="Première page" />
        </Pagination.List>
      </Pagination.Root>,
    );
    expect(screen.getByRole('button', { name: 'Première page' })).not.toBe(null);
  });

  it('is disabled and has data-disabled when on the first page', async () => {
    await render(<TestPagination defaultPage={1} />);
    const button = screen.getByRole('button', { name: 'Go to first page' });
    expect(button).toBeDisabled();
    expect(button.closest('li')).toHaveAttribute('data-disabled');
  });

  it('navigates to page 1 on click', async () => {
    const handlePageChange = vi.fn();
    const { user } = await render(
      <TestPagination defaultPage={7} onPageChange={handlePageChange} />,
    );

    await user.pointer({
      keys: '[MouseLeft]',
      target: screen.getByRole('button', { name: 'Go to first page' }),
    });

    expect(handlePageChange).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ reason: 'item-press' }),
    );
  });

  it('is disabled when root is disabled', async () => {
    await render(<TestPagination defaultPage={5} disabled />);
    expect(screen.getByRole('button', { name: 'Go to first page' })).toBeDisabled();
  });

  it('throws a descriptive error when rendered outside Pagination.Root', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(render(<Pagination.FirstButton />)).rejects.toThrow(
        'Base UI: PaginationRootContext is missing.',
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
