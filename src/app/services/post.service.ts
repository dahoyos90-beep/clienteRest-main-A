import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { Post, CreatePost, UpdatePost, AsyncListState, ApiError } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/posts`;

  // ===========================
  // Estado Global con Tipado
  // ===========================
  private readonly _state = signal<AsyncListState<Post>>({
    data: [],
    loading: false,
    error: null
  });

  // Señales públicas para componentes
  readonly state = this._state.asReadonly();
  readonly posts = computed(() => this._state().data ?? []);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  // Filtros
  private readonly _searchTerm = signal('');
  private readonly _activeUserId = signal<number | null>(null);

  // ===========================
  // Computados
  // ===========================
  readonly filteredPosts = computed(() => {
    const term = this._searchTerm().trim().toLowerCase();
    const user = this._activeUserId();
    return this.posts().filter(post => {
      const matchesSearch = !term || post.title.toLowerCase().includes(term) || post.body.toLowerCase().includes(term);
      const matchesUser = user === null || post.userId === user;
      return matchesSearch && matchesUser;
    });
  });

  // ===========================
  // CRUD
  // ===========================
  getAll(): void {
    this.setLoading(true);
    this.http.get<Post[]>(this.apiUrl)
      .pipe(
        map(posts => posts.map(p => this.formatPost(p))),
        tap({
          next: data => this._state.set({ data, loading: false, error: null }),
          error: err => this.handleError('No fue posible cargar los posts.', err)
        })
      ).subscribe();
  }

  create(data: CreatePost): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, data).pipe(
      map(p => this.formatPost(p)),
      tap(post => this._state.update(s => ({ ...s, data: [post, ...(s.data || [])] }))),
      catchError(err => this.handleError('No fue posible crear el post.', err))
    );
  }

  update(id: number, data: UpdatePost): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, data).pipe(
      map(p => this.formatPost(p)),
      tap(updated => {
        this._state.update(s => ({
          ...s,
          data: s.data?.map(p => p.id === id ? updated : p) || []
        }));
      }),
      catchError(err => this.handleError(`No fue posible actualizar el post ${id}.`, err))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._state.update(s => ({ ...s, data: s.data?.filter(p => p.id !== id) || [] }));
      }),
      catchError(err => this.handleError(`No fue posible eliminar el post ${id}.`, err))
    );
  }

  // ===========================
  // Acciones UI (Filtrado)
  // ===========================
  setSearch(term: string): void {
    this._searchTerm.set(term);
  }

  setActiveUser(userId: number | null): void {
    this._activeUserId.set(userId);
  }

  clearSelected(): void {
    // Implementación opcional según necesidad
  }

  // ===========================
  // Helpers
  // ===========================
  private setLoading(loading: boolean): void {
    this._state.update(s => ({ ...s, loading }));
  }

  private handleError(message: string, err: any): Observable<never> {
    const error: ApiError = { status: err.status || 500, message };
    this._state.update(s => ({ ...s, loading: false, error }));
    return throwError(() => error);
  }

  private formatPost(post: Post): Post {
    return {
      ...post,
      title: post.title.charAt(0).toUpperCase() + post.title.slice(1).toLowerCase(),
      body: post.body.charAt(0).toUpperCase() + post.body.slice(1).toLowerCase()
    };
  }
}
