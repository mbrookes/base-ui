import { Pagination } from '@base-ui/react/pagination';
import styles from './index.module.css';

export default function ExamplePagination() {
  return (
    <Pagination.Root
      aria-label="Documentation pages"
      count={11}
      defaultPage={6}
      showFirstButton
      showLastButton
    >
      <Pagination.List className={styles.List}>
        <Pagination.Items />
      </Pagination.List>
    </Pagination.Root>
  );
}
