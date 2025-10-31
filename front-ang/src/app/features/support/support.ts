import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [
    RouterLink, // Required for routerLink
    RouterLinkActive, // Required for routerLinkActive
    RouterOutlet, // Required for <router-outlet>
  ],
  templateUrl: './support.html',
  styleUrls: ['./support.scss'],
})
export class Support {}
