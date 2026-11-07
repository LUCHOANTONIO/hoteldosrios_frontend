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

import { PaqueteModel } from '../../../models/paquete.model';
import { PaqueteService } from '../../../services/paquete.service';
import { AlertService } from '../../../../base/services/local/alert.service';
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

export interface PaqueteModalData {
  paquetes?: PaqueteModel[];
  seleccionadoId?: number;
}

@Component({
  selector: 'app-paquete-modal',
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
  templateUrl: './paquete-modal.html',
  styleUrls: ['./paquete-modal.scss']
})
export class PaqueteModalComponent {
  paquetes: PaqueteModel[] = [];
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
    public dialogRef: MatDialogRef<PaqueteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaqueteModalData,
    private paqueteService: PaqueteService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {
    if (data) {
      this.paquetes = data.paquetes ? [...data.paquetes] : [];
      this.seleccionadoId = data.seleccionadoId;
    }
    if (this.paquetes.length === 0) {
      this.cargando = true;
      this.paqueteService.listar().subscribe({
        next: (res) => {
          this.paquetes = res || [];
          this.cargando = false;
        },
        error: () => this.cargando = false
      });
    }
  }

  getPaquetesFiltrados(): PaqueteModel[] {
    let lista = this.paquetes;
    if (this.filtro && this.filtro.trim()) {
      const q = this.filtro.toLowerCase();
      lista = lista.filter(p => p.descripcion?.toLowerCase().includes(q));
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
      this.alertService.show("Ingrese la descripción del paquete", { duration: 3000, type: 'info' });
      return;
    }

    this.guardandoNuevo = true;
    const nuevo = new PaqueteModel();
    nuevo.descripcion = this.nuevoDescripcion.trim();

    this.paqueteService.crear(nuevo).subscribe({
      next: (res) => {
        this.guardandoNuevo = false;
        if (res.correcto) {
          const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
          this.paquetes = data.paquetes || this.paquetes;
          this.seleccionadoId = data.paquete?.id;
          this.cancelarNuevo();
          this.alertService.show("Paquete creado exitosamente", { duration: 2500, type: 'success' });
        } else {
          this.alertService.show(res.mensaje || "Error al crear paquete", { duration: 4000, type: 'info' });
        }
      },
      error: () => {
        this.guardandoNuevo = false;
        this.alertService.show("Error de conexión al crear paquete", { duration: 4000, type: 'error' });
      }
    });
  }

  // --- EDICIÓN ---
  iniciarEdicionFila(item: PaqueteModel) {
    this.cancelarNuevo();
    this.filaEditandoId = item.id;
    this.tempFilaDesc = item.descripcion;
  }

  cancelarEdicionFila() {
    this.filaEditandoId = 0;
    this.tempFilaDesc = '';
  }

  guardarEdicionFila(item: PaqueteModel) {
    if (!this.tempFilaDesc || !this.tempFilaDesc.trim()) {
      this.alertService.show("La descripción no puede estar vacía", { duration: 3000, type: 'info' });
      return;
    }

    this.guardandoEdicion = true;
    const edit = new PaqueteModel();
    edit.id = item.id;
    edit.descripcion = this.tempFilaDesc.trim();

    this.paqueteService.modificar(edit).subscribe({
      next: (res) => {
        this.guardandoEdicion = false;
        if (res.correcto) {
          const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
          this.paquetes = data.paquetes || this.paquetes;
          this.cancelarEdicionFila();
          this.alertService.show("Paquete modificado exitosamente", { duration: 2500, type: 'success' });
        } else {
          this.alertService.show(res.mensaje || "Error al modificar paquete", { duration: 4000, type: 'info' });
        }
      },
      error: () => {
        this.guardandoEdicion = false;
        this.alertService.show("Error de conexión al modificar", { duration: 4000, type: 'error' });
      }
    });
  }

  // --- ELIMINACIÓN ---
  eliminar(item: PaqueteModel) {
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '280px',
      data: item.id
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.paqueteService.eliminar(item.id).subscribe({
          next: (res) => {
            if (res.correcto) {
              const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
              this.paquetes = data.paquetes || this.paquetes.filter(p => p.id !== item.id);
              if (this.seleccionadoId === item.id) {
                this.seleccionadoId = undefined;
              }
              this.alertService.show("Paquete eliminado exitosamente", { duration: 2500, type: 'success' });
            } else {
              this.alertService.show(res.mensaje || "Error al eliminar paquete", { duration: 4000, type: 'info' });
            }
          },
          error: () => {
            this.alertService.show("Error al eliminar paquete", { duration: 4000, type: 'error' });
          }
        });
      }
    });
  }

  // --- SELECCIÓN Y CIERRE ---
  seleccionar(item: PaqueteModel) {
    this.dialogRef.close({
      paquetes: this.paquetes,
      seleccionadoId: item.id
    });
  }

  cerrar() {
    this.dialogRef.close({
      paquetes: this.paquetes,
      seleccionadoId: this.seleccionadoId
    });
  }
}
