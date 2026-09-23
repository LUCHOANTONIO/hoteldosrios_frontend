// MODELS
import { FullDayModel } from '../../../models/full_day.model';
import { TipoDocumentoModel } from '../../../../base/models/tipodocumento.model';
import { PaisModel } from '../../../models/pais.model';
import { CanalReservaModel } from '../../../models/canal_reserva.model';
import { ProductoModel } from '../../../models/producto.model';
import { TransaccionModel } from '../../../models/transaccion.model';
import { FormaPagoModel } from '../../../models/forma_pago.model';
import { CategoriaModel } from '../../../models/categoria.model';

// COMPONENTES
import { HuespedFormComponent } from '../../timeline/huesped-form/huesped-form';
import { TransaccionFormComponent } from '../../timeline/transaccion-form/transaccion-form';
import { PagoFormComponent } from '../../timeline/pago-form/pago-form';
import { NotaFormComponent } from '../../timeline/nota-form/nota-form';
import { BitacoraFormComponent } from '../../timeline/bitacora-form/bitacora-form';
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';
import { SelectSearchComponent } from '../../../../base/shared/views/select-search/select-search';

// DATA PICKER
import { MatDatepickerModule } from '@angular/material/datepicker';

// MOMENT
import moment from 'moment';

// SERVICES
import { FullDayService } from '../../../services/full_day.service';
import { AlertService } from '../../../../base/services/local/alert.service';
import { PersonaService } from '../../../../base/services/persona.service';
import { DocumentoService } from '../../../services/documento.service';
import { BalanceService } from '../../../services/balance.service';
import { ComunicacionService } from '../../../services/local/comunicacion.service';
import { TransaccionService } from '../../../services/transaccion.service';
import { PermisoService } from '../../../../base/services/permiso.service';
import { CategoriaService } from '../../../services/categoria.service';

// ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator } from '@angular/material/paginator';

// DIRECTIVAS
import { PreventEnterSubmitDirective } from '../../../../base/shared/directives/prevent-enter-submit.directive';
import { PreventEnterSelectDirective } from '../../../../base/shared/directives/prevent-enter-select.directive';
import { AnimarPerderFocoDirective } from '../../../../base/shared/directives/animar-perder-foco.directive';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';
import { ShowErrorDirective } from '../../../../base/shared/directives/show-error.directive';

// VARIOS
import { Component, Inject, ChangeDetectorRef, ViewChild, effect, signal, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-full-day-form',
  standalone: true,
  imports: [
    MatTabsModule,
    MatMenuModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    CommonModule,
    FormsModule,
    CdkDrag,
    CdkDragHandle,
    PreventEnterSubmitDirective,
    AnimarPerderFocoDirective,
    BotonGuardarDirective,
    ShowErrorDirective,
    HuespedFormComponent,
    TransaccionFormComponent,
    PagoFormComponent,
    NotaFormComponent,
    BitacoraFormComponent,
    MatTableModule,
    MatDatepickerModule,
    SelectSearchComponent
  ],
  templateUrl: './full_day-form.html',
  styleUrls: ['./full_day-form.scss']
})
export class FullDayFormComponent implements OnInit {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
  @ViewChild(PagoFormComponent) pagoFormComponent?: PagoFormComponent;
  @ViewChild(BitacoraFormComponent) bitacoraFormComponent?: BitacoraFormComponent;
  @ViewChild('cboTipoDocId') cboTipoDocId: any;
  @ViewChild('cboFormaPagoAnticipo') cboFormaPagoAnticipo: any;

  forma_pagos: FormaPagoModel[] = [];
  productos: ProductoModel[] = [];
  tipo_documentos: TipoDocumentoModel[] = [];
  paises: PaisModel[] = [];
  canal_reservas: CanalReservaModel[] = [];
  reserva: FullDayModel = new FullDayModel();
  balance: any;

