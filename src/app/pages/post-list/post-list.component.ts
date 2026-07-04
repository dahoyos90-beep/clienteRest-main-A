import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PostCardComponent } from '../../components/post-card/post-card.component';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-list',
  imports: [PostCardComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.css',
})
export class PostListComponent implements OnInit {
  readonly service = inject(PostService);

  readonly searchCtrl = new FormControl('', { nonNullable: true });
  readonly userFilterCtrl = new FormControl('all', { nonNullable: true });
  readonly pageSize = 9;
  readonly currentPage = signal(1);
  
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.service.filteredCount() / this.pageSize)));
  
  readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));
  
  readonly paginatedPosts = computed(() => {
    const currentPage = this.currentPage();
    const start = (currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.service.filteredPosts().slice(start, end);
  });

  readonly visibleRange = computed(() => {
    const filteredCount = this.service.filteredCount();
    if (filteredCount === 0) return { start: 0, end: 0 };
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, filteredCount);
    return { start, end };
  });

  // Corregido: se asegura de que el efecto no dependa de variables que puedan causar bucles
  private readonly syncPaginationEffect = effect(() => {
    const totalPages = this.totalPages();
    if (this.currentPage() > totalPages) {
      this.currentPage.set(totalPages);
    }
  });

  ngOnInit(): void {
    this.service.clearSelected();
    this.service.getAll();

    this.searchCtrl.valueChanges.subscribe((term) => {
      this.service.setSearch(term);
      this.currentPage.set(1);
    });

    this.userFilterCtrl.valueChanges.subscribe((userId) => {
      this.service.setActiveUser(userId === 'all' ? null : Number(userId));
      this.currentPage.set(1);
    });
  }

  deletePost(id: number): void {
    if (confirm(`¿Eliminar el post ${id}? Esta acción solo se reflejará en el estado local.`)) {
      this.service.delete(id).subscribe();
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