import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-agent-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center">
      <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-50 mb-4 bg-gray-200">
        <img [src]="agentInfo?.avatar_url || 'https://ui-avatars.com/api/?name=' + (agentInfo?.full_name || 'Agent') + '&background=random'" 
             alt="Agent Avatar" 
             class="w-full h-full object-cover">
      </div>
      
      <h4 class="text-lg font-bold text-gray-800">{{ agentInfo?.full_name || ('AGENT_CARD.TITLE' | translate) }}</h4>
      <p class="text-sm text-gray-500 mb-4">{{ 'AGENT_CARD.SUBTITLE' | translate }}</p>
      
      <a *ngIf="agentInfo?.phone" [href]="'tel:' + agentInfo.phone" class="w-full py-2.5 px-4 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mb-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
        {{ 'AGENT_CARD.CALL_NOW' | translate }}: {{ agentInfo.phone }}
      </a>
      
      <a *ngIf="agentInfo?.email" [href]="'mailto:' + agentInfo.email" class="w-full py-2.5 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        {{ 'AGENT_CARD.SEND_EMAIL' | translate }}
      </a>
    </div>
  `
})
export class AgentCardComponent {
  @Input() agentInfo: any;
}