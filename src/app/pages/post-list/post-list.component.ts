import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // 👈 AGREGAR ESTA LÍNEA

import { PostCardComponent } from '../../components/post-card/post-card.component';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule, // 👈 AGREGAR AQUÍ
    PostCardComponent, 
    ReactiveFormsModule, 
    RouterLink
  ],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.css',
})
export class PostListComponent implements OnInit {
  readonly service = inject(PostService);

  readonly searchCtrl = new FormControl('', { nonNullable: true });
  readonly userFilterCtrl = new FormControl('all', { nonNullable: true });

  readonly pageSize = 9;
  readonly currentPage = signal(1);

  // AHORA ES PÚBLICO
  readonly filteredList = this.service.filteredPosts;

  readonly totalPages = computed(() => 
    Math.max(1, Math.ceil(this.filteredList().length / this.pageSize))
  );

  readonly paginatedPosts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredList().slice(start, start + this.pageSize);
  });

  readonly visibleRange = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, this.filteredList().length);
    return { start, end };
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    
    return pages;
  });

  private readonly syncPaginationEffect = effect(() => {
    const total = this.totalPages();
    if (this.currentPage() > total) {
      this.currentPage.set(total);
    }
  });

  ngOnInit(): void {
    this.service.getAll();

    this.searchCtrl.valueChanges.subscribe((term) => {
      this.service.setSearch(term);
      this.currentPage.set(1);
    });

    this.userFilterCtrl.valueChanges.subscribe((val) => {
      this.service.setActiveUser(val === 'all' ? null : Number(val));
      this.currentPage.set(1);
    });
  }

  deletePost(id: number): void {
    if (confirm(`¿Estás seguro de eliminar el post ${id}?`)) {
      this.service.delete(id).subscribe({
        error: () => alert('Error al eliminar el post. Intenta nuevamente.')
      });
    }
  }

  goToPage(page: number): void {
    const safePage = Math.min(Math.max(page, 1), this.totalPages());
    this.currentPage.set(safePage);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }
}