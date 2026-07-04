import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PostService } from './post.service';
import { Post } from '../models/post.model';
import { environment } from '../../environments/environment';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/posts`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PostService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should update a post and update the state correctly', () => {
    const apiPosts: Post[] = [
      { id: 1, userId: 1, title: 'Titulo 1', body: 'Cuerpo 1' },
      { id: 2, userId: 2, title: 'Titulo 2', body: 'Cuerpo 2' },
    ];

    // 1. Cargar datos iniciales
    service.getAll();
    httpMock.expectOne(`${apiUrl}`).flush(apiPosts);

    // 2. Definir actualización
    const updatePayload = { title: 'Nuevo Titulo', body: 'Nuevo Cuerpo', userId: 1 };

    // 3. Ejecutar actualización
    service.update(1, updatePayload).subscribe();

    // 4. Resolver HTTP
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 1, ...updatePayload });

    // 5. Verificación del estado
    const postInState = service.posts().find(p => p.id === 1);
    expect(postInState?.title).toBe('Nuevo titulo');
    expect(postInState?.body).toBe('Nuevo cuerpo');
  });

  it('should handle API errors and update error state', () => {
    service.getAll();
    const req = httpMock.expectOne(`${apiUrl}`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(service.error()).not.toBeNull();
    expect(service.error()?.status).toBe(500);
  });

  // Test adicional para getPost
  it('should get a single post by id', () => {
    const mockPost: Post = { id: 1, userId: 1, title: 'Test Post', body: 'Test Body' };

    service.getPost(1);
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPost);

    expect(service.posts().find(p => p.id === 1)).toBeTruthy();
  });

  // Test adicional para getComments
  it('should get comments for a post', () => {
    const mockComments = [
      { id: 1, postId: 1, name: 'Comment 1', email: 'test@test.com', body: 'Test body' }
    ];

    service.getComments(1).subscribe(comments => {
      expect(comments).toEqual(mockComments);
    });

    const req = httpMock.expectOne(`${apiUrl}/1/comments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockComments);
  });
});