  // Banderas de visualización y estado
  btnVisibleCancel: boolean = true;
  btnVisibleSave: boolean = true;
  mnuVisibleOpciones: boolean = false;
  isDisabled: boolean = false;
  isEditFullDay: boolean = false;
  isVisibleTabs: boolean = false;
  isVisibleServiciosExtra: boolean = false;
  isSearchingDni: boolean = false;
  isProcessingServicio: boolean = false;

  // Variables para servicios / consumos adicionales
  displayedColumnsTransaccion: string[] = ['accion', 'descripcion', 'cantidad', 'precio_unitario', 'total'];
  dataSourceTransaccion = new MatTableDataSource<TransaccionModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  nuevoServicio: TransaccionModel = new TransaccionModel();
  categorias: CategoriaModel[] = [];
  productos_filtrados: ProductoModel[] = [];

  dialogVoucherRef: any;
  private triggerEstadoReserva = signal<number>(Date.now());

  constructor(
    public dialogRef: MatDialogRef<FullDayFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private fullDayService: FullDayService,
    private personaService: PersonaService,
    private alertService: AlertService,
    private documentoService: DocumentoService,
    private balanceService: BalanceService,
    private transaccionService: TransaccionService,
    private comunicacionService: ComunicacionService,
    private permisoService: PermisoService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef
  ) {
    this.forma_pagos = data?.forma_pagos || [];
    this.productos = data?.productos || [];
    this.tipo_documentos = data?.tipo_documentos || [];
    this.paises = data?.paises || [];
    this.canal_reservas = data?.canal_reservas || [];
    if (data?.reserva) {
      this.reserva = Object.assign(new FullDayModel(), data.reserva);
    }

    this.balance = this.balanceService.balance;

    if (this.reserva.id > 0) {
      this.cargarDatosTransaccion(this.reserva.id);
    }

    effect(() => {
      this.triggerEstadoReserva();
      if (this.reserva && this.reserva.id > 0 && !this.isEditFullDay) {
        this.reserva.anticipo = this.getYaPagado();
      }
    });
  }

  ngOnInit(): void {
    if (!this.reserva.id || this.reserva.id <= 0) {
      this.reserva.is_full_day = true;
      this.reserva.habitacion_id = null;
      if (!this.reserva.cantidad_adulto || this.reserva.cantidad_adulto <= 0) {
        this.reserva.cantidad_adulto = 1;
      }
      this.reserva.precio_unit_adulto = Number(this.reserva.precio_unit_adulto) || 0;
      this.reserva.cantidad_ninio = Number(this.reserva.cantidad_ninio) || 0;
      this.reserva.precio_unit_ninio = Number(this.reserva.precio_unit_ninio) || 0;
      this.reserva.total = 0;
      this.reserva.anticipo = 0;
      this.reserva.detalle_anticipo = '';
      if (!this.reserva.fecha_ini) {
        this.reserva.fecha_ini = moment().format('YYYY-MM-DD');
      }
      if (!this.reserva.fecha_fin) {
        this.reserva.fecha_fin = this.reserva.fecha_ini;
      }
      if (!this.reserva.hora_llegada) {
        this.reserva.hora_llegada = '09:00';
      }
      if (!this.reserva.canal_reserva_id && this.canal_reservas.length > 0) {
        this.reserva.canal_reserva_id = this.canal_reservas[0].id;
      }
    } else {
      this.reserva.precio_unit_adulto = Number(this.reserva.precio_unit_adulto) || 0;
      this.reserva.precio_unit_ninio = Number(this.reserva.precio_unit_ninio) || 0;
      this.reserva.anticipo = this.getYaPagado();
      setTimeout(() => {
        this.isDisabled = true;
        this.mnuVisibleOpciones = true;
        this.btnVisibleCancel = false;
        this.btnVisibleSave = false;
        this.isVisibleTabs = true;
        this.cdr.detectChanges();
      });
    }

    if (!this.reserva.pais_procedencia_id) {
      this.reserva.pais_procedencia_id = 1;
    }
    if (!this.reserva.tipo_doc_id) {
      this.reserva.tipo_doc_id = 1;
    }
    if (!this.reserva.nacionalidad_id) {
      this.reserva.nacionalidad_id = 1;
    }

    this.calcularTotal();

    this.productos_filtrados = [...this.productos];
    this.categoriaService.listar().subscribe({
      next: (res) => {
        this.categorias = res;
        this.filtrarProductos();
      }
    });

    this.inicializarNuevoServicio();
    if (!this.reserva.transacciones) {
      this.reserva.transacciones = [];
    }
    this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
    this.isVisibleServiciosExtra = (this.reserva.transacciones && this.reserva.transacciones.length > 0) ? true : false;
  }

