'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';

import { createIdea } from '@/lib/ideas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function IdeaForm() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);

  function resetState() {
    setTitle('');
    setContent('');
    setTags('');
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedTags = tags.trim();

    if (!trimmedContent) {
      setError('Please provide some content.');
      return;
    }

    const tagArray =
      trimmedTags.length > 0
        ? trimmedTags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : null;

    try {
      await createIdea({
        title: trimmedTitle || null,
        content: trimmedContent || null,
        tags: tagArray,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred.';
      setError(message);
      toast.error('Failed to save idea.', {
        description: message,
      });
      return;
    }

    resetState();
    setIsExpanded(false);

    startTransition(() => {
      router.refresh();
    });
    toast.success('Idea added.');
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors dark:border-zinc-800 dark:bg-zinc-950">
        {!isExpanded ? (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex w-full cursor-text items-center rounded-md border border-transparent px-2 py-1 text-left text-sm text-zinc-500 transition-colors"
          >
            Add an idea...
          </button>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Input
                placeholder="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isPending}
                className="border-none px-0 shadow-none outline-none focus-visible:ring-0 focus-visible:border-transparent"
              />
              <Textarea
                placeholder="Add an idea..."
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={1}
                disabled={isPending}
                className="border-none px-0 shadow-none outline-none focus-visible:ring-0 focus-visible:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                placeholder="Labels (comma separated, e.g. design,idea,frontend)"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                disabled={isPending}
                className="border-none px-0 text-xs text-zinc-500 shadow-none outline-none focus-visible:ring-0 focus-visible:border-transparent"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="sm:ml-auto"
              >
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>

            {error ? (
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                This wall is public. Please avoid sharing sensitive information.
              </p>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
