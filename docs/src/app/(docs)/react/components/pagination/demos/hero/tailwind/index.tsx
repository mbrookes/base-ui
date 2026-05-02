import { Pagination } from '@base-ui/react/pagination';

export default function ExamplePagination() {
  return (
    <Pagination.Root
      aria-label="Documentation pages"
      className="flex justify-center rounded-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_35%),linear-gradient(135deg,#eef2ff,#f8fafc_55%,#ecfeff)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_40px_rgba(15,23,42,0.12)]"
      count={11}
      defaultPage={6}
      showFirstButton
      showLastButton
    >
      <Pagination.List className="m-0 flex list-none items-center gap-2 p-0 [&>li]:flex [&>li]:min-h-10 [&>li]:min-w-10 [&>li]:items-center [&>li]:justify-center [&>li]:text-sm [&>li]:font-medium [&>li]:text-slate-600 [&>li>button]:inline-flex [&>li>button]:h-10 [&>li>button]:w-10 [&>li>button]:items-center [&>li>button]:justify-center [&>li>button]:rounded-full [&>li>button]:border [&>li>button]:border-slate-300 [&>li>button]:bg-white/85 [&>li>button]:text-slate-900 [&>li>button]:transition-[background-color,border-color,color,transform] [&>li>button]:duration-150 [&>li>button:hover]:-translate-y-px [&>li>button:hover]:border-slate-400 [&>li>button:hover]:bg-white [&>li>button:focus-visible]:outline-2 [&>li>button:focus-visible]:outline-offset-2 [&>li>button:focus-visible]:outline-slate-900 [&>li[data-disabled]>button]:cursor-not-allowed [&>li[data-disabled]>button]:opacity-45 [&>li[data-disabled]>button:hover]:translate-y-0 [&>li[data-selected]>button]:border-slate-900 [&>li[data-selected]>button]:bg-slate-900 [&>li[data-selected]>button]:text-white">
        <Pagination.Items />
      </Pagination.List>
    </Pagination.Root>
  );
}
