import { Directive, HostListener, Renderer2, ElementRef, Injectable, OnInit, OnDestroy, Input } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

@Directive({
  selector: '[appBotonGuardar]',
  standalone: true
})
export class BotonGuardarDirective implements OnInit {

  @Input() form: any; // Referencia al formulario reactivo
  spinner:any;
  constructor(private el: ElementRef, private renderer: Renderer2) {

  }

  ngOnInit(): void {
    this.spinner = this.el.nativeElement.querySelector('mat-icon');   
  }

  deshabilitarFormBoton(){
    this.renderer.addClass(this.el.nativeElement, "opacity-75");
    this.renderer.setAttribute(this.el.nativeElement, "disabled", "true");
    this.renderer.removeClass(this.spinner, 'd-none');   
    this.form.form.disable();
  }

  habilitarFormBoton(){
    this.renderer.removeClass(this.el.nativeElement, "opacity-75");
    this.renderer.removeAttribute(this.el.nativeElement, "disabled");
    this.renderer.addClass(this.spinner, 'd-none');   
    this.form.form.enable();
  }

}

