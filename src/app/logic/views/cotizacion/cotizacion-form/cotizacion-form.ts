// MODELS
import { CotizacionModel } from '../../../models/cotizacion.model';
import { CotizacionDetalleModel } from '../../../models/cotizacion_detalle.model';
import { TarifaModel } from '../../../models/tarifa.model';
import { TipoDocumentoModel } from '../../../../base/models/tipodocumento.model';

// SERVICES
import { CotizacionService } from '../../../services/cotizacion.service';
import { CotizacionDetalleService } from '../../../services/cotizacion_detalle.service';
import { TarifaService } from '../../../services/tarifa.service';
import { TipoDocumentoService } from '../../../../base/services/tipodocumento.service';
import { AlertService } from '../../../../base/services/local/alert.service';

// ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

// DIRECTIVAS
import { PreventEnterSubmitDirective } from '../../../../base/shared/directives/prevent-enter-submit.directive';
import { AnimarPerderFocoDirective } from '../../../../base/shared/directives/animar-perder-foco.directive';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';

// VARIOS
import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import moment from 'moment';
// DATA PICKER
import { MatDatepickerModule } from '@angular/material/datepicker';
// MODAL SELECTOR TARIFA
import { SeleccionarTarifaModalComponent } from '../seleccionar-tarifa-modal/seleccionar-tarifa-modal';

@Component({
  selector: 'app-cotizacion-form',
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
    MatProgressSpinnerModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatDatepickerModule,
    CdkDrag,
    CdkDragHandle,
    PreventEnterSubmitDirective,
    AnimarPerderFocoDirective,
    BotonGuardarDirective
  ],
  templateUrl: './cotizacion-form.html',
  styleUrls: ['./cotizacion-form.scss']
})
export class CotizacionFormComponent {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
  cotizacion: CotizacionModel;
  cotizaciones: any;

  tiposDocumento: TipoDocumentoModel[] = [];
  tarifas: TarifaModel[] = [];

  detalles: CotizacionDetalleModel[] = [];
  displayedColumns: string[] = [
    'acciones',
    'tarifa',
    'cantidad_adulto',
    'precio_unit_adulto',
    'cantidad_ninio',
    'precio_unit_ninio',
    'subtotal'
  ];
  dataSource: MatTableDataSource<CotizacionDetalleModel>;

  totalGeneral: number = 0;

  constructor(
    public dialogRef: MatDialogRef<CotizacionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private cotizacionService: CotizacionService,
    private cotizacionDetalleService: CotizacionDetalleService,
    private tarifaService: TarifaService,
    private tipoDocumentoService: TipoDocumentoService,
    private alertService: AlertService
  ) {
    this.cotizacion = data.cotizacion;
    this.cotizaciones = data.cotizaciones;
    this.normalizarFechasParaFormulario();
    this.cargarDatosIniciales();
    this.dialogRef.backdropClick().subscribe(x => { });
  }

