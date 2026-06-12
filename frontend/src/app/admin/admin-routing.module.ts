import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { agentGuard } from '../core/guards/agent.guard';
import { adminGuard } from '../core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [agentGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'properties', loadComponent: () => import('./pages/properties-manage/properties-manage.component').then(m => m.PropertiesManageComponent) },
      { path: 'properties/create', loadComponent: () => import('./pages/properties-manage/property-form.component').then(m => m.PropertyFormComponent) },
      { path: 'properties/edit/:slug', loadComponent: () => import('./pages/properties-manage/property-form.component').then(m => m.PropertyFormComponent) },
      { path: 'account-settings', loadComponent: () => import('./pages/account-settings.component').then(m => m.AccountSettingsComponent) },
      { path: 'projects', loadComponent: () => import('./pages/categories-projects-manage.component').then(m => m.CategoriesProjectsManageComponent) },
      { path: 'projects/:id/builder', canActivate: [adminGuard], loadComponent: () => import('./pages/theme-builder.component').then(m => m.ThemeBuilderComponent) },
      { path: 'users', canActivate: [adminGuard], loadComponent: () => import('./pages/users-manage.component').then(m => m.UsersManageComponent) },
      { path: 'agent-requests', canActivate: [adminGuard], loadComponent: () => import('./pages/agent-requests.component').then(m => m.AgentRequestsComponent) },
      { path: 'leads', loadComponent: () => import('./pages/leads-manage.component').then(m => m.LeadsManageComponent) },
      { path: 'system-logs', canActivate: [adminGuard], loadComponent: () => import('./pages/system-logs.component').then(m => m.SystemLogsComponent) },
      { path: 'forum-approval', canActivate: [adminGuard], loadComponent: () => import('./pages/forum-approval.component').then(m => m.ForumApprovalComponent) },
      { path: 'translations-manage', canActivate: [adminGuard], loadComponent: () => import('./pages/translations-manage.component').then(m => m.TranslationsManageComponent) },
      { path: 'blogs-manage', loadComponent: () => import('./blogs-manage/blog-manage.component').then(m => m.BlogManageComponent) },
      { path: 'blogs-manage/create', loadComponent: () => import('./blogs-manage/blog-editor.component').then(m => m.BlogEditorComponent) },
      { path: 'blogs-manage/edit/:id', loadComponent: () => import('./blogs-manage/blog-editor.component').then(m => m.BlogEditorComponent) },
      { path: 'site-settings', canActivate: [adminGuard], loadComponent: () => import('./pages/site-settings.component').then(m => m.SiteSettingsComponent) },
      { path: 'homepage-banners', canActivate: [adminGuard], loadComponent: () => import('./pages/homepage-banners.component').then(m => m.HomepageBannersComponent) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }