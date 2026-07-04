import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-card',
  imports: [RouterLink, SlicePipe],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCardComponent {
  private readonly EXCERPT_LIMIT = 148;

  readonly post = input.required<Post>();
  readonly onDelete = output<number>();

  readonly isTruncated = computed(() => this.post().body.length > this.EXCERPT_LIMIT);
  readonly excerptLimit = this.EXCERPT_LIMIT;

  handleDelete(event: Event): void {
    event.stopPropagation();
    this.onDelete.emit(this.post().id);
  }
}