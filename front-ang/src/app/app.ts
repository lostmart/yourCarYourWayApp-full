import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header'; // Adjust path as needed

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header], // Added Header to imports
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected readonly title = signal('front');
}
