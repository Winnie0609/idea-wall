import type { Idea } from '@/lib/types';
import { fetchIdeas } from '@/lib/ideas';
import { IdeaForm } from '@/components/idea-form';
import { IdeaCard } from '@/components/idea-card';

export default async function Home() {
  let ideas: Idea[] = [];
  let error: Error | null = null;

  try {
    ideas = await fetchIdeas(30);
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to load ideas.');
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header>
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
                Showing {ideas.length} items
              </p>
            </div>

            {ideas.length > 0 ? (
              <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]">
                {ideas.map((idea) => (
                  <div key={idea.id} className="mb-4 break-inside-avoid">
                    <IdeaCard idea={idea} />
                  </div>
                ))}
              </div>
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
