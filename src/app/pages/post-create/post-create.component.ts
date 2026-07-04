import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { PostFormComponent } from '../../components/post-form/post-form.component';
import { CreatePost } from '../../models/post.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-create',
  imports: [PostFormComponent, RouterLink],
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.css',
})
export class PostCreateComponent {
  private readonly postService = inject(PostService);
  readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  onCreate(data: CreatePost): void {
    this.submitting.set(true);
    this.error.set(null);

    this.postService.create(data).subscribe({
      next: () => this.router.navigate(['/posts']),
      error: () => {
        this.submitting.set(false);
        this.error.set('No se pudo crear la publicación. Intenta de nuevo.');
      },
    });
  }
}