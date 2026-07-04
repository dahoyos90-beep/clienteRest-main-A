import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive], // 👈 UN SOLO imports
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}