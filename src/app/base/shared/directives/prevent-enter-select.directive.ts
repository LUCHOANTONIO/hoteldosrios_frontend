import { Directive, HostListener } from '@angular/core';
import { MatSelect } from '@angular/material/select';

@Directive({
  selector: '[appPreventEnterSelect]',
  standalone: true
})
export class PreventEnterSelectDirective {
  constructor(private matSelect: MatSelect) {}
  
  @HostListener('keydown', ['$event'])
  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.matSelect.panelOpen) {
      this.matSelect.close();
    }
  }
}
