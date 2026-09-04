// MODELS
import { TarifaModel } from '../../../models/tarifa.model';
import { ServicioModel } from '../../../models/servicio.model';
import { TipoHospedajeModel } from '../../../models/tipo_hospedaje.model';
import { PaqueteModel } from '../../../models/paquete.model';

// SERVICES
import { TarifaService } from '../../../services/tarifa.service';
import { ServicioService } from '../../../services/servicio.service';
import { TipoHospedajeService } from '../../../services/tipo_hospedaje.service';
import { PaqueteService } from '../../../services/paquete.service';
import { AlertService } from '../../../../base/services/local/alert.service';

// ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

// DIRECTIVAS
import { PreventEnterSubmitDirective } from '../../../../base/shared/directives/prevent-enter-submit.directive';
import { PreventEnterSelectDirective } from '../../../../base/shared/directives/prevent-enter-select.directive';
import { AnimarPerderFocoDirective } from '../../../../base/shared/directives/animar-perder-foco.directive';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';

// VARIOS
import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tarifa-form',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDividerModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
    CdkDrag,
    CdkDragHandle,
    PreventEnterSubmitDirective,
    PreventEnterSelectDirective,
    AnimarPerderFocoDirective,
    BotonGuardarDirective
  ],
  templateUrl: './tarifa-form.html',
  styleUrls: ['./tarifa-form.scss']
})
export class TarifaFormComponent {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
  tarifa: TarifaModel;
  tarifas: any;

  servicios: ServicioModel[] = [];
  tiposHospedaje: TipoHospedajeModel[] = [];
  paquetes: PaqueteModel[] = [];

  constructor(
    public dialogRef: MatDialogRef<TarifaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private tarifaService: TarifaService,
    private servicioService: ServicioService,
    private tipoHospedajeService: TipoHospedajeService,
    private paqueteService: PaqueteService,
    private alertService: AlertService
  ) {
    this.tarifa = data.tarifa;
    this.tarifas = data.tarifas;
    this.cargarListas();
    this.dialogRef.backdropClick().subscribe(x => { });
  }

  cargarListas() {
    forkJoin({
      servicios: this.servicioService.listar(),
      tiposHospedaje: this.tipoHospedajeService.listar(),
      paquetes: this.paqueteService.listar()
    }).subscribe({
      next: (res) => {
        this.servicios = res.servicios;
        this.tiposHospedaje = res.tiposHospedaje;
        this.paquetes = res.paquetes;
      },
      error: (err) => console.error("Error al cargar listas para Tarifa:", err)
    });
  }

  submit(f: NgForm) {
    if (f.valid) {
      this.botonGuardarDirectiva.deshabilitarFormBoton();
      if (this.tarifa.id > 0) {
        this.modificar();
      } else {
        this.crear();
      }
    } else {
      this.alertService.show("Debe completar los campos obligatorios", { duration: 3000, type: 'info' });
    }
  }

  crear() {
    this.tarifaService.crear(this.tarifa).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          if (this.tarifas && typeof this.tarifas.set === 'function') {
            this.tarifas.set(data.tarifas);
          }
          this.dialogRef.close(data);
        } else {
          this.alertService.show(res.mensaje, { duration: 10000, type: 'info' });
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      },
      error: (error) => {
        this.botonGuardarDirectiva.habilitarFormBoton();
      }
    });
  }

  modificar() {
    this.tarifaService.modificar(this.tarifa).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          if (this.tarifas && typeof this.tarifas.set === 'function') {
            this.tarifas.set(data.tarifas);
          }
          this.dialogRef.close(data);
        } else {
          this.alertService.show(res.mensaje, { duration: 10000, type: 'info' });
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      },
      error: (error) => {
        this.botonGuardarDirectiva.habilitarFormBoton();
      }
    });
  }
}
