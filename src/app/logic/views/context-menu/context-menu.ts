import { Component, inject, Input, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { GrupoFormComponent } from '../timeline/grupo-form/grupo-form';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.html',
  styleUrls: [],
  standalone: true,
  imports: [
    MatMenuModule,
    MatButtonModule
  ]
})
export class ContextMenuComponent {
  @ViewChild('trigger') trigger!: MatMenuTrigger;
  @Input() items!:any;
  @Input() selectedItems: any[] = [];
  
  readonly dialog = inject(MatDialog);
  
  menuTop = '0px';
  menuLeft = '0px';
  OFFSET_MENU = 40;//Posicion del boton hacia abajo, antes salia con spacio 
  
  show(event: MouseEvent, itemId: any): void {
    event.preventDefault();
    const contentEl = document.querySelector(`[data-id='${itemId}']`);
    const targetEl = contentEl?.closest('.vis-item') as HTMLElement;

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();

      // Posicionar debajo y centrado horizontalmente
      this.menuTop = `${rect.bottom-this.OFFSET_MENU + window.scrollY}px`; 
      this.menuLeft = `${rect.left + rect.width / 2 + window.scrollX}px`;
    } else {
      // Fallback a posición del cursor
      this.menuTop = `${event.clientY + window.scrollY}px`;
      this.menuLeft = `${event.clientX + window.scrollX}px`;
    }

    // Abrir menú después de actualizar posición
    setTimeout(() => {
      this.trigger.openMenu();
    });
  }

  mostrarAgruparReserva(){
    const dialogRef = this.dialog.open(GrupoFormComponent, {
        data:{selectedItems: this.selectedItems,items: this.items},
        width: "98vw",
        maxWidth: "600px",
        disableClose: true
    });
  }
   
}