  private parsearFecha(fecha: any): Date | null {
    if (!fecha) return null;
    if (fecha instanceof Date) return isNaN(fecha.getTime()) ? null : fecha;
    if (typeof fecha === 'string') {
      const fechaLimpia = fecha.trim();
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fechaLimpia)) {
        const [dia, mes, anio] = fechaLimpia.split('/').map(Number);
        return new Date(anio, mes - 1, dia);
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(fechaLimpia)) {
        const [anio, mes, dia] = fechaLimpia.substring(0, 10).split('-').map(Number);
        return new Date(anio, mes - 1, dia);
      }
    }
    const m = moment(fecha, ['DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601]);
    return m.isValid() ? m.toDate() : null;
  }

  private normalizarFechasParaFormulario() {
    if (this.cotizacion) {
      if (this.cotizacion.fecha_ini) {
        this.cotizacion.fecha_ini = this.parsearFecha(this.cotizacion.fecha_ini) as any;
      }
      if (this.cotizacion.fecha_fin) {
        this.cotizacion.fecha_fin = this.parsearFecha(this.cotizacion.fecha_fin) as any;
      }
    }
  }

  cargarDatosIniciales() {
    forkJoin({
      tiposDoc: this.tipoDocumentoService.listar(),
      tarifas: this.tarifaService.listar()
    }).subscribe({
      next: (res) => {
        this.tiposDocumento = res.tiposDoc;
        this.tarifas = res.tarifas;

        if (this.cotizacion.id > 0) {
          this.cargarDetallesExistentes();
        } else {
          // Inicializar con una fila por defecto
          this.agregarFilaDetalle();
        }
      },
      error: (err) => console.error("Error al cargar datos iniciales:", err)
    });
  }

  cargarDetallesExistentes() {
    this.cotizacionDetalleService.listar(this.cotizacion.id).subscribe({
      next: (res: any) => {
        this.detalles = Array.isArray(res) ? res : [];
        if (this.detalles.length === 0) {
          this.agregarFilaDetalle();
        } else {
          this.actualizarTabla();
        }
      },
      error: (err) => {
        console.error("Error al cargar detalles existentes:", err);
        this.agregarFilaDetalle();
      }
    });
  }

  agregarFilaDetalle() {
    const nuevo = new CotizacionDetalleModel();
    nuevo.cotizacion_id = this.cotizacion.id || 0;
    nuevo.tarifa_id = null;
    nuevo.cantidad_adulto = 1;
    nuevo.precio_unit_adulto = 0;
    nuevo.cantidad_ninio = 0;
    nuevo.precio_unit_ninio = 0;
    nuevo.subtotal = 0;

    this.detalles = [...this.detalles, nuevo];
    this.actualizarTabla();
  }

  eliminarFilaDetalle(index: number) {
    this.detalles.splice(index, 1);
    this.detalles = [...this.detalles];
    this.actualizarTabla();
  }

  abrirModalSeleccionarTarifa(item?: CotizacionDetalleModel) {
    const dialogRef = this.dialog.open(SeleccionarTarifaModalComponent, {
      data: {
        tarifas: this.tarifas,
        tarifaActualId: item ? item.tarifa_id : null
      },
      width: '95vw',
      maxWidth: '900px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((tarifaSeleccionada: TarifaModel) => {
      if (tarifaSeleccionada) {
        if (item) {
          item.tarifa_id = tarifaSeleccionada.id;
          item.precio_unit_adulto = Number(tarifaSeleccionada.tarifa_adulto) || 0;
          item.precio_unit_ninio = Number(tarifaSeleccionada.tarifa_ninio) || 0;
          item.servicio = tarifaSeleccionada.servicio;
          item.tipo_hospedaje = tarifaSeleccionada.tipo_hospedaje;
          item.paquete = tarifaSeleccionada.paquete;
          this.calcularSubtotal(item);
        } else {
          const nuevo = new CotizacionDetalleModel();
          nuevo.cotizacion_id = this.cotizacion.id || 0;
          nuevo.tarifa_id = tarifaSeleccionada.id;
          nuevo.cantidad_adulto = 1;
          nuevo.precio_unit_adulto = Number(tarifaSeleccionada.tarifa_adulto) || 0;
          nuevo.cantidad_ninio = 0;
          nuevo.precio_unit_ninio = Number(tarifaSeleccionada.tarifa_ninio) || 0;
          nuevo.servicio = tarifaSeleccionada.servicio;
          nuevo.tipo_hospedaje = tarifaSeleccionada.tipo_hospedaje;
          nuevo.paquete = tarifaSeleccionada.paquete;
          nuevo.subtotal = nuevo.precio_unit_adulto;
          this.detalles = [...this.detalles, nuevo];
          this.actualizarTabla();
        }
      }
    });
  }

  onTarifaChange(item: CotizacionDetalleModel) {
    if (item.tarifa_id) {
      const tarifaSel = this.tarifas.find(t => t.id === item.tarifa_id);
      if (tarifaSel) {
        item.precio_unit_adulto = Number(tarifaSel.tarifa_adulto) || 0;
        item.precio_unit_ninio = Number(tarifaSel.tarifa_ninio) || 0;
        item.servicio = tarifaSel.servicio;
        item.tipo_hospedaje = tarifaSel.tipo_hospedaje;
        item.paquete = tarifaSel.paquete;
      }
    }
    this.calcularSubtotal(item);
  }

  calcularSubtotal(item: CotizacionDetalleModel) {
    if (item.cantidad_adulto !== null && item.cantidad_adulto !== undefined && item.cantidad_adulto < 0) {
      item.cantidad_adulto = 0;
    }
    if (item.precio_unit_adulto !== null && item.precio_unit_adulto !== undefined && item.precio_unit_adulto < 0) {
      item.precio_unit_adulto = 0;
    }
    if (item.cantidad_ninio !== null && item.cantidad_ninio !== undefined && item.cantidad_ninio < 0) {
      item.cantidad_ninio = 0;
    }
    if (item.precio_unit_ninio !== null && item.precio_unit_ninio !== undefined && item.precio_unit_ninio < 0) {
      item.precio_unit_ninio = 0;
    }

    const cantAd = Math.max(0, Number(item.cantidad_adulto) || 0);
    const puAd = Math.max(0, Number(item.precio_unit_adulto) || 0);
    const cantNi = Math.max(0, Number(item.cantidad_ninio) || 0);
    const puNi = Math.max(0, Number(item.precio_unit_ninio) || 0);
    item.subtotal = (cantAd * puAd) + (cantNi * puNi);
    this.calcularTotalGeneral();
  }

  actualizarTabla() {
    this.dataSource = new MatTableDataSource<CotizacionDetalleModel>(this.detalles);
    this.calcularTotalGeneral();
  }

  calcularTotalGeneral() {
    this.totalGeneral = this.detalles.reduce((acc, item) => {
      const sub = Number(item.subtotal) || 
        ((Math.max(0, Number(item.cantidad_adulto) || 0) * Math.max(0, Number(item.precio_unit_adulto) || 0)) +
         (Math.max(0, Number(item.cantidad_ninio) || 0) * Math.max(0, Number(item.precio_unit_ninio) || 0)));
      return acc + sub;
    }, 0);
  }

  validarFechas() {
    if (this.cotizacion.fecha_ini && this.cotizacion.fecha_fin) {
      const fIni = moment(this.cotizacion.fecha_ini, ['DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601]);
      const fFin = moment(this.cotizacion.fecha_fin, ['DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601]);
      if (fIni.isValid() && fFin.isValid() && fIni.isAfter(fFin)) {
        this.alertService.show("La Fecha Ingreso no puede ser mayor a la Fecha Salida", { duration: 3000, type: 'warning' });
      }
    }
  }

  submit(f: NgForm) {
    if (f.valid) {
      // Validar que las fechas sean obligatorias
      if (!this.cotizacion.fecha_ini || !this.cotizacion.fecha_fin) {
        this.alertService.show("Debe seleccionar la Fecha de Ingreso y la Fecha de Salida", { duration: 4000, type: 'warning' });
        return;
      }

      const fIni = moment(this.cotizacion.fecha_ini, ['DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601]);
      const fFin = moment(this.cotizacion.fecha_fin, ['DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601]);
      if (fIni.isValid() && fFin.isValid() && fIni.isAfter(fFin)) {
        this.alertService.show("La Fecha Ingreso no puede ser mayor a la Fecha Salida", { duration: 4000, type: 'warning' });
        return;
      }

      // Validar que exista al menos un item en el detalle
      if (!this.detalles || this.detalles.length === 0) {
        this.alertService.show("Debe agregar al menos un item en el detalle de la cotización", { duration: 4000, type: 'warning' });
        return;
      }

      // Validar cantidades, precios y subtotales por item
      for (let i = 0; i < this.detalles.length; i++) {
        const d = this.detalles[i];
        if (d.cantidad_adulto < 0 || d.precio_unit_adulto < 0 || d.cantidad_ninio < 0 || d.precio_unit_ninio < 0) {
          this.alertService.show(`Las cantidades y precios en el item #${i + 1} no pueden ser negativos`, { duration: 4000, type: 'warning' });
          return;
        }
        const sub = Number(d.subtotal) || 0;
        if (sub <= 0) {
          this.alertService.show(`El subtotal en el item #${i + 1} no puede ser 0`, { duration: 4000, type: 'warning' });
          return;
        }
      }

      // Validar que el total general no sea 0
      if (!this.totalGeneral || this.totalGeneral <= 0) {
        this.alertService.show("El total de la cotización debe ser mayor a 0", { duration: 4000, type: 'warning' });
        return;
      }

      this.botonGuardarDirectiva.deshabilitarFormBoton();
      this.cotizacion.detalles = this.detalles;

      if (this.cotizacion.fecha_ini) {
        const fIniMoment = moment(this.cotizacion.fecha_ini, ['DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601]);
        this.cotizacion.fecha_ini = fIniMoment.isValid() ? fIniMoment.format('YYYY-MM-DD') : this.cotizacion.fecha_ini;
      } else {
        this.cotizacion.fecha_ini = null as any;
      }

      if (this.cotizacion.fecha_fin) {
        const fFinMoment = moment(this.cotizacion.fecha_fin, ['DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601]);
        this.cotizacion.fecha_fin = fFinMoment.isValid() ? fFinMoment.format('YYYY-MM-DD') : this.cotizacion.fecha_fin;
      } else {
        this.cotizacion.fecha_fin = null as any;
      }

      if (this.cotizacion.id > 0) {
        this.modificar();
      } else {
        this.crear();
      }
    } else {
      this.alertService.show("Debe completar los campos obligatorios", { duration: 3000, type: 'info' });
    }
  }

  crear() {
    this.cotizacionService.crear(this.cotizacion).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          if (this.cotizaciones && typeof this.cotizaciones.set === 'function') {
            this.cotizaciones.set(data.cotizaciones);
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
    this.cotizacionService.modificar(this.cotizacion).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          if (this.cotizaciones && typeof this.cotizaciones.set === 'function') {
            this.cotizaciones.set(data.cotizaciones);
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
