import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-async-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './async-contact.html',
  styleUrl: './async-contact.scss',
})
export class AsyncContact implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      company: [''],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue],
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      console.log('Form submitted:', this.contactForm.value);

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        alert('Message sent successfully!');
        this.contactForm.reset();
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach((key) => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }
}