  toggleServiciosExtra(): void {
    this.isVisibleServiciosExtra = !this.isVisibleServiciosExtra;
  }

  onClose(): void {
    this.dialogRef.close({ action: 'close' });
  }

  onCancel(): void {
    if (this.isEditFullDay) {
      this.isEditFullDay = false;
      this.isDisabled = true;
      this.mnuVisibleOpciones = true;
      this.btnVisibleCancel = false;
      this.btnVisibleSave = false;
      this.reserva.anticipo = this.getYaPagado();
      this.reserva.detalle_anticipo = '';
      this.botonGuardarDirectiva?.habilitarFormBoton();
      return;
    }
    this.dialogRef.close();
  }

  editarFullDay(): void {
    this.isEditFullDay = true;
    this.isDisabled = false;
    this.mnuVisibleOpciones = false;
    this.btnVisibleCancel = true;
    this.btnVisibleSave = true;
    this.reserva.anticipo = 0;
    this.reserva.detalle_anticipo = '';
  }

  submitFullDay(f: NgForm): void {
    if (f.valid) {
      if (!this.reserva.nombre || !this.reserva.nombre.trim()) {
        this.alertService.show("El nombre es obligatorio", { duration: 5000, type: 'info' });
        return;
      }
      if (!this.reserva.primer_apellido || !this.reserva.primer_apellido.trim()) {
        this.alertService.show("El primer apellido es obligatorio", { duration: 5000, type: 'info' });
        return;
      }
      if (!this.reserva.fecha_ini) {
        this.alertService.show("La fecha del Full Day es obligatoria", { duration: 5000, type: 'info' });
        return;
      }
      if (!this.reserva.total || Number(this.reserva.total) <= 0) {
        this.alertService.show("El monto no puede ser vacío o cero", { duration: 5000, type: 'info' });
        return;
      }
      if (this.reserva.anticipo && Number(this.reserva.anticipo) > 0 && (!this.reserva.id || this.isEditFullDay)) {
        if (!this.reserva.forma_pago_id) {
          this.alertService.show("Debe seleccionar la forma de pago del anticipo", { duration: 5000, type: 'info' });
          return;
        }
      }

      if (this.nuevoServicio.producto_id && Number(this.nuevoServicio.cantidad) > 0) {
        this.calcularTotalNuevoServicio();
        if (!this.reserva.transacciones) {
          this.reserva.transacciones = [];
        }
        this.reserva.transacciones.push({ ...this.nuevoServicio });
        this.inicializarNuevoServicio();
      }

      this.botonGuardarDirectiva?.deshabilitarFormBoton();
      if (this.reserva.id > 0) {
        this.modificarFullDay();
      } else {
        this.crearFullDay();
      }
    } else {
      this.alertService.show("Debe llenar todos los campos requeridos", { duration: 5000, type: 'info' });
    }
  }

