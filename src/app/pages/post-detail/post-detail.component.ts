import { Component, inject, input, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Comment } from '../../models/post.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css',
})
export class PostDetailComponent implements OnInit {
  readonly id = input.required<string>();
  readonly service = inject(PostService);
  readonly comments = signal<Comment[]>([]);
  readonly commentsLoading = signal<boolean>(false);
  readonly commentsError = signal<string | null>(null);

  // Computed para obtener el post del estado
  readonly post = computed(() => {
    const postId = Number(this.id());
    return this.service.posts().find(p => p.id === postId) || null;
  });

  ngOnInit(): void {
    const postId = Number(this.id());
    if (!isNaN(postId)) {
      // Cargar el post si no está en el estado
      if (!this.post()) {
        this.service.getPost(postId);
      }
      // Cargar comentarios
      this.loadComments(postId);
    }
  }

  loadComments(postId: number): void {
    this.commentsLoading.set(true);
    this.commentsError.set(null);

    this.service.getComments(postId).subscribe({
      next: (comments: Comment[]) => {
        this.comments.set(comments);
        this.commentsLoading.set(false);
      },
      error: () => {
        this.commentsError.set('No se pudieron cargar los comentarios.');
        this.commentsLoading.set(false);
      }
    });
  }
}