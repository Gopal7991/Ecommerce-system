export interface Post {
  id: number;
  title: string;
  body: string;
}

export interface CreatePostPayload {
  title: string;
  body: string;
}