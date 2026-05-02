import { expect, vi } from 'vitest';
import { screen } from '@mui/internal-test-utils';
import { Pagination } from '@base-ui/react/pagination';
import { createRenderer, describeConformance } from '#test-utils';

describe('<Pagination.Item />', () => {
  const { render } = createRenderer();

  describeConformance(
    <Pagination.Item type="page" page={2} selected={false} disabled={false} />,
    () => ({
      refInstanceof: window.HTMLLIElement,
      render(node) {
        return render(
          <Pagination.Root count={10}>
            <Pagination.List>{node}</Pagination.List>
          </Pagination.Root>,
        );
      },
    }),
  );

  it('renders default content for page items', async () => {
    await render(
      <Pagination.Root count={10}>
        <Pagination.List>
          <Pagination.Item type="page" page={2} selected={false} disabled={false} />
        </Pagination.List>
      </Pagination.Root>,
    );

    expect(screen.getByRole('button', { name: 'Go to page 2' })).toHaveTextContent('2');
  });

  it('renders custom children inside the inner button', async () => {
    await render(
      <Pagination.Root count={10}>
        <Pagination.List>
          <Pagination.Item type="page" page={2} selected={false} disabled={false}>
            Two
          </Pagination.Item>
        </Pagination.List>
      </Pagination.Root>,
    );

    expect(screen.getByRole('button', { name: 'Go to page 2' })).toHaveTextContent('Two');
  });

  it('applies selected and disabled state to the item', async () => {
    await render(
      <Pagination.Root count={10}>
        <Pagination.List>
          <Pagination.Item type="page" page={2} selected disabled />
        </Pagination.List>
      </Pagination.Root>,
    );

    const button = screen.getByRole('button', { name: 'page 2, current page' });
    const item = button.closest('li');

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-current', 'page');
    expect(item).toHaveAttribute('data-selected');
    expect(item).toHaveAttribute('data-disabled');
  });

  it('throws a descriptive error when rendered outside <Pagination.Root>', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await expect(
        render(<Pagination.Item type="page" page={2} selected={false} disabled={false} />),
      ).rejects.toThrow(
        'Base UI: PaginationRootContext is missing. Pagination parts must be placed within <Pagination.Root>.',
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
