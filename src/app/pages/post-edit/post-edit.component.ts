import { Component, OnInit, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { PostFormComponent } from '../../components/post-form/post-form.component';
import { CreatePost } from '../../models/post.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-edit',
  imports: [PostFormComponent, RouterLink],
  templateUrl: './post-edit.component.html',
  styleUrl: './post-edit.component.css',
})
export class PostEditComponent implements OnInit {
  readonly id = input.required<string>();

  readonly service = inject(PostService);
  readonly router = inject(Router);

  ngOnInit(): void {
    const postId = Number(this.id());
    // Validamos que el ID sea un número antes de llamar al servicio
    if (!isNaN(postId)) {
      this.service.getById(postId);
    }
  }

  onUpdate(data: CreatePost): void {
    const postId = Number(this.id());
    if (!isNaN(postId)) {
      this.service.update(postId, data).subscribe(() => this.router.navigate(['/posts', postId]));
    }
  }
}