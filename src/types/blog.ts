// src/types/blog.ts
export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category?: string;
  imageUrl?: string;
  likes: number;
  dislikes: number;
  comments: Comment[];
  type: string;
}
