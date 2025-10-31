import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon: 'question' | 'chat';
  isHighlighted?: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrls: ['./faq.scss'],
})
export class Faq {
  faqs: FAQItem[] = [
    {
      id: 1,
      question: 'How to create an account?',
      answer:
        'To create an account, visit our sign-up page, enter your details, and follow the prompts to complete the registration process.',
      icon: 'question',
      isHighlighted: true,
    },
    {
      id: 2,
      question: 'Have any trust issue?',
      answer:
        "If you have trust issues or concerns, contact our support team, and we'll assist you promptly to address any questions or doubts.",
      icon: 'question',
    },
    {
      id: 3,
      question: 'How do I delete my account?',
      answer:
        'To change your email address, go to account settings, select "Edit Profile," and update your email information.',
      icon: 'question',
    },
    {
      id: 4,
      question: 'What is the payment process?',
      answer:
        'The payment process involves selecting a payment method, entering your details, and confirming the transaction.',
      icon: 'question',
    },
    {
      id: 5,
      question: 'How can I reset my password?',
      answer:
        'To reset your password, click the "Forgot Password" link on the login page and follow the instructions sent to your email.',
      icon: 'question',
    },
    {
      id: 6,
      question: 'Need Help?',
      answer:
        "Let us know how we can assist! We're here to ensure you get the help and support you need.",
      icon: 'chat',
    },
  ];
}
