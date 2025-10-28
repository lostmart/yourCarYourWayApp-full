import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink], // Added RouterLink import
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  isMobileMenuOpen = false;
  isMenuOpen = false;
  isLoggedIn = false;
  userName = 'John Doe';
  userAvatar = 'https://example.com/avatar.jpg';

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    // Perform logout logic here
    this.isLoggedIn = false;
    this.isMenuOpen = false;
  }
}
