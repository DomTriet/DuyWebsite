import { Routes } from '@angular/router';
import { agentGuard } from './core/guards/agent.guard';
import { authGuard } from './core/guards/auth.guard';
import { themeResolver } from './themes/theme.resolver';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./auth/login.component').then(c => c.LoginComponent) },
      { path: 'register', loadComponent: () => import('./auth/register.component').then(c => c.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./auth/forgot-password.component').then(c => c.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./auth/reset-password.component').then(c => c.ResetPasswordComponent) },
      // Nếu người dùng chỉ gõ /auth, tự động đẩy về /auth/login
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    canActivate: [agentGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  // ==========================================
  // MODULE GUEST: TIN TỨC & CỘNG ĐỒNG
  // ==========================================
  {
    path: 'about',
    loadComponent: () => import('./guest/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./guest/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'blogs',
    loadComponent: () => import('./guest/blog-list.component').then(m => m.BlogListComponent)
  },
  {
    path: 'blogs/:slug',
    loadComponent: () => import('./guest/blog-detail.component').then(m => m.BlogDetailComponent)
  },
  {
    path: 'forum',
    loadComponent: () => import('./guest/forum-list.component').then(m => m.ForumListComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./guest/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'forum/create',
    canActivate: [authGuard], // Bất kỳ user nào đã đăng nhập đều được viết bài
    loadComponent: () => import('./guest/forum-create.component').then(m => m.ForumCreateComponent)
  },
  {
    path: 'forum/:id',
    loadComponent: () => import('./guest/forum-detail.component').then(m => m.ForumDetailComponent)
  },
  // ==========================================
  // MODULE THEME ENGINE: DỰ ÁN & BẤT ĐỘNG SẢN
  // ==========================================
  {
    path: 'project/:id',
    resolve: { theme: themeResolver },
    loadComponent: () => import('./themes/theme-container.component').then(m => m.ThemeContainerComponent)
  },
  {
    path: 'project/:id/property/:slug',
    resolve: { theme: themeResolver },
    loadComponent: () => import('./themes/theme-property-container.component').then(m => m.ThemePropertyContainerComponent)
  },
  // Global Home Page
  {
    path: '',
    loadComponent: () => import('./guest/home.component').then(m => m.HomeComponent),
    pathMatch: 'full'
  },
  { path: '**', redirectTo: '' }
];