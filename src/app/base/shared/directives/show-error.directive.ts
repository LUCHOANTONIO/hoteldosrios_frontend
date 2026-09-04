import {  Directive,  Input,  inject,  OnInit,  OnDestroy,  DestroyRef,
          ElementRef,  ViewContainerRef,  ApplicationRef } from '@angular/core';
import { NgControl, FormGroupDirective, NgForm } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';

import { ErrorTooltipComponent } from './../views/error-tooltip/error-tooltip';

// Diccionario centralizado de mensajes de error
const DICCIONARIO_ERRORES: Record<string, (err: any) => string> = {
  required: () => 'Este campo es obligatorio',
  requiredTrue: () => 'Aceptación requerida',
  email: () => 'Correo no válido',
  min: (err) => `Valor mínimo: ${err.min}`,
  max: (err) => `Valor máximo: ${err.max}`,
  minlength: (err) => `Mínimo ${err.requiredLength} caracteres`,
  maxlength: (err) => `Máximo ${err.requiredLength} caracteres`,
  customError: (err) => typeof err === 'string' ? err : err?.mensaje || 'Campo inválido'
};

@Directive({
  selector: `
    input[ngModel], input[formControl], input[formControlName],
    mat-select[ngModel], mat-select[formControl], mat-select[formControlName],
    textarea[ngModel], textarea[formControl], textarea[formControlName],
    [showError]
  `,
  standalone: true
})
export class ShowErrorDirective implements OnInit, OnDestroy {
  @Input() showError: boolean | '' = true;
  @Input() noShowError: boolean | '' = false;

  // 🎯 Posición deseada del tooltip ('below' por defecto)
  @Input() errorPosition: 'above' | 'below' = 'below';

  private control = inject(NgControl, { self: true, optional: true }) 
                 || inject(NgControl, { optional: true });

  private elRef = inject(ElementRef);
  private viewContainerRef = inject(ViewContainerRef);
  private appRef = inject(ApplicationRef);
  private ngForm = inject(NgForm, { optional: true });
  private formGroup = inject(FormGroupDirective, { optional: true });
  private destroyRef = inject(DestroyRef);

  private portalOutlet: DomPortalOutlet | null = null;
  private tooltipComp: ErrorTooltipComponent | null = null;
  private hostContainer: HTMLDivElement | null = null;
  
  private targetParentEl: HTMLElement | null = null;
  private originalMarginTop: string = '';
  private originalMarginBottom: string = '';

  ngOnInit(): void {
    if (!this.control) return;

    this.control.statusChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.evaluarEstado());
    this.control.valueChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.evaluarEstado());

    const parentForm = this.ngForm || this.formGroup;
    if (parentForm) {
      parentForm.ngSubmit?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.evaluarEstado());
    }
  }

  ngOnDestroy(): void {
    this.destruirTooltip();
  }

  public evaluarEstado(): void {
    if (this.showError === false || this.noShowError !== false) {
      this.destruirTooltip();
      return;
    }

    const ctrl = this.control?.control;
    const parentForm = this.ngForm || this.formGroup;
    const fueEnviado = parentForm ? parentForm.submitted : false;

    if (ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty || fueEnviado)) {
      this.mostrarTooltip(ctrl.errors);
    } else {
      this.destruirTooltip();
    }
  }

  private mostrarTooltip(errors: any): void {
    if (!errors) return;

    const primerClave = Object.keys(errors)[0];
    const obtenerMensaje = DICCIONARIO_ERRORES[primerClave];
    const textoMensaje = obtenerMensaje ? obtenerMensaje(errors[primerClave]) : 'Campo inválido';

    if (!this.portalOutlet) {
      const nativeEl = this.elRef.nativeElement as HTMLElement;
      const parentEl = (nativeEl.closest('mat-form-field') || nativeEl.parentElement) as HTMLElement;

      if (!parentEl) return;
      this.targetParentEl = parentEl;

      // 💡 1. Aseguramos posición relativa en el padre
      if (window.getComputedStyle(parentEl).position === 'static') {
        parentEl.style.position = 'relative';
      }

      // 💡 2 Posicionamiento del contenedor host en el DOM
      this.hostContainer = document.createElement('div');
      this.hostContainer.style.position = 'absolute';
      
      this.hostContainer.style.zIndex = '10';
      this.hostContainer.style.pointerEvents = 'none';

      if (this.errorPosition === 'above') {
        this.hostContainer.style.right = '12px';
        this.hostContainer.style.top = '-4px';
        this.hostContainer.style.bottom = 'auto';
      } else {
        // 🌟 Alineado al borde inferior del campo (sube para asentarse exactamente sobre el borde)
        this.hostContainer.style.left = '12px';
        this.hostContainer.style.top = 'auto';
        this.hostContainer.style.bottom = '4px'; 
      }

      parentEl.appendChild(this.hostContainer);

      this.portalOutlet = new DomPortalOutlet(
        this.hostContainer,
        this.appRef
      );

      const portal = new ComponentPortal(
        ErrorTooltipComponent, 
        this.viewContainerRef
      );
      
      const compRef = this.portalOutlet.attach(portal);
      this.tooltipComp = compRef.instance;
    }

    // 🎯 3. Sincronizamos las propiedades con tu componente
    if (this.tooltipComp) {
      this.tooltipComp.mensaje = textoMensaje;
      this.tooltipComp.posicion = this.errorPosition; // Pasa 'above' o 'below'
    }
  }

  private destruirTooltip(): void {
    if (this.portalOutlet) {
      this.portalOutlet.dispose();
      this.portalOutlet = null;
    }

    if (this.hostContainer) {
      this.hostContainer.remove();
      this.hostContainer = null;
    }

    if (this.targetParentEl) {
      if (this.originalMarginTop) {
        this.targetParentEl.style.marginTop = this.originalMarginTop;
      }
      if (this.originalMarginBottom) {
        this.targetParentEl.style.marginBottom = this.originalMarginBottom;
      }
      this.targetParentEl = null;
    }

    this.tooltipComp = null;
  }
}