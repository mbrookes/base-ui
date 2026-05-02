import { expect } from 'vitest';
import { screen } from '@mui/internal-test-utils';
import { Pagination } from '@base-ui/react/pagination';
import { createRenderer, describeConformance } from '#test-utils';

describe('<Pagination.List />', () => {
  const { render } = createRenderer();

  describeConformance(<Pagination.List />, () => ({
    refInstanceof: window.HTMLUListElement,
    render(node) {
      return render(<Pagination.Root count={10}>{node}</Pagination.Root>);
    },
  }));

  it('renders a list element', async () => {
    await render(
      <Pagination.Root count={10}>
        <Pagination.List data-testid="list" />
      </Pagination.Root>,
    );

    expect(screen.getByTestId('list').tagName).toBe('UL');
  });
});
