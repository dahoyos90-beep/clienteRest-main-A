import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { PostService } from './post.service';
import { Post } from '../models/post.model';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;

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

  it('should update a post and keep the edited content in local state', () => {
    const apiPosts: Post[] = [
      { id: 1, userId: 1, title: 'primer titulo', body: 'primer cuerpo original' },
      { id: 2, userId: 2, title: 'segundo titulo', body: 'segundo cuerpo original' },
    ];

    // 1. Cargar datos iniciales
    service.getAll();
    httpMock.expectOne('https://jsonplaceholder.typicode.com/posts').flush(apiPosts);

    // 2. Definir datos de actualización
    const updatePayload = {
      title: 'Resumen semanal del equipo',
      body: 'Contenido ajustado para validar la edicion del formulario en la interfaz.',
      userId: 3,
    };

    // 3. Ejecutar actualización
    service.update(1, updatePayload).subscribe((updatedPost) => {
      expect(updatedPost.title).toBe(updatePayload.title);
    });

    // 4. Resolver la petición HTTP de actualización
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/1');
    expect(req.request.method).toBe('PUT'); // Verificamos que sea un PUT
    req.flush({ id: 1, ...updatePayload });

    // 5. Verificación del estado local (Signal)
    const postInState = service.posts().find(p => p.id === 1);
    expect(postInState?.title).toBe(updatePayload.title);
    expect(postInState?.body).toBe(updatePayload.body);
    expect(postInState?.userId).toBe(3);
  });
});