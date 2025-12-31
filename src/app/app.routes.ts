import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'cashback',
    loadComponent: () => import('./cashback/cashback.page').then((m) => m.CashbackPage),
  },
  {
    path: '',
    redirectTo: 'cashback',
    pathMatch: 'full',
  },
];