  crearFullDay(): void {
    const cantAdulto = Number(this.reserva.cantidad_adulto) || 0;
    const precioAdulto = Number(this.reserva.precio_unit_adulto) || 0;
    const cantNinio = Number(this.reserva.cantidad_ninio) || 0;
    const precioNinio = Number(this.reserva.precio_unit_ninio) || 0;
    const totalEntrada = (cantAdulto * precioAdulto) + (cantNinio * precioNinio);

    const fechaFormateada = moment(this.reserva.fecha_ini).format('YYYY-MM-DD');

    const payload: any = {
      ...this.reserva,
      habitacion_id: null,
      is_full_day: 1,
      fecha_ini: fechaFormateada,
      fecha_fin: fechaFormateada,
      email: this.reserva.correo || (this.reserva as any).email || '',
      cantidad: 1,
      precio_unitario: totalEntrada,
      cantidad_huesped: (cantAdulto + cantNinio) || 1,
      transacciones: this.reserva.transacciones || []
    };

    this.fullDayService.crear(payload).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          this.reserva = Object.assign(new FullDayModel(), data.reserva);
          this.balance.set(data.balance);
          this.reserva.anticipo = this.getYaPagado();
          this.reserva.detalle_anticipo = '';
          this.reserva.fecha_ini = moment(this.reserva.fecha_ini).format("YYYY-MM-DD");
          this.reserva.fecha_fin = moment(this.reserva.fecha_fin).format("YYYY-MM-DD");

          this.isDisabled = true;
          this.mnuVisibleOpciones = true;
          this.btnVisibleCancel = false;
          this.btnVisibleSave = false;
          this.isVisibleTabs = true;

          this.reserva.transacciones = data.transacciones || [];
          this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);

