import { expect, vi } from 'vitest';
import { screen } from '@mui/internal-test-utils';
import { Pagination } from '@base-ui/react/pagination';
import { createRenderer, describeConformance } from '#test-utils';

function TestPagination(props: Pagination.Root.Props) {
  return (
    <Pagination.Root count={10} defaultPage={5} {...props}>
      <Pagination.List>
        <Pagination.LastButton />
      </Pagination.List>
    </Pagination.Root>
  );
}

describe('<Pagination.LastButton />', () => {
  const { render } = createRenderer();

  describeConformance(<Pagination.LastButton />, () => ({
    refInstanceof: window.HTMLLIElement,
    render(node) {
      return render(
        <Pagination.Root count={10} defaultPage={5}>
          <Pagination.List>{node}</Pagination.List>
        </Pagination.Root>,
      );
    },
  }));

  it('renders a button with the last page label', async () => {
    await render(<TestPagination />);
    expect(screen.getByRole('button', { name: 'Go to last page' })).not.toBe(null);
  });

  it('accepts a custom aria-label for the button', async () => {
    await render(
      <Pagination.Root count={10} defaultPage={5}>
        <Pagination.List>
          <Pagination.LastButton aria-label="Dernière page" />
        </Pagination.List>
      </Pagination.Root>,
    );
    expect(screen.getByRole('button', { name: 'Dernière page' })).not.toBe(null);
  });

  it('is disabled and has data-disabled when on the last page', async () => {
    await render(<TestPagination defaultPage={10} />);
    const button = screen.getByRole('button', { name: 'Go to last page' });
    expect(button).toBeDisabled();
    expect(button.closest('li')).toHaveAttribute('data-disabled');
  });

  it('navigates to the last page on click', async () => {
    const handlePageChange = vi.fn();
    const { user } = await render(
      <TestPagination defaultPage={3} onPageChange={handlePageChange} />,
    );

    await user.pointer({
      keys: '[MouseLeft]',
      target: screen.getByRole('button', { name: 'Go to last page' }),
    });

    expect(handlePageChange).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ reason: 'item-press' }),
    );
  });

  it('is disabled when root is disabled', async () => {
    await render(<TestPagination defaultPage={5} disabled />);
    expect(screen.getByRole('button', { name: 'Go to last page' })).toBeDisabled();
  });

  it('throws a descriptive error when rendered outside Pagination.Root', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(render(<Pagination.LastButton />)).rejects.toThrow(
        'Base UI: PaginationRootContext is missing.',
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
