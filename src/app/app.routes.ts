import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'posts',
    pathMatch: 'full',
  },
  {
    path: 'posts',
    loadComponent: () => import('./pages/post-list/post-list.component').then((m) => m.PostListComponent),
    title: 'PostManager | Dashboard',
  },
  {
    path: 'posts/new',
    loadComponent: () => import('./pages/post-create/post-create.component').then((m) => m.PostCreateComponent),
    title: 'PostManager | Nuevo Post',
  },
  {
    path: 'posts/:id',
    loadComponent: () => import('./pages/post-detail/post-detail.component').then((m) => m.PostDetailComponent),
    title: 'PostManager | Detalle',
  },
  {
    path: 'posts/:id/edit',
    loadComponent: () => import('./pages/post-edit/post-edit.component').then((m) => m.PostEditComponent),
    title: 'PostManager | Editar',
  },
  {
    path: '**',
    redirectTo: 'posts',
  },
];