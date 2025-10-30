import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Support } from './features/support/support';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'support',
    component: Support,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
