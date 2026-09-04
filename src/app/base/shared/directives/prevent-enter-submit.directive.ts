// prevent-enter-submit.directive.ts
import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appPreventEnterSubmit]',
  standalone: true
})
export class PreventEnterSubmitDirective {
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
        event.preventDefault(); 
    }    
  }
}
