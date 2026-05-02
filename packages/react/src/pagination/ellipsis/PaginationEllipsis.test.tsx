import { expect } from 'vitest';
import { screen } from '@mui/internal-test-utils';
import { Pagination } from '@base-ui/react/pagination';
import { createRenderer, describeConformance } from '#test-utils';

describe('<Pagination.Ellipsis />', () => {
  const { render } = createRenderer();

  describeConformance(<Pagination.Ellipsis />, () => ({
    render,
    refInstanceof: window.HTMLLIElement,
  }));

  it('renders the default ellipsis content', async () => {
    await render(<Pagination.Ellipsis />);

    expect(screen.getByText('…')).not.toBe(null);
  });

  it('renders custom children', async () => {
    await render(<Pagination.Ellipsis>More</Pagination.Ellipsis>);

    expect(screen.getByText('More')).not.toBe(null);
  });
});
