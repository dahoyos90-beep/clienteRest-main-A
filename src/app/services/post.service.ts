import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { CreatePost, Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/posts`;

  // ===========================
  // Estado
  // ===========================

  private readonly _posts = signal<Post[]>([]);
  private readonly _selectedPost = signal<Post | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchTerm = signal('');
  private readonly _activeUserId = signal<number | null>(null);

  // ===========================
  // Señales públicas
  // ===========================

  readonly posts = this._posts.asReadonly();
  readonly selected = this._selectedPost.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly activeUserId = this._activeUserId.asReadonly();

  // ===========================
  // Computados
  // ===========================

  readonly filteredPosts = computed(() => {
    const term = this._searchTerm().trim().toLowerCase();
    const user = this._activeUserId();

    return this._posts().filter(post => {
      const matchesSearch =
        !term ||
        post.title.toLowerCase().includes(term) ||
        post.body.toLowerCase().includes(term);

      const matchesUser =
        user === null ||
        post.userId === user;

      return matchesSearch && matchesUser;
    });
  });

  readonly featuredPost = computed(() => {
    const posts = this.filteredPosts();
    return posts.length ? posts[0] : null;
  });

  readonly postCount = computed(() => this._posts().length);
  readonly filteredCount = computed(() => this.filteredPosts().length);

  readonly userOptions = computed(() => {
    return [...new Set(this._posts().map(p => p.userId))]
      .sort((a, b) => a - b);
  });

  readonly userCount = computed(() => this.userOptions().length);

  // ===========================
  // CRUD
  // ===========================

  // Método corregido: implementa la llamada al endpoint de comentarios
  getComments(postId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${postId}/comments`)
      .pipe(
        catchError(err =>
          this.handleError(`No fue posible cargar los comentarios del post ${postId}.`, err)
        )
      );
  }

  getAll(): void {
    this.setLoading(true);
    this.http.get<Post[]>(this.apiUrl)
      .pipe(
        map(posts => posts.map(post => this.formatPost(post))),
        tap({
          next: posts => this._posts.set(posts),
          error: err => this.handleError('No fue posible cargar los posts.', err),
          complete: () => this.setLoading(false)
        })
      )
      .subscribe();
  }

  getById(id: number): Observable<Post> {
    this.setLoading(true);
    return this.http.get<Post>(`${this.apiUrl}/${id}`)
      .pipe(
        map(post => this.formatPost(post)),
        tap(post => {
          this._selectedPost.set(post);
          this.setLoading(false);
        }),
        catchError(err =>
          this.handleError(`No fue posible obtener el post ${id}.`, err)
        )
      );
  }

  create(data: CreatePost): Observable<Post> {
    this.setLoading(true);
    return this.http.post<Post>(this.apiUrl, data)
      .pipe(
        map(post => this.formatPost(post)),
        tap(post => {
          this._posts.update(posts => [post, ...posts]);
          this._selectedPost.set(post);
          this.setLoading(false);
        }),
        catchError(err =>
          this.handleError('No fue posible crear el post.', err)
        )
      );
  }

  update(id: number, data: CreatePost): Observable<Post> {
    this.setLoading(true);
    return this.http.put<Post>(`${this.apiUrl}/${id}`, data)
      .pipe(
        map(post => this.formatPost(post)),
        tap(post => {
          this._posts.update(posts =>
            posts.map(p => p.id === id ? post : p)
          );
          this._selectedPost.set(post);
          this.setLoading(false);
        }),
        catchError(err =>
          this.handleError(`No fue posible actualizar el post ${id}.`, err)
        )
      );
  }

  delete(id: number): Observable<void> {
    this.setLoading(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this._posts.update(posts =>
            posts.filter(post => post.id !== id)
          );
          if (this._selectedPost()?.id === id) {
            this._selectedPost.set(null);
          }
          this.setLoading(false);
        }),
        catchError(err =>
          this.handleError(`No fue posible eliminar el post ${id}.`, err)
        )
      );
  }

  // ===========================
  // Acciones UI
  // ===========================

  setSearch(term: string): void {
    this._searchTerm.set(term);
  }

  setActiveUser(userId: number | null): void {
    this._activeUserId.set(userId);
  }

  clearSelected(): void {
    this._selectedPost.set(null);
  }

  // ===========================
  // Helpers
  // ===========================

  private setLoading(value: boolean): void {
    this._loading.set(value);
  }

  private handleError(message: string, error: any): Observable<never> {
    this._error.set(message);
    this.setLoading(false);
    return throwError(() => error);
  }

  private formatPost(post: Post): Post {
    return {
      ...post,
      title: this.toSentenceCase(post.title),
      body: this.toSentenceCase(post.body)
    };
  }

  private toSentenceCase(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() +
      text.slice(1).toLowerCase();
  }
}