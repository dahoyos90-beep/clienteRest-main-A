import { Component, OnInit, inject, input, signal, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Comment } from '../../models/post.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-detail',
  imports: [RouterLink],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css',
})
export class PostDetailComponent {
  readonly id = input.required<string>();
  readonly service = inject(PostService);
  readonly comments = signal<Comment[]>([]);
  readonly commentsError = signal<string | null>(null);

  constructor() {
    effect(() => {
      const postId = Number(this.id());
      if (Number.isNaN(postId)) {
        return;
      }

      this.commentsError.set(null);
      this.service.getById(postId);
      this.service
        .getComments(postId)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: (comments: Comment[]) => this.comments.set(comments),
          error: () => this.commentsError.set('No se pudieron cargar los comentarios.'),
        });
    });
  }
}