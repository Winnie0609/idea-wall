import { supabase } from '@/lib/supabaseClient';
import type { Idea } from '@/lib/types';

type IdeaInput = {
  title: string | null;
  content: string | null;
  tags: string[] | null;
};

export async function fetchIdeas(limit = 50): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select('id, created_at, edited_at, title, content, tags')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Idea[];
}

export type PaginatedIdeasResult = {
  ideas: Idea[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function fetchIdeasPaginated(
  page: number,
  pageSize: number
): Promise<PaginatedIdeasResult> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100
      ? Math.floor(pageSize)
      : 10;

  const { count, error: countError } = await supabase
    .from('ideas')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw new Error(countError.message);
  }

  const total = typeof count === 'number' && count > 0 ? count : 0;
  const totalPages =
    total > 0 ? Math.max(1, Math.ceil(total / safePageSize)) : 1;

  const normalizedPage = Math.max(1, Math.min(safePage, totalPages));

  const from = (normalizedPage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const { data, error } = await supabase
    .from('ideas')
    .select('id, created_at, edited_at, title, content, tags')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    ideas: (data ?? []) as Idea[],
    page: normalizedPage,
    pageSize: safePageSize,
    total,
    totalPages,
  };
}

export async function createIdea(input: IdeaInput): Promise<void> {
  const { error } = await supabase.from('ideas').insert({
    title: input.title,
    content: input.content,
    tags: input.tags,
    edited_at: null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateIdea(id: number, input: IdeaInput): Promise<void> {
  const { error } = await supabase
    .from('ideas')
    .update({
      title: input.title,
      content: input.content,
      tags: input.tags,
      edited_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteIdea(id: number): Promise<void> {
  const { error } = await supabase.from('ideas').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
