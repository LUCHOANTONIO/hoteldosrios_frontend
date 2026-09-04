import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Directive({
  selector: '[appAnimarPerderFoco]',
  standalone: true
})
export class AnimarPerderFocoDirective implements OnInit {

  @Input() dialogRef!: MatDialogRef<any>; // Referencia al formulario reactivo
  constructor(private el: ElementRef, private renderer: Renderer2) {

  }

  ngOnInit(): void {
    this.dialogRef.backdropClick().subscribe(x => {
      //this.dialogRef.addPanelClass("temblor");
      let d = <HTMLElement>(document.getElementsByClassName("mat-mdc-dialog-panel")[0]);
      //let d:HTMLElement=document.getElementById("modalnuevo");
      d.style.transition = 'transform 0.25s ease';
      //d.style.transform = ' scale(1.1) rotate(360deg)';
      d.style.transform =d.style.transform+ ' scale(1.02)';
      //renderer.addClass(d,"temblor");
      setTimeout(() => {
        d.style.transform = d.style.transform.toString().replace('scale(1.02)','');
      }, 250);
      setTimeout(() => {
        d.style.transition="";
      }, 500);

    })
  }
  // @HostListener('focusout')
  // onBlur() {
  //  let d = <HTMLElement>(document.getElementsByClassName("mat-mdc-dialog-panel")[0]);
  //  //let d:HTMLElement=document.getElementById("modalnuevo");
  //  d.style.transition = 'transform 0.25s ease';
  //  //d.style.transform = ' scale(1.1) rotate(360deg)';
  //  d.style.transform =d.style.transform+ ' scale(1.02)';
  //  //renderer.addClass(d,"temblor");

  //  setTimeout(() => {
  //    d.style.transform = d.style.transform.toString().replace('scale(1.02)','');
  //  }, 250);
  //  setTimeout(() => {
  //    d.style.transition="";
  //  }, 500);
  // }

}
