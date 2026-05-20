import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-white overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar class="w-64 flex-shrink-0 hidden md:flex"></app-sidebar>
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-header></app-header>
        
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {}
