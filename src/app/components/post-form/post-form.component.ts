import { Component, OnInit, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreatePost, Post } from '../../models/post.model';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.css',
})
export class PostFormComponent implements OnInit {
  readonly initialData = input<Post | null>(null);
  readonly disabled = input<boolean>(false);
  readonly formSubmit = output<CreatePost>();
  readonly onCancel = output<void>();

  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(90)]],
    body: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    userId: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  ngOnInit(): void {
    const data = this.initialData();
    if (data) {
      this.form.patchValue({
        title: data.title,
        body: data.body,
        userId: data.userId,
      });
    }
  }

  // Método seguro para obtener el contador de caracteres
  getTitleLength(): number {
    return this.form.controls.title.value?.length || 0;
  }

  getBodyLength(): number {
    return this.form.controls.body.value?.length || 0;
  }

  onSubmit(): void {
    if (this.form.invalid || this.disabled()) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.form.getRawValue());
  }
}