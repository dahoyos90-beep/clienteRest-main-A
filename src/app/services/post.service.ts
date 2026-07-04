import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { Post, CreatePost, UpdatePost, AsyncListState, ApiError, Comment } from '../models/post.model';

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

  // Opciones de usuarios para el filtro
  readonly userOptions = computed(() => {
    const users = new Set(this.posts().map(p => p.userId));
    return Array.from(users).sort();
  });

  // ===========================
  // CRUD
  // ===========================
  getAll(): void {
    this.setLoading(true);

    // 📌 DATOS DE PRUEBA EN ESPAÑOL
    const mockPosts: Post[] = [
      {
        id: 1,
        userId: 1,
        title: 'Bienvenido al Panel Editorial',
        body: 'Esta es una publicación de ejemplo en español. Puedes editar el contenido desde el servicio para personalizarlo.'
      },
      {
        id: 2,
        userId: 1,
        title: 'Consejos para una buena redacción',
        body: 'Asegúrate de que tus publicaciones sean claras y concisas. Usa párrafos cortos y lenguaje sencillo para conectar con tu audiencia.'
      },
      {
        id: 3,
        userId: 2,
        title: 'Cómo organizar tu biblioteca de contenido',
        body: 'Mantén un flujo editorial ordenado. Clasifica tus publicaciones por temas, fechas y responsables para facilitar la gestión.'
      },
      {
        id: 4,
        userId: 2,
        title: 'La importancia de los comentarios',
        body: 'Los comentarios enriquecen tus publicaciones. Fomenta la participación de los usuarios y responde a sus dudas.'
      },
      {
        id: 5,
        userId: 3,
        title: 'Diseño de interfaz para gestores de contenido',
        body: 'Una interfaz clara y atractiva mejora la experiencia de los editores. Usa colores que transmitan profesionalismo y confianza.'
      },
      {
        id: 6,
        userId: 3,
        title: 'Estrategias para aumentar la visibilidad',
        body: 'Comparte tus publicaciones en redes sociales y utiliza palabras clave relevantes para mejorar el posicionamiento.'
      },
      {
        id: 7,
        userId: 4,
        title: 'Cómo medir el impacto de tu contenido',
        body: 'Utiliza métricas como visitas, tiempo de lectura y comentarios para evaluar el rendimiento de tus publicaciones.'
      },
      {
        id: 8,
        userId: 4,
        title: 'Guía para crear títulos atractivos',
        body: 'Un buen título capta la atención. Usa preguntas, números y promesas para generar interés en tus lectores.'
      },
      {
        id: 9,
        userId: 5,
        title: 'La importancia de la edición y corrección',
        body: 'Revisa siempre tus textos antes de publicar. Una buena edición mejora la credibilidad y la calidad del contenido.'
      },
      {
        id: 10,
        userId: 5,
        title: 'Tendencias en gestión de contenido para 2024',
        body: 'La automatización, la inteligencia artificial y el contenido interactivo marcarán la pauta en la gestión de contenidos.'
      }
    ];

    // Simular una llamada asíncrona
    setTimeout(() => {
      this._state.set({ data: mockPosts, loading: false, error: null });
    }, 500);

    /* 🔄 CÓDIGO ORIGINAL (API) - Comentado
    this.http.get<Post[]>(this.apiUrl)
      .pipe(
        map(posts => posts.map(p => this.formatPost(p))),
        tap({
          next: data => this._state.set({ data, loading: false, error: null }),
          error: err => this.handleError('No fue posible cargar los posts.', err)
        })
      ).subscribe();
    */
  }

  getPost(id: number): void {
    this.setLoading(true);
    this.http.get<Post>(`${this.apiUrl}/${id}`)
      .pipe(
        map(p => this.formatPost(p)),
        tap({
          next: post => {
            this._state.update(s => ({
              ...s,
              data: s.data?.map(p => p.id === id ? post : p) || [post],
              loading: false,
              error: null
            }));
          },
          error: err => this.handleError(`No fue posible cargar el post ${id}.`, err)
        })
      ).subscribe();
  }

  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${postId}/comments`).pipe(
      catchError(err => {
        const error: ApiError = { 
          status: err.status || 500, 
          message: 'No se pudieron cargar los comentarios.' 
        };
        return throwError(() => error);
      })
    );
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