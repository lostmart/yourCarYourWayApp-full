import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Support } from './features/support/support';
import { AsyncContact } from './features/support/async-contact/async-contact';
import { SyncContact } from './features/support/sync-contact/sync-contact';
import { Faq } from './features/support/faq/faq';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'support',
    component: Support,
    children: [
      { path: 'async', component: AsyncContact },
      { path: 'sync', component: SyncContact },
      { path: 'faq', component: Faq },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
