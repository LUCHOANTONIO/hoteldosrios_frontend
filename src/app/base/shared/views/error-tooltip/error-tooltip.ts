import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-error-tooltip',
  standalone: true,
  imports: [],
  providers: [],
  
  templateUrl: './error-tooltip.html',
  styleUrl: './error-tooltip.scss'
})
export class ErrorTooltipComponent {
  @Input() mensaje: string = '';
  @Input() posicion: 'above' | 'below' = 'below';
}