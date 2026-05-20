import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-agent-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <!-- Avatar -->
      <div class="aspect-square overflow-hidden bg-gradient-to-br from-indigo-100 to-indigo-50">
        <img [src]="agentInfo?.avatar_url || 'https://ui-avatars.com/api/?name=' + (agentInfo?.full_name || 'Agent') + '&background=4f46e5&color=fff&bold=true'" 
             alt="Agent Avatar" 
             class="w-full h-full object-cover">
      </div>
      
      <!-- Info -->
      <div class="p-6 text-center">
        <h4 class="text-xl font-black text-gray-900 mb-1">{{ agentInfo?.full_name || ('AGENT_CARD.TITLE' | translate) }}</h4>
        <p class="text-sm text-gray-600 mb-6">Chuyên viên tư vấn</p>
        
        <!-- Actions -->
        <div class="space-y-2">
          <a *ngIf="agentInfo?.phone" [href]="'tel:' + agentInfo.phone" class="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            Gọi: {{ agentInfo.phone }}
          </a>
          
          <a *ngIf="agentInfo?.email" [href]="'mailto:' + agentInfo.email" class="w-full py-3 px-4 bg-gray-100 text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Email
          </a>
    foll    </div>
      </div>
    </div>
  `
})
export class AgentCardComponent {
  @Input() agentInfo: any;
}le 
