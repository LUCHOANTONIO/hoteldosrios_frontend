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
import { PreventEnterSelectDirective } from '../../../../base/shared/directives/prevent-enter-select.directive';
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
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

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
    PreventEnterSelectDirective,
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

  itemNuevo: CotizacionDetalleModel = new CotizacionDetalleModel();
  editandoIndex: number | null = null;

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
    this.inicializarItemNuevo();
    this.normalizarFechasParaFormulario();
    this.cargarDatosIniciales();
    this.dialogRef.backdropClick().subscribe(x => { });
  }

  inicializarItemNuevo() {
    this.itemNuevo = new CotizacionDetalleModel();
    this.itemNuevo.cotizacion_id = this.cotizacion?.id || 0;
    this.itemNuevo.tarifa_id = null;
    this.itemNuevo.cantidad_adulto = 1;
    this.itemNuevo.precio_unit_adulto = null as any;
    this.itemNuevo.cantidad_ninio = null as any;
    this.itemNuevo.precio_unit_ninio = null as any;
    this.itemNuevo.subtotal = 0;
    this.editandoIndex = null;
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
          this.detalles = [];
          this.actualizarTabla();
        }
      },
      error: (err) => console.error("Error al cargar datos iniciales:", err)
    });
  }

  cargarDetallesExistentes() {
    this.cotizacionDetalleService.listar(this.cotizacion.id).subscribe({
      next: (res: any) => {
        this.detalles = Array.isArray(res) ? res : [];
        this.actualizarTabla();
      },
      error: (err) => {
        console.error("Error al cargar detalles existentes:", err);
        this.detalles = [];
        this.actualizarTabla();
      }
    });
  }

  agregarOActualizarItem() {
    const puAd = Number(this.itemNuevo.precio_unit_adulto) || 0;
    const puNi = Number(this.itemNuevo.precio_unit_ninio) || 0;

    if (puAd <= 0 && puNi <= 0) {
      this.alertService.show("Debe ingresar al menos un precio (P.U. Adulto o P.U. Niño)", { duration: 4000, type: 'warning' });
      return;
    }

    this.calcularSubtotal(this.itemNuevo);

    if (!this.itemNuevo.subtotal || this.itemNuevo.subtotal <= 0) {
      this.alertService.show("El subtotal del ítem debe ser mayor a 0 (verifique que la cantidad sea mayor a 0)", { duration: 4000, type: 'warning' });
      return;
    }

    if (!this.itemNuevo.tarifa_id && (!this.itemNuevo.servicio || this.itemNuevo.servicio.trim() === '')) {
      this.itemNuevo.servicio = 'Cotización de Servicio';
      this.itemNuevo.detalle = 'Cotización de Servicio';
    }

    if (this.editandoIndex !== null && this.editandoIndex >= 0) {
      // Actualizar ítem existente
      this.detalles[this.editandoIndex] = { ...this.itemNuevo };
      this.alertService.show("Ítem actualizado", { duration: 2000, type: 'success' });
    } else {
      // Agregar nuevo ítem
      const nuevoItem = { ...this.itemNuevo };
      this.detalles.push(nuevoItem);
    }

    this.detalles = [...this.detalles];
    this.inicializarItemNuevo();
    this.actualizarTabla();
  }

  editarItem(index: number) {
    if (index >= 0 && index < this.detalles.length) {
      this.editandoIndex = index;
      this.itemNuevo = { ...this.detalles[index] };
      this.calcularSubtotal(this.itemNuevo);
    }
  }

  cancelarEdicion() {
    this.inicializarItemNuevo();
  }

  eliminarItem(index: number) {
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '260px',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
      data: '¿Está seguro de eliminar este ítem?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.editandoIndex === index) {
          this.inicializarItemNuevo();
        } else if (this.editandoIndex !== null && this.editandoIndex > index) {
          this.editandoIndex--;
        }
        this.detalles.splice(index, 1);
        this.detalles = [...this.detalles];
        this.actualizarTabla();
      }
    });
  }

  abrirModalSeleccionarTarifa(paraItemNuevo: boolean = true, item?: CotizacionDetalleModel) {
    const tarifaActual = paraItemNuevo ? this.itemNuevo.tarifa_id : (item ? item.tarifa_id : null);
    const dialogRef = this.dialog.open(SeleccionarTarifaModalComponent, {
      data: {
        tarifas: this.tarifas,
        tarifaActualId: tarifaActual
      },
      width: '95vw',
      maxWidth: '900px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((tarifaSeleccionada: TarifaModel) => {
      if (tarifaSeleccionada) {
        if (paraItemNuevo) {
          this.itemNuevo.tarifa_id = tarifaSeleccionada.id;
          this.itemNuevo.precio_unit_adulto = Number(tarifaSeleccionada.tarifa_adulto) || 0;
          this.itemNuevo.precio_unit_ninio = Number(tarifaSeleccionada.tarifa_ninio) || 0;
          this.itemNuevo.servicio = tarifaSeleccionada.servicio;
          this.itemNuevo.tipo_hospedaje = tarifaSeleccionada.tipo_hospedaje;
          this.itemNuevo.paquete = tarifaSeleccionada.paquete;
          this.calcularSubtotal(this.itemNuevo);
        } else if (item) {
          item.tarifa_id = tarifaSeleccionada.id;
          item.precio_unit_adulto = Number(tarifaSeleccionada.tarifa_adulto) || 0;
          item.precio_unit_ninio = Number(tarifaSeleccionada.tarifa_ninio) || 0;
          item.servicio = tarifaSeleccionada.servicio;
          item.tipo_hospedaje = tarifaSeleccionada.tipo_hospedaje;
          item.paquete = tarifaSeleccionada.paquete;
          this.calcularSubtotal(item);
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
    } else {
      item.servicio = 'Cotización de Servicio';
      item.tipo_hospedaje = '';
      item.paquete = '';
    }
    this.calcularSubtotal(item);
  }

  calcularSubtotal(item: CotizacionDetalleModel) {
    if (!item) return;
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

      // Normalizar datos del cliente y cotización
      this.cotizacion.nombre = (this.cotizacion.nombre || '').trim();
      this.cotizacion.primer_apellido = (this.cotizacion.primer_apellido || '').trim();
      this.cotizacion.segundo_apellido = (this.cotizacion.segundo_apellido || '').trim();
      this.cotizacion.dni = (this.cotizacion.dni || '').trim();
      this.cotizacion.telefono = (this.cotizacion.telefono || '').trim();
      this.cotizacion.tipo_doc_id = this.cotizacion.tipo_doc_id ? Number(this.cotizacion.tipo_doc_id) : null;
      this.cotizacion.detalle = (this.cotizacion.detalle || '').trim();

      // Normalizar detalles asegurando tipos numéricos para BD (evitar nulls en campos no nulos)
      this.cotizacion.detalles = this.detalles.map(d => {
        const cantAd = Number(d.cantidad_adulto) || 0;
        const puAd = Number(d.precio_unit_adulto) || 0;
        const cantNi = Number(d.cantidad_ninio) || 0;
        const puNi = Number(d.precio_unit_ninio) || 0;
        const sub = Number(d.subtotal) || ((cantAd * puAd) + (cantNi * puNi));
        const nomServicio = d.servicio && d.servicio.trim() !== '' ? d.servicio.trim() : 'Cotización de Servicio';
        const txtDetalle = d.detalle && d.detalle.trim() !== '' ? d.detalle.trim() : nomServicio;

        return {
          ...d,
          cotizacion_id: this.cotizacion.id || 0,
          tarifa_id: d.tarifa_id ? Number(d.tarifa_id) : null,
          cantidad_adulto: cantAd,
          precio_unit_adulto: puAd,
          cantidad_ninio: cantNi,
          precio_unit_ninio: puNi,
          subtotal: sub,
          servicio: nomServicio,
          detalle: txtDetalle,
          tipo_hospedaje: d.tipo_hospedaje || '',
          paquete: d.paquete || ''
        };
      });

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
