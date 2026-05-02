import { Pagination } from '@base-ui/react/pagination';

export default function ExamplePagination() {
  return (
    <Pagination.Root
      aria-label="Documentation pages"
      count={11}
      defaultPage={6}
      showFirstButton
      showLastButton
    >
      <Pagination.List className="m-0 flex list-none items-center gap-1 p-0 [&>li]:flex [&>li]:size-8 [&>li]:items-center [&>li]:justify-center [&>li>button]:m-0 [&>li>button]:box-border [&>li>button]:inline-flex [&>li>button]:size-8 [&>li>button]:cursor-pointer [&>li>button]:items-center [&>li>button]:justify-center [&>li>button]:rounded-xs [&>li>button]:border-0 [&>li>button]:bg-transparent [&>li>button]:p-0 [&>li>button]:font-[inherit] [&>li>button]:text-gray-600 [&>li>button]:outline-none [&>li>button]:select-none [&>li>button:focus-visible]:-outline-offset-1 [&>li>button:focus-visible]:outline-2 [&>li>button:focus-visible]:outline-blue-800 [&>li>button:hover]:bg-gray-100 [&>li>button:active]:bg-gray-200 [&>li[data-selected]>button]:bg-gray-100 [&>li[data-selected]>button]:text-gray-900 [&>li[data-disabled]>button]:cursor-not-allowed [&>li[data-disabled]>button]:opacity-45">
        <Pagination.Items />
      </Pagination.List>
    </Pagination.Root>
  );
}
