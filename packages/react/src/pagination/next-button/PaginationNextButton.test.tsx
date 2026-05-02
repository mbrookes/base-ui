import { expect, vi } from 'vitest';
import { screen } from '@mui/internal-test-utils';
import { Pagination } from '@base-ui/react/pagination';
import { createRenderer, describeConformance } from '#test-utils';

function TestPagination(props: Pagination.Root.Props) {
  return (
    <Pagination.Root count={10} defaultPage={5} {...props}>
      <Pagination.List>
        <Pagination.NextButton />
      </Pagination.List>
    </Pagination.Root>
  );
}

describe('<Pagination.NextButton />', () => {
  const { render } = createRenderer();

  describeConformance(<Pagination.NextButton />, () => ({
    refInstanceof: window.HTMLLIElement,
    render(node) {
      return render(
        <Pagination.Root count={10} defaultPage={5}>
          <Pagination.List>{node}</Pagination.List>
        </Pagination.Root>,
      );
    },
  }));

  it('renders a button with the next page label', async () => {
    await render(<TestPagination />);
    expect(screen.getByRole('button', { name: 'Go to next page' })).not.toBe(null);
  });

  it('is disabled and has data-disabled when on the last page', async () => {
    await render(<TestPagination defaultPage={10} />);
    const button = screen.getByRole('button', { name: 'Go to next page' });
    expect(button).toBeDisabled();
    expect(button.closest('li')).toHaveAttribute('data-disabled');
  });

  it('is enabled when not on the last page', async () => {
    await render(<TestPagination defaultPage={5} />);
    expect(screen.getByRole('button', { name: 'Go to next page' })).not.toBeDisabled();
  });

  it('navigates to the next page on click', async () => {
    const handlePageChange = vi.fn();
    const { user } = await render(
      <TestPagination defaultPage={5} onPageChange={handlePageChange} />,
    );

    await user.pointer({
      keys: '[MouseLeft]',
      target: screen.getByRole('button', { name: 'Go to next page' }),
    });

    expect(handlePageChange).toHaveBeenCalledWith(
      6,
      expect.objectContaining({ reason: 'item-press' }),
    );
  });

  it('is disabled when root is disabled', async () => {
    await render(<TestPagination defaultPage={5} disabled />);
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
  });

  it('throws a descriptive error when rendered outside Pagination.Root', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(render(<Pagination.NextButton />)).rejects.toThrow(
        'Base UI: PaginationRootContext is missing.',
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
