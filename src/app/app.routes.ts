// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/auth/register/register.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { DashboardComponent } from './pages/user/dashboard/dashboard.component';
import { TransactionsComponent } from './pages/user/transactions/transactions.component';
import { BudgetsComponent } from './pages/user/budgets/budgets.component';
import { LayoutComponent } from './shared/components/layout/layoutcomponent';
import { CategoriesComponent } from './pages/user/categories/categories.component';


export const routes: Routes = [


  { path: 'login',           component: LoginComponent },
  { path: 'register',        component: RegisterComponent },
  { path: 'reset-password',  component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  {
    path: 'user',
    component: LayoutComponent,
    children: [
      { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    component: DashboardComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'budgets',      component: BudgetsComponent },
      { path: 'categories', component:CategoriesComponent}
    ]
  },

 
  { path: '',   redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];