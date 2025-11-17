import type { Idea } from '@/lib/types';
import { fetchIdeasPaginated } from '@/lib/ideas';
import { PaginationBar } from '@/components/pagination-bar';
import { IdeaForm } from '@/components/idea-form';
import { IdeaCard } from '@/components/idea-card';

type HomeProps = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

export default async function Home(props: HomeProps) {
  const searchParams = await props.searchParams;

  const pageParam = searchParams?.page;
  const pageSizeParam = searchParams?.pageSize;

  const pageFromParams = Number.parseInt(pageParam ?? '', 10);
  const pageSizeFromParams = Number.parseInt(pageSizeParam ?? '', 10);

  const page =
    Number.isFinite(pageFromParams) && pageFromParams > 0 ? pageFromParams : 1;

  const rawPageSize =
    Number.isFinite(pageSizeFromParams) && pageSizeFromParams > 0
      ? pageSizeFromParams
      : DEFAULT_PAGE_SIZE;

  const pageSize =
    PAGE_SIZE_OPTIONS.find((size) => size === rawPageSize) ?? DEFAULT_PAGE_SIZE;

  let ideas: Idea[] = [];
  let error: Error | null = null;
  let total = 0;
  let totalPages = 1;
  let currentPage = page;
  let currentPageSize: number = pageSize;

  try {
    const result = await fetchIdeasPaginated(page, pageSize);
    ideas = result.ideas;
    total = result.total;
    totalPages = result.totalPages;
    currentPage = result.page;
    currentPageSize = result.pageSize;
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to load ideas.');
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header>
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <span className="font-medium">⚠️ Demo Project:</span> Public CRUD
            access. Be mindful when editing or deleting content.
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            SparkFloow
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Capture, organize, and explore ideas on a shared real-time wall.
          </p>
        </header>

        <section>
          <IdeaForm />
        </section>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            <p className="font-medium">Error loading ideas</p>
            <p className="mt-1 break-all">{error.message}</p>
          </div>
        ) : (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Latest ideas
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Showing {ideas.length} of {total} items
              </p>
            </div>

            {ideas.length > 0 ? (
              <>
                <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]">
                  {ideas.map((idea) => (
                    <div key={idea.id} className="mb-4 break-inside-avoid">
                      <IdeaCard idea={idea} />
                    </div>
                  ))}
                </div>
                {total > 0 && (
                  <div className="mt-4 flex justify-end">
                    <PaginationBar
                      page={currentPage}
                      totalPages={totalPages}
                      pageSize={currentPageSize}
                      totalItems={total}
                      pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
                No ideas yet. Be the first to add one above.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
