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