          this.comunicacionService.loadBitacoraSignal.set({ reserva_id: this.reserva.id, trigger: Date.now() });
          this.triggerEstadoReserva.set(Date.now());
          this.alertService.show("Full Day registrado con éxito", { duration: 5000, type: 'success' });
        } else {
          this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
        }
        this.botonGuardarDirectiva?.habilitarFormBoton();
      },
      error: (error) => {
        console.error('Error al crear Full Day:', error);
        this.botonGuardarDirectiva?.habilitarFormBoton();
      }
    });
  }

  modificarFullDay(): void {
    const cantAdulto = Number(this.reserva.cantidad_adulto) || 0;
    const precioAdulto = Number(this.reserva.precio_unit_adulto) || 0;
    const cantNinio = Number(this.reserva.cantidad_ninio) || 0;
    const precioNinio = Number(this.reserva.precio_unit_ninio) || 0;
    const totalEntrada = (cantAdulto * precioAdulto) + (cantNinio * precioNinio);

    const fechaFormateada = moment(this.reserva.fecha_ini).format('YYYY-MM-DD');

    const payload: any = {
      ...this.reserva,
      habitacion_id: null,
      is_full_day: 1,
      fecha_ini: fechaFormateada,
      fecha_fin: fechaFormateada,
      email: this.reserva.correo || (this.reserva as any).email || '',
      cantidad: 1,
      precio_unitario: totalEntrada,
      cantidad_huesped: (cantAdulto + cantNinio) || 1,
      transacciones: this.reserva.transacciones || []
    };

    this.fullDayService.modificar(payload).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          this.reserva = Object.assign(new FullDayModel(), data.reserva);
          this.balance.set(data.balance);
          this.reserva.anticipo = this.getYaPagado();
          this.reserva.detalle_anticipo = '';
          this.reserva.fecha_ini = moment(this.reserva.fecha_ini).format("YYYY-MM-DD");
          this.reserva.fecha_fin = moment(this.reserva.fecha_fin).format("YYYY-MM-DD");

          this.isEditFullDay = false;
          this.isDisabled = true;
          this.mnuVisibleOpciones = true;
          this.btnVisibleCancel = false;
          this.btnVisibleSave = false;

          this.reserva.transacciones = data.transacciones || [];
          this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);

          this.comunicacionService.loadBitacoraSignal.set({ reserva_id: this.reserva.id, trigger: Date.now() });
          this.triggerEstadoReserva.set(Date.now());
          this.alertService.show("Full Day modificado con éxito", { duration: 5000, type: 'success' });
        } else {
          this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
        }
        this.botonGuardarDirectiva?.habilitarFormBoton();
      },
      error: (error) => {
        console.error('Error al modificar Full Day:', error);
        this.botonGuardarDirectiva?.habilitarFormBoton();
      }
    });
  }

  eliminarFullDay(enterAnimationDuration: string, exitAnimationDuration: string): void {
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: this.reserva.id
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.botonGuardarDirectiva?.deshabilitarFormBoton();
        this.fullDayService.eliminar(this.reserva.id).subscribe({
          next: (res) => {
            if (res.correcto) {
              this.alertService.show("Full Day eliminado correctamente", { duration: 5000, type: 'success' });
              this.dialogRef.close({ action: 'deleted', id: this.reserva.id });
            } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
              this.botonGuardarDirectiva?.habilitarFormBoton();
            }
          },
          error: (err) => {
            console.error('Error al eliminar Full Day:', err);
            this.botonGuardarDirectiva?.habilitarFormBoton();
          }
        });
      }
    });
  }

  mostrarVisorPdf(pdf_base64: string): void {
    if (this.reserva && this.reserva.id > 0) {
      if (!pdf_base64) {
        this.documentoService.obtenerVoucherReserva(this.reserva.id).subscribe({
          next: (res) => {
            this.cargarVisorPdf(res, "Comprobante Full Day");
          }
        });
      } else {
        this.cargarVisorPdf(pdf_base64, "Comprobante Full Day");
      }
    }
  }

  private cargarVisorPdf(pdf_base64: string, titulo_documento: string): void {
    this.dialogVoucherRef = this.dialog.open(PdfViewerComponent, {
      width: '50vw',
      maxWidth: '95vw',
      height: '80vh',
      data: { pdf_base64, titulo_documento },
      disableClose: true,
    });
  }

  onDniEnter(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.verificarNroDocumento(this.reserva.nro_documento);
    if (this.cboTipoDocId) {
      this.cboTipoDocId.focus();
    }
  }

  verificarNroDocumento(nro_documento: string): void {
    if (this.isDisabled) return;
    const doc = nro_documento ? (nro_documento + '').trim() : '';
    if (!doc) return;

    this.isSearchingDni = true;
    this.personaService.personaPorNroDocumento(doc).subscribe({
      next: (res: any) => {
        this.isSearchingDni = false;
        if (res && typeof res === 'object' && Object.keys(res).length > 0) {
          const {
            tipo_doc_id,
            nacionalidad_id,
            nombre,
            primer_apellido,
            segundo_apellido,
            telefono,
            email,
            id
          } = res;

          this.reserva.tipo_doc_id = tipo_doc_id ? Number(tipo_doc_id) : (this.reserva.tipo_doc_id || 1);
          this.reserva.nacionalidad_id = nacionalidad_id ? Number(nacionalidad_id) : (this.reserva.nacionalidad_id || 1);
          this.reserva.nombre = nombre || '';
          this.reserva.primer_apellido = primer_apellido || '';
          this.reserva.segundo_apellido = segundo_apellido || '';
          this.reserva.telefono = telefono || '';
          this.reserva.correo = email || res.correo || '';
          if (id) {
            this.reserva.cliente_id = Number(id);
          }
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSearchingDni = false;
        console.error('Error al verificar documento:', error);
        this.cdr.detectChanges();
      }
    });
  }

  calcularTotal(): void {
    const cantAdulto = Number(this.reserva.cantidad_adulto) || 0;
    const precioAdulto = Number(this.reserva.precio_unit_adulto) || 0;
    const cantNinio = Number(this.reserva.cantidad_ninio) || 0;
    const precioNinio = Number(this.reserva.precio_unit_ninio) || 0;

    const totalEntrada = (cantAdulto * precioAdulto) + (cantNinio * precioNinio);
    this.reserva.total = Math.max(0, Math.round(totalEntrada * 100) / 100);
    this.validarAnticipo();
  }

  getYaPagado(): number {
    if (!this.reserva || !this.reserva.id || this.reserva.id <= 0) {
      return 0;
    }
    const totalReserva = Number(this.reserva.total) || 0;
    let pago = 0;
    if (this.balance && this.balance() && this.balance().pago !== undefined && this.balance().pago !== null) {
      pago = Number(this.balance().pago) || 0;
    } else {
      const saldo = Number(this.reserva.saldo) || 0;
      pago = Math.max(0, totalReserva - saldo);
    }
    return Math.min(totalReserva, Math.max(0, Number(pago.toFixed(2))));
  }

  validarAnticipo(): void {
    const total = Number(this.reserva.total) || 0;
    let anticipo = Number(this.reserva.anticipo) || 0;
    if (anticipo < 0) {
      this.reserva.anticipo = 0;
      anticipo = 0;
    }
    const yaPagado = this.getYaPagado();
    const maxPermitido = this.reserva.id > 0 ? Math.max(0, Number((total - yaPagado).toFixed(2))) : total;
    if (anticipo > maxPermitido) {
      this.reserva.anticipo = maxPermitido;
      anticipo = maxPermitido;
    }
    if (anticipo > 0 && !this.reserva.forma_pago_id && this.forma_pagos && this.forma_pagos.length > 0) {
      const efectivo = this.forma_pagos.find(f => f.descripcion && f.descripcion.toLowerCase().includes('efectivo'));
      this.reserva.forma_pago_id = efectivo ? efectivo.id : this.forma_pagos[0].id;
    }
  }

  focusFormaPagoAnticipo(): void {
    if (this.cboFormaPagoAnticipo?.focus) {
      this.cboFormaPagoAnticipo.focus();
    }
  }

  getSaldoCalculado(): number {
    const totalReserva = Number(this.reserva?.total) || 0;
    const yaPagado = this.getYaPagado();
    const anticipo = (this.isEditFullDay || !this.reserva?.id) ? (Number(this.reserva?.anticipo) || 0) : 0;
    const saldo = totalReserva - yaPagado - anticipo;
    return saldo > 0 ? Number(saldo.toFixed(2)) : 0;
  }

  // BEGIN SERVICIOS EXTRA / TRANSACCIONES
  inicializarNuevoServicio(): void {
    this.nuevoServicio = new TransaccionModel();
    this.nuevoServicio.cantidad = 1;
    this.nuevoServicio.precio_unitario = 0;
    this.nuevoServicio.total = 0;
    this.filtrarProductos();
  }

  filtrarProductos(): void {
    if (this.nuevoServicio.categoria_id) {
      this.productos_filtrados = this.productos.filter(p => p.categoria_id === this.nuevoServicio.categoria_id);
    } else {
      this.productos_filtrados = [...this.productos];
    }
    if (this.nuevoServicio.producto_id && !this.productos_filtrados.some(p => p.id === this.nuevoServicio.producto_id)) {
      this.nuevoServicio.producto_id = null;
      this.nuevoServicio.precio_unitario = 0;
      this.nuevoServicio.total = 0;
    }
  }

  onProductoServicioChange(event: any): void {
    const selectedId = event?.value !== undefined ? event.value : event;
    const selectedProducto = event?.object || this.productos.find(p => p.id === selectedId);
    if (selectedProducto) {
      this.nuevoServicio.producto_id = selectedProducto.id;
      this.nuevoServicio.descripcion = selectedProducto.descripcion;
      this.nuevoServicio.categoria_id = selectedProducto.categoria_id;
      this.nuevoServicio.precio_unitario = Number(selectedProducto.precio) || 0;
      if (!this.nuevoServicio.cantidad || this.nuevoServicio.cantidad <= 0) {
        this.nuevoServicio.cantidad = 1;
      }
      this.calcularTotalNuevoServicio();
    }
  }

  calcularTotalNuevoServicio(): void {
    const cantidad = Number(this.nuevoServicio.cantidad) || 0;
    const precio = Number(this.nuevoServicio.precio_unitario) || 0;
    this.nuevoServicio.total = Math.round((cantidad * precio) * 100) / 100;
  }

  agregarServicioAdicional(): void {
    if (!this.nuevoServicio.producto_id) {
      this.alertService.show("Seleccione un producto", { duration: 3000, type: 'info' });
      return;
    }
    const cantidad = Number(this.nuevoServicio.cantidad) || 0;
    if (cantidad <= 0) {
      this.alertService.show("La cantidad debe ser mayor a 0", { duration: 3000, type: 'info' });
      return;
    }
    const precio = Number(this.nuevoServicio.precio_unitario) || 0;
    if (precio < 0) {
      this.alertService.show("El monto no puede ser negativo", { duration: 3000, type: 'info' });
      return;
    }

    this.calcularTotalNuevoServicio();

    if (this.reserva && this.reserva.id > 0) {
      this.isProcessingServicio = true;
      const itemAGuardar = { ...this.nuevoServicio, reserva_id: this.reserva.id };
      this.transaccionService.crear(itemAGuardar).subscribe({
        next: (res) => {
          this.isProcessingServicio = false;
          if (res.correcto) {
            const data = JSON.parse(res.dato);
            this.reserva.transacciones = data.transacciones as TransaccionModel[];
            this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
            this.balance.set(data.balance);
            this.reserva.saldo = data.balance.saldo;
            this.comunicacionService.loadBitacoraSignal.set({ reserva_id: this.reserva.id, trigger: Date.now() });
            this.inicializarNuevoServicio();
          } else {
            this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          }
        },
        error: (err) => {
          this.isProcessingServicio = false;
          console.error(err);
          this.alertService.show("Error al guardar el consumo adicional", { duration: 5000, type: 'info' });
        }
      });
    } else {
      this.isProcessingServicio = true;
      if (!this.reserva.transacciones) {
        this.reserva.transacciones = [];
      }
      this.reserva.transacciones.push({ ...this.nuevoServicio });
      this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
      this.inicializarNuevoServicio();
      setTimeout(() => {
        this.isProcessingServicio = false;
      }, 300);
    }
  }

  eliminarServicioAdicional(index: number, item: TransaccionModel): void {
    if (item.id && item.id > 0) {
      this.transaccionService.eliminar(item.id).subscribe({
        next: (res) => {
          if (res.correcto) {
            const data = JSON.parse(res.dato);
            this.reserva.transacciones = data.transacciones as TransaccionModel[];
            this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
            this.balance.set(data.balance);
            this.reserva.saldo = data.balance.saldo;
            this.comunicacionService.loadBitacoraSignal.set({ reserva_id: this.reserva.id, trigger: Date.now() });
            this.alertService.show("Consumo adicional eliminado", { duration: 3000, type: 'success' });
          } else {
            this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          }
        }
      });
    } else {
      this.reserva.transacciones.splice(index, 1);
      this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
    }
  }

  getTotalServiciosAdicionales(): number {
    if (!this.reserva?.transacciones || this.reserva.transacciones.length === 0) return 0;
    return this.reserva.transacciones.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  }

  getTotalGeneral(): number {
    const totalPrecios = Number(this.reserva?.total) || 0;
    const totalServicios = this.getTotalServiciosAdicionales();
    return Math.round((totalPrecios + totalServicios) * 100) / 100;
  }

  cargarDatosTransaccion(reserva_id: number): void {
    this.transaccionService.listarTransaccionesPorReservaId(reserva_id).subscribe({
      next: (res) => {
        this.reserva.transacciones = res;
        this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
        this.dataSourceTransaccion.paginator = this.paginator;
        if (this.reserva.transacciones && this.reserva.transacciones.length > 0) {
          this.isVisibleServiciosExtra = true;
        }
      }
    });
  }

  bloquearNegativos(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === '+' || event.key === '.' || event.key === ',' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

  bloquearSignosNegativos(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }
}
