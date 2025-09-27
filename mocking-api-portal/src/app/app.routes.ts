import { Routes } from '@angular/router';
import { UserManagementComponent } from './components/user-management.component';

export const routes: Routes = [
  { path: '', redirectTo: '/users', pathMatch: 'full' },
  { path: 'users', component: UserManagementComponent },
  { path: '**', redirectTo: '/users' }
];
