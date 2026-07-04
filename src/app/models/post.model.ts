export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export type CreatePost = Omit<Post, 'id'>;
export type UpdatePost = Partial<CreatePost>;

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export interface ApiError {
  status: number;
  message: string;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export type AsyncListState<T> = AsyncState<T[]>;