'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { deleteIdea, updateIdea } from '@/lib/ideas';
import type { Idea } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type IdeaCardProps = {
  idea: Idea;
  canEdit?: boolean;
  canDelete?: boolean;
};

export function IdeaCard({
  idea,
  canEdit = true,
  canDelete = true,
}: IdeaCardProps) {
  const router = useRouter();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [title, setTitle] = useState(idea.title ?? '');
  const [content, setContent] = useState(idea.content ?? '');
  const [tags, setTags] = useState(idea.tags?.join(', ') ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function resetState() {
    setTitle(idea.title ?? '');
    setContent(idea.content ?? '');
    setTags(idea.tags?.join(', ') ?? '');
    setError(null);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
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
      await updateIdea(idea.id, {
        title: trimmedTitle || null,
        content: trimmedContent || null,
        tags: tagArray,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred.';
      setError(message);
      toast.error('Failed to update idea.', {
        description: message,
      });
      return;
    }

    startTransition(() => {
      router.refresh();
    });

    setIsEditOpen(false);
    toast.success('Idea updated.');
  }

  async function handleDelete() {
    setError(null);
    try {
      await deleteIdea(idea.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred.';
      setError(message);
      toast.error('Failed to delete idea.', {
        description: message,
      });
      return;
    }

    startTransition(() => {
      router.refresh();
    });
    setIsDeleteOpen(false);
    toast.success('Idea deleted.');
  }

  return (
    <>
      <Card
        className={`bg-white/90 dark:bg-zinc-950/90 gap-1.5 ${
          canEdit
            ? 'cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900'
            : ''
        }`}
        onClick={canEdit ? () => setIsEditOpen(true) : undefined}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">
              {idea.title || 'Untitled idea'}
            </CardTitle>
          </div>
        </CardHeader>
        {idea.content && (
          <CardContent className="pt-0 text-sm text-zinc-700 dark:text-zinc-300">
            <p className="whitespace-pre-wrap break-words">{idea.content}</p>
          </CardContent>
        )}
        <CardFooter className="mt-2 flex flex-col gap-2 text-xs text-zinc-500 dark:text-zinc-400 items-start">
          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {idea.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {tag}
                </span>
              ))}
              {idea.tags.length > 4 && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  ...
                </span>
              )}
            </div>
          )}
          <div className="flex items-start">
            <div>
              {idea.edited_at
                ? `Edited ${new Date(idea.edited_at).toLocaleString(undefined, {
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : new Date(idea.created_at).toLocaleString(undefined, {
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
            </div>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              You are about to delete this idea created on{' '}
              {new Date(idea.created_at).toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleDelete} disabled={isPending}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {canEdit && (
        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) {
              resetState();
              setError(null);
            }
          }}
        >
          <DialogContent>
            <form onSubmit={handleSave} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Edit idea</DialogTitle>
                <DialogDescription>
                  Update the title, content, or labels for this idea.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={isPending}
                />
                <Textarea
                  placeholder="Add an idea..."
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={4}
                  disabled={isPending}
                />
                <Input
                  placeholder="Labels (comma separated, e.g. design,idea,frontend)"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  disabled={isPending}
                />
              </div>
              <DialogFooter className="flex w-full items-center justify-between gap-3">
                {canDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="mr-auto"
                    onClick={() => setIsDeleteOpen(true)}
                    disabled={isPending}
                  >
                    Delete
                  </Button>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </DialogFooter>
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
