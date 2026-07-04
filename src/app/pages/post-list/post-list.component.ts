import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PostCardComponent } from '../../components/post-card/post-card.component';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [PostCardComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.css',
})
export class PostListComponent implements OnInit {
  // Inyección del servicio
  readonly service = inject(PostService);

  // Controles del formulario
  readonly searchCtrl = new FormControl('', { nonNullable: true });
  readonly userFilterCtrl = new FormControl('all', { nonNullable: true });

  // Paginación
  readonly pageSize = 9;
  readonly currentPage = signal(1);

  // Computados basados en el servicio
  private readonly filteredList = this.service.filteredPosts;

  readonly totalPages = computed(() => 
    Math.max(1, Math.ceil(this.filteredList().length / this.pageSize))
  );

  readonly paginatedPosts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredList().slice(start, start + this.pageSize);
  });

  // Efecto para ajustar la página si el filtro reduce el contenido
  private readonly syncPaginationEffect = effect(() => {
    const total = this.totalPages();
    if (this.currentPage() > total) {
      this.currentPage.set(total);
    }
  });

  ngOnInit(): void {
    // Inicialización
    this.service.getAll();

    // Suscripciones a cambios de filtros
    this.searchCtrl.valueChanges.subscribe((term) => {
      this.service.setSearch(term);
      this.currentPage.set(1);
    });

    this.userFilterCtrl.valueChanges.subscribe((val) => {
      this.service.setActiveUser(val === 'all' ? null : Number(val));
      this.currentPage.set(1);
    });
  }

  // Acciones
  deletePost(id: number): void {
    if (confirm(`¿Estás seguro de eliminar el post ${id}?`)) {
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