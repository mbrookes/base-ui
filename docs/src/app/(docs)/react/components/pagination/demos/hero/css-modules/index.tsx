import { Pagination } from '@base-ui/react/pagination';
import styles from './index.module.css';

export default function ExamplePagination() {
  return (
    <Pagination.Root aria-label="Documentation pages" count={11} defaultPage={6}>
      <Pagination.List className={styles.List}>
        <Pagination.FirstButton />
        <Pagination.PrevButton />
        <Pagination.Pages />
        <Pagination.NextButton />
        <Pagination.LastButton />
      </Pagination.List>
    </Pagination.Root>
  );
}
