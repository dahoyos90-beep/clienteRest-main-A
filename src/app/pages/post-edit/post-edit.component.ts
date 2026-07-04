import { Component, OnInit, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { PostFormComponent } from '../../components/post-form/post-form.component';
import { CreatePost } from '../../models/post.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [CommonModule, PostFormComponent, RouterLink],
  templateUrl: './post-edit.component.html',
  styleUrl: './post-edit.component.css',
})
export class PostEditComponent implements OnInit {
  readonly id = input.required<string>();

  readonly service = inject(PostService);
  readonly router = inject(Router);

  // Computed para obtener el post del estado
  readonly post = computed(() => {
    const postId = Number(this.id());
    return this.service.posts().find(p => p.id === postId) || null;
  });

  ngOnInit(): void {
    const postId = Number(this.id());
    if (!isNaN(postId)) {
      // Si el post no está en el estado, cargarlo
      if (!this.post()) {
        this.service.getPost(postId);
      }
    }
  }

  onUpdate(data: CreatePost): void {
    const postId = Number(this.id());
    if (!isNaN(postId)) {
      this.service.update(postId, data).subscribe({
        next: () => this.router.navigate(['/posts', postId]),
        error: () => alert('Error al actualizar el post. Intenta nuevamente.')
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/posts', this.id()]);
  }
}