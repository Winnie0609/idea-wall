export type Idea = {
  id: number;
  created_at: string;
  edited_at: string | null;
  title: string | null;
  content: string | null;
  tags: string[] | null;
};
