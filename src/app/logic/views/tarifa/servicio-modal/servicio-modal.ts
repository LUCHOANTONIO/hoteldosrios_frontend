import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

import { ServicioModel } from '../../../models/servicio.model';
import { ServicioService } from '../../../services/servicio.service';
import { AlertService } from '../../../../base/services/local/alert.service';
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

export interface ServicioModalData {
  servicios?: ServicioModel[];
  seleccionadoId?: number;
}

@Component({
  selector: 'app-servicio-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    CdkDrag,
    CdkDragHandle
  ],
  templateUrl: './servicio-modal.html',
  styleUrls: ['./servicio-modal.scss']
})
export class ServicioModalComponent {
  servicios: ServicioModel[] = [];
  seleccionadoId?: number;

  filtro: string = '';

  // Modo nuevo
  mostrandoNuevo: boolean = false;
  nuevoDescripcion: string = '';
  guardandoNuevo: boolean = false;

  // Modo edición fila
  filaEditandoId: number = 0;
  tempFilaDesc: string = '';
  guardandoEdicion: boolean = false;
  cargando: boolean = false;

  @ViewChild('inputNuevo') inputNuevoRef!: ElementRef<HTMLInputElement>;

  constructor(
    public dialogRef: MatDialogRef<ServicioModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServicioModalData,
    private servicioService: ServicioService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {
    if (data) {
      this.servicios = data.servicios ? [...data.servicios] : [];
      this.seleccionadoId = data.seleccionadoId;
    }
    if (this.servicios.length === 0) {
      this.cargando = true;
      this.servicioService.listar().subscribe({
        next: (res) => {
          this.servicios = res || [];
          this.cargando = false;
        },
        error: () => this.cargando = false
      });
    }
  }

  getServiciosFiltrados(): ServicioModel[] {
    let lista = this.servicios;
    if (this.filtro && this.filtro.trim()) {
      const q = this.filtro.toLowerCase();
      lista = lista.filter(s => s.descripcion?.toLowerCase().includes(q));
    }
    return [...lista].sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  // --- CREACIÓN ---
  abrirNuevo() {
    this.mostrandoNuevo = true;
    this.nuevoDescripcion = '';
    this.cancelarEdicionFila();
    setTimeout(() => {
      if (this.inputNuevoRef) {
        this.inputNuevoRef.nativeElement.focus();
      }
    }, 100);
  }

  cancelarNuevo() {
    this.mostrandoNuevo = false;
    this.nuevoDescripcion = '';
  }

  guardarNuevo() {
    if (!this.nuevoDescripcion || !this.nuevoDescripcion.trim()) {
      this.alertService.show("Ingrese la descripción del servicio", { duration: 3000, type: 'info' });
      return;
    }

    this.guardandoNuevo = true;
    const nuevo = new ServicioModel();
    nuevo.descripcion = this.nuevoDescripcion.trim();

    this.servicioService.crear(nuevo).subscribe({
      next: (res) => {
        this.guardandoNuevo = false;
        if (res.correcto) {
          const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
          this.servicios = data.servicios || this.servicios;
          this.seleccionadoId = data.servicio?.id;
          this.cancelarNuevo();
          this.alertService.show("Servicio creado exitosamente", { duration: 2500, type: 'success' });
        } else {
          this.alertService.show(res.mensaje || "Error al crear servicio", { duration: 4000, type: 'info' });
        }
      },
      error: () => {
        this.guardandoNuevo = false;
        this.alertService.show("Error de conexión al crear servicio", { duration: 4000, type: 'error' });
      }
    });
  }

  // --- EDICIÓN ---
  iniciarEdicionFila(item: ServicioModel) {
    this.cancelarNuevo();
    this.filaEditandoId = item.id;
    this.tempFilaDesc = item.descripcion;
  }

  cancelarEdicionFila() {
    this.filaEditandoId = 0;
    this.tempFilaDesc = '';
  }

  guardarEdicionFila(item: ServicioModel) {
    if (!this.tempFilaDesc || !this.tempFilaDesc.trim()) {
      this.alertService.show("La descripción no puede estar vacía", { duration: 3000, type: 'info' });
      return;
    }

    this.guardandoEdicion = true;
    const edit = new ServicioModel();
    edit.id = item.id;
    edit.descripcion = this.tempFilaDesc.trim();

    this.servicioService.modificar(edit).subscribe({
      next: (res) => {
        this.guardandoEdicion = false;
        if (res.correcto) {
          const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
          this.servicios = data.servicios || this.servicios;
          this.cancelarEdicionFila();
          this.alertService.show("Servicio modificado exitosamente", { duration: 2500, type: 'success' });
        } else {
          this.alertService.show(res.mensaje || "Error al modificar servicio", { duration: 4000, type: 'info' });
        }
      },
      error: () => {
        this.guardandoEdicion = false;
        this.alertService.show("Error de conexión al modificar", { duration: 4000, type: 'error' });
      }
    });
  }

  // --- ELIMINACIÓN ---
  eliminar(item: ServicioModel) {
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '280px',
      data: item.id
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.servicioService.eliminar(item.id).subscribe({
          next: (res) => {
            if (res.correcto) {
              const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
              this.servicios = data.servicios || this.servicios.filter(s => s.id !== item.id);
              if (this.seleccionadoId === item.id) {
                this.seleccionadoId = undefined;
              }
              this.alertService.show("Servicio eliminado exitosamente", { duration: 2500, type: 'success' });
            } else {
              this.alertService.show(res.mensaje || "Error al eliminar servicio", { duration: 4000, type: 'info' });
            }
          },
          error: () => {
            this.alertService.show("Error al eliminar servicio", { duration: 4000, type: 'error' });
          }
        });
      }
    });
  }

  // --- SELECCIÓN Y CIERRE ---
  seleccionar(item: ServicioModel) {
    this.dialogRef.close({
      servicios: this.servicios,
      seleccionadoId: item.id
    });
  }

  cerrar() {
    this.dialogRef.close({
      servicios: this.servicios,
      seleccionadoId: this.seleccionadoId
    });
  }
}
