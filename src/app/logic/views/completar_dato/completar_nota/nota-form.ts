//ANGULAR MATERIAL
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

//MODELS
import { ReservaModel } from '../../../models/reserva.model';
import { NotaModel } from '../../../models/nota.model';

//ANGULAR
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AlertService } from '../../../../base/services/local/alert.service';

//SERVICES
import { NotaService } from '../../../services/nota.service';
import { ComunicacionService } from '../../../services/local/comunicacion.service';
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

@Component({
  selector: 'app-completar_nota-form',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './nota-form.html',
  styleUrl: './nota-form.scss'
})
export class CompletarNotaFormComponent implements OnInit {
  @Input() reserva!: ReservaModel;
  @ViewChild('txtNota') txtNota!: ElementRef<HTMLTextAreaElement>;

  nota: NotaModel = new NotaModel();
  notas: NotaModel[] = [];
  modoEdicion: boolean = false;
  notaSeleccionadaId: number | null = null;
  isGuardando: boolean = false;
  isEliminandoId: number | null = null;

  constructor(
    private notaService: NotaService,
    private alertService: AlertService,
    private comunicacionService: ComunicacionService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    setTimeout(() => {
      if (this.reserva) {
        this.cargarNotas(this.reserva.id);
      }
    });
  }

  cargarNotas(id: number) {
    this.notaService.listar(id).subscribe({
      next: (res) => {
        this.notas = res;
      },
      error: () => {
        // Sin acciones
      }
    });
  }

  onEnterKey(event: Event, f: NgForm) {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      if (!this.isGuardando) {
        this.submitNota(f);
      }
    }
  }

  submitNota(f: NgForm) {
    if (this.isGuardando) return;
    if (f.valid && this.nota.descripcion && this.nota.descripcion.trim()) {
      if (this.modoEdicion) {
        this.guardarEdicion();
      } else {
        this.adicionarNota();
      }
    } else {
      this.alertService.show('Debe escribir una descripción para la nota', { duration: 3000, type: 'info' });
    }
  }

  adicionarNota() {
    this.isGuardando = true;
    const payload: NotaModel = new NotaModel();
    payload.reserva_id = this.reserva.id;
    payload.descripcion = this.nota.descripcion;

    this.notaService.crear(payload).subscribe({
      next: (res) => {
        this.isGuardando = false;
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          this.notas = data.notas as NotaModel[];
          this.reserva = data.reserva as ReservaModel;
          this.nota = new NotaModel();
          this.comunicacionService.executeActionReserva.set(true);
          this.alertService.show('Nota agregada correctamente', { duration: 3000, type: 'success' });
        } else {
          this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
        }
      },
      error: () => {
        this.isGuardando = false;
        this.alertService.show('Error al guardar la nota', { duration: 4000, type: 'info' });
      }
    });
  }

  iniciarEdicion(item: NotaModel) {
    this.modoEdicion = true;
    this.notaSeleccionadaId = item.id;
    this.nota = new NotaModel();
    this.nota.id = item.id;
    this.nota.reserva_id = this.reserva.id;
    this.nota.descripcion = item.descripcion;
    setTimeout(() => {
      if (this.txtNota) {
        this.txtNota.nativeElement.focus();
        this.txtNota.nativeElement.select();
      }
    });
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.notaSeleccionadaId = null;
    this.nota = new NotaModel();
    if (this.reserva) {
      this.nota.reserva_id = this.reserva.id;
    }
  }

  guardarEdicion() {
    this.isGuardando = true;
    const payload: NotaModel = new NotaModel();
    payload.id = this.nota.id;
    payload.reserva_id = this.reserva.id;
    payload.descripcion = this.nota.descripcion;

    this.notaService.modificar(payload).subscribe({
      next: (res) => {
        this.isGuardando = false;
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          this.notas = data.notas as NotaModel[];
          this.reserva = data.reserva as ReservaModel;
          this.cancelarEdicion();
          this.comunicacionService.executeActionReserva.set(true);
          this.alertService.show('Nota modificada correctamente', { duration: 3000, type: 'success' });
        } else {
          this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
        }
      },
      error: () => {
        this.isGuardando = false;
        this.alertService.show('Error al modificar la nota', { duration: 4000, type: 'info' });
      }
    });
  }

  eliminarNota(item: NotaModel) {
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '320px',
      data: item.id.toString()
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado && item.id) {
        this.isEliminandoId = item.id;
        this.notaService.eliminar(item.id).subscribe({
          next: (res) => {
            this.isEliminandoId = null;
            if (res.correcto) {
              const data = JSON.parse(res.dato);
              this.notas = data.notas as NotaModel[];
              this.reserva = data.reserva as ReservaModel;
              if (this.modoEdicion && this.notaSeleccionadaId === item.id) {
                this.cancelarEdicion();
              }
              this.comunicacionService.executeActionReserva.set(true);
              this.alertService.show('Nota eliminada correctamente', { duration: 3000, type: 'success' });
            } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
            }
          },
          error: () => {
            this.isEliminandoId = null;
            this.alertService.show('Error al eliminar la nota', { duration: 4000, type: 'info' });
          }
        });
      }
    });
  }
}
