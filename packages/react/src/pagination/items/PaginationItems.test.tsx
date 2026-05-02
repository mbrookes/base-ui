import { expect, vi } from 'vitest';
import { screen } from '@mui/internal-test-utils';
import { Pagination } from '@base-ui/react/pagination';
import { createRenderer } from '#test-utils';

describe('<Pagination.Items />', () => {
  const { render } = createRenderer();

  it('renders generated item parts from root state', async () => {
    await render(
      <Pagination.Root count={11} defaultPage={6}>
        <Pagination.List>
          <Pagination.Items />
        </Pagination.List>
      </Pagination.Root>,
    );

    expect(screen.getByRole('button', { name: 'page 6, current page' })).toHaveTextContent('6');
    expect(screen.getAllByText('…')).toHaveLength(2);
  });

  it('throws a descriptive error when rendered outside <Pagination.Root>', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await expect(render(<Pagination.Items />)).rejects.toThrow(
        'Base UI: PaginationRootContext is missing. Pagination parts must be placed within <Pagination.Root>.',
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
