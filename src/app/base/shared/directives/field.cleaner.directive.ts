import { Directive, ElementRef, Renderer2, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[fieldCleaner]',
  standalone: true
})
export class FieldCleanerDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private control = inject(NgControl, { optional: true });
  private renderer = inject(Renderer2);
  
  private button?: HTMLButtonElement;
  private sub?: Subscription;

  ngAfterViewInit() {
    if (!this.control) return;

    // Aseguramos que cuando inyectemos el padding, el input no se ensanche
    //this.renderer.setStyle(this.el.nativeElement, 'box-sizing', 'border-box', 2);

    // 1. CREACIÓN DEL BOTÓN FANTASMA
    this.button = this.renderer.createElement('button');
    this.renderer.setAttribute(this.button!, 'type', 'button');
    this.button!.innerHTML = '<span class="material-icons">close</span>';

    // 2. POSICIONAMIENTO Y ESTILOS
    Object.assign(this.button!.style, {
      position: 'absolute',
      right:'0px', // Deja espacio a las flechas si es número
      top: '50%',
      transform: 'translateY(-50%)',
      width: '30px',
      height: '30px',
      border: 'none',
      background: 'transparent',
      color: 'gray',
      cursor: 'pointer',
      borderRadius: '50%',
      display: 'none', // Oculto de inicio
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '10'
    });

    // Simular el Ripple/Hover
    this.renderer.listen(this.button!, 'mouseenter', () => {
      this.renderer.setStyle(this.button!, 'background-color', 'rgba(0,0,0,0.08)');
    });
    this.renderer.listen(this.button!, 'mouseleave', () => {
      this.renderer.setStyle(this.button!, 'background-color', 'transparent');
    });

    // 3. INSERCIÓN EN EL CONTENEDOR PADRE
    const parent = this.el.nativeElement.parentElement;
    this.renderer.setStyle(parent, 'position', 'relative');
    this.renderer.appendChild(parent, this.button!);

    // 4. LA MAGIA: VISIBILIDAD Y ESPACIO DINÁMICO
    const update = (val: any) => {
      const hasValue = val !== null && val !== undefined && val !== '';

      // Mostramos u ocultamos la "X"
      this.renderer.setStyle(this.button!, 'display', hasValue ? 'flex' : 'none');

      // RESERVAMOS EL ESPACIO SOLO SI HAY TEXTO
      if (hasValue) {
        // Empujamos el límite del texto para que no tape el botón
        this.renderer.setStyle(this.el.nativeElement, 'padding-right', '30px', 2);
      } else {
        // Si está vacío, quitamos nuestro estilo para que vuelva a su estado 100% natural
        this.renderer.removeStyle(this.el.nativeElement, 'padding-right');
      }
    };

    // Leer el valor inicial y suscribirse a los cambios
    setTimeout(() => update(this.control?.value));
    this.sub = this.control?.valueChanges?.subscribe(update);

    // 5. ACCIÓN DE LIMPIAR
    this.renderer.listen(this.button!, 'click', (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      this.control?.control?.setValue(undefined);
      this.control?.control?.markAsDirty();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.button?.remove();
  }
}