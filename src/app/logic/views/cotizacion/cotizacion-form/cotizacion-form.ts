// MODELS
import { CotizacionModel } from '../../../models/cotizacion.model';
import { CotizacionDetalleModel } from '../../../models/cotizacion_detalle.model';
import { TarifaModel } from '../../../models/tarifa.model';
import { TipoDocumentoModel } from '../../../../base/models/tipodocumento.model';
import { CategoriaModel } from '../../../models/categoria.model';
import { ProductoModel } from '../../../models/producto.model';

// SERVICES
import { CotizacionService } from '../../../services/cotizacion.service';
import { CotizacionDetalleService } from '../../../services/cotizacion_detalle.service';
import { TarifaService } from '../../../services/tarifa.service';
import { TipoDocumentoService } from '../../../../base/services/tipodocumento.service';
import { CategoriaService } from '../../../services/categoria.service';
import { ProductoService } from '../../../services/producto.service';
import { AlertService } from '../../../../base/services/local/alert.service';
import { PersonaService } from '../../../../base/services/persona.service';

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
import { MatDatepickerModule } from '@angular/material/datepicker';

// DIRECTIVAS Y COMPONENTES
import { PreventEnterSubmitDirective } from '../../../../base/shared/directives/prevent-enter-submit.directive';
import { PreventEnterSelectDirective } from '../../../../base/shared/directives/prevent-enter-select.directive';
import { AnimarPerderFocoDirective } from '../../../../base/shared/directives/animar-perder-foco.directive';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';
import { SelectSearchComponent } from '../../../../base/shared/views/select-search/select-search';

// VARIOS
import { Component, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import moment from 'moment';

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
    PreventEnterSelectDirective,
    AnimarPerderFocoDirective,
    BotonGuardarDirective,
    SelectSearchComponent
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
  tarifasSelect: any[] = [];
  categorias: CategoriaModel[] = [];
  productos: ProductoModel[] = [];
  productos_filtrados: ProductoModel[] = [];

  // CARD 3: PRECIOS (is_base = 1)
  precioBase: CotizacionDetalleModel = new CotizacionDetalleModel();

  // CARD 4: SERVICIOS ADICIONALES (is_base = 0)
  nuevoServicio: CotizacionDetalleModel = new CotizacionDetalleModel();
  serviciosAdicionales: CotizacionDetalleModel[] = [];
  dataSourceServicios: MatTableDataSource<CotizacionDetalleModel> = new MatTableDataSource<CotizacionDetalleModel>([]);
  displayedColumnsServicios: string[] = ['accion', 'descripcion', 'cantidad', 'precio_unitario', 'total'];
  isProcessingServicio: boolean = false;
  isVisibleServiciosExtra: boolean = false;
  isSearchingDni: boolean = false;
  @ViewChild('cboTipoDocId') cboTipoDocId: any;

  toggleServiciosExtra(): void {
    this.isVisibleServiciosExtra = !this.isVisibleServiciosExtra;
  }

  constructor(
    public dialogRef: MatDialogRef<CotizacionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private cotizacionService: CotizacionService,
    private cotizacionDetalleService: CotizacionDetalleService,
    private tarifaService: TarifaService,
    private tipoDocumentoService: TipoDocumentoService,
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private alertService: AlertService,
    private personaService: PersonaService,
    private cdr: ChangeDetectorRef
  ) {
    this.cotizacion = data.cotizacion;
    this.cotizaciones = data.cotizaciones;
    this.inicializarPrecioBase();
    this.inicializarNuevoServicio();
    this.normalizarFechasParaFormulario();
    this.cargarDatosIniciales();
    this.dialogRef.backdropClick().subscribe(x => { });
  }

  inicializarPrecioBase() {
    this.precioBase = new CotizacionDetalleModel();
    this.precioBase.cotizacion_id = this.cotizacion?.id || 0;
    this.precioBase.is_base = 1;
    this.precioBase.tarifa_id = null;
    this.precioBase.cantidad_adulto = 1;
    this.precioBase.precio_unit_adulto = 0;
    this.precioBase.cantidad_ninio = 0;
    this.precioBase.precio_unit_ninio = 0;
    this.precioBase.total = 0;
    this.precioBase.subtotal = 0;
  }

  inicializarNuevoServicio() {
    this.nuevoServicio = new CotizacionDetalleModel();
    this.nuevoServicio.cotizacion_id = this.cotizacion?.id || 0;
    this.nuevoServicio.is_base = 0;
    this.nuevoServicio.cantidad = 1;
    this.nuevoServicio.precio_unitario = 0;
    this.nuevoServicio.total = 0;
    this.nuevoServicio.subtotal = 0;
    this.nuevoServicio.producto_id = null;
    this.nuevoServicio.categoria_id = null;
    this.filtrarProductos();
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
      tarifas: this.tarifaService.listar(),
      categorias: this.categoriaService.listar(),
      productos: this.productoService.listar()
    }).subscribe({
      next: (res) => {
        this.tiposDocumento = res.tiposDoc || [];
        this.tarifas = res.tarifas || [];
        this.categorias = res.categorias || [];
        this.productos = res.productos || [];
        this.prepararTarifasParaSelect();
        this.filtrarProductos();

        if (this.cotizacion.id > 0) {
          this.cargarDetallesExistentes();
        } else {
          this.inicializarPrecioBase();
          this.serviciosAdicionales = [];
          this.dataSourceServicios = new MatTableDataSource<CotizacionDetalleModel>(this.serviciosAdicionales);
        }
      },
      error: (err) => console.error("Error al cargar datos iniciales:", err)
    });
  }

  prepararTarifasParaSelect() {
    this.tarifasSelect = this.tarifas.map(t => ({
      ...t,
      descripcion_completa: `${t.servicio} - ${t.tipo_hospedaje || ''} (Ad: Bs. ${Number(t.tarifa_adulto || 0).toFixed(2)}${t.tarifa_ninio ? ' | Niñ: Bs. ' + Number(t.tarifa_ninio).toFixed(2) : ''})`
    }));
  }

  cargarDetallesExistentes() {
    this.cotizacionDetalleService.listar(this.cotizacion.id).subscribe({
      next: (res: any) => {
        const lista: CotizacionDetalleModel[] = Array.isArray(res) ? res : [];

        // Buscar el ítem base: el que tenga is_base == 1, o el que tenga tarifa_id sin producto_id
        let baseIndex = lista.findIndex(d => Number(d.is_base) === 1);
        if (baseIndex === -1 && lista.length > 0) {
          baseIndex = lista.findIndex(d => d.tarifa_id && (!d.producto_id || d.producto_id === 0));
          if (baseIndex === -1) baseIndex = 0;
        }

        if (baseIndex >= 0 && baseIndex < lista.length) {
          const itemBase = lista[baseIndex];
          this.precioBase = {
            ...itemBase,
            is_base: 1,
            cantidad_adulto: Number(itemBase.cantidad_adulto) || 1,
            precio_unit_adulto: Number(itemBase.precio_unit_adulto) || 0,
            cantidad_ninio: Number(itemBase.cantidad_ninio) || 0,
            precio_unit_ninio: Number(itemBase.precio_unit_ninio) || 0
          };
          this.calcularTotalPrecios();

          // El resto son servicios adicionales
          this.serviciosAdicionales = lista.filter((_, idx) => idx !== baseIndex).map(s => {
            const cant = Number(s.cantidad) || 1;
            const pu = Number(s.precio_unitario) || 0;
            const tot = Number(s.subtotal) || (cant * pu);
            return {
              ...s,
              is_base: 0,
              cantidad: cant,
              precio_unitario: pu,
              total: tot,
              subtotal: tot,
              producto: s.producto || s.servicio || s.detalle || ''
            };
          });
          this.isVisibleServiciosExtra = this.serviciosAdicionales.length > 0;
        } else {
          this.inicializarPrecioBase();
          this.serviciosAdicionales = [];
          this.isVisibleServiciosExtra = false;
        }

        this.dataSourceServicios = new MatTableDataSource<CotizacionDetalleModel>(this.serviciosAdicionales);
      },
      error: (err) => {
        console.error("Error al cargar detalles existentes:", err);
        this.inicializarPrecioBase();
        this.serviciosAdicionales = [];
        this.dataSourceServicios = new MatTableDataSource<CotizacionDetalleModel>(this.serviciosAdicionales);
      }
    });
  }

  // MÉTODOS PARA SECCIÓN PRECIOS
  onTarifaChange(event: any) {
    const selectedId = event?.value !== undefined ? event.value : event;
    const tarifa = event?.object || this.tarifas.find(t => t.id === selectedId);
    if (tarifa) {
      this.precioBase.tarifa_id = tarifa.id;
      this.precioBase.servicio = tarifa.servicio;
      this.precioBase.tipo_hospedaje = tarifa.tipo_hospedaje;
      this.precioBase.paquete = tarifa.paquete;
      this.precioBase.precio_unit_adulto = Number(tarifa.tarifa_adulto) || 0;
      this.precioBase.precio_unit_ninio = Number(tarifa.tarifa_ninio) || 0;
    } else {
      this.precioBase.tarifa_id = null;
      this.precioBase.servicio = '';
      this.precioBase.tipo_hospedaje = '';
      this.precioBase.paquete = '';
      this.precioBase.precio_unit_adulto = 0;
      this.precioBase.precio_unit_ninio = 0;
    }
    this.calcularTotalPrecios();
  }

  abrirModalSeleccionarTarifa() {
    const dialogRef = this.dialog.open(SeleccionarTarifaModalComponent, {
      data: {
        tarifas: this.tarifas,
        tarifaActualId: this.precioBase.tarifa_id
      },
      width: '95vw',
      maxWidth: '900px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((tarifaSeleccionada: TarifaModel) => {
      if (tarifaSeleccionada) {
        this.precioBase.tarifa_id = tarifaSeleccionada.id;
        this.precioBase.servicio = tarifaSeleccionada.servicio;
        this.precioBase.tipo_hospedaje = tarifaSeleccionada.tipo_hospedaje;
        this.precioBase.paquete = tarifaSeleccionada.paquete;
        this.precioBase.precio_unit_adulto = Number(tarifaSeleccionada.tarifa_adulto) || 0;
        this.precioBase.precio_unit_ninio = Number(tarifaSeleccionada.tarifa_ninio) || 0;
        this.calcularTotalPrecios();
      }
    });
  }

  calcularTotalPrecios() {
    const cantAd = Math.max(0, Number(this.precioBase.cantidad_adulto) || 0);
    const puAd = Math.max(0, Number(this.precioBase.precio_unit_adulto) || 0);
    const cantNi = Math.max(0, Number(this.precioBase.cantidad_ninio) || 0);
    const puNi = Math.max(0, Number(this.precioBase.precio_unit_ninio) || 0);

    this.precioBase.total = Math.round(((cantAd * puAd) + (cantNi * puNi)) * 100) / 100;
    this.precioBase.subtotal = this.precioBase.total;
  }

  // MÉTODOS PARA SERVICIOS ADICIONALES
  filtrarProductos() {
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

  onProductoServicioChange(event: any) {
    const selectedId = event?.value !== undefined ? event.value : event;
    const selectedProducto = event?.object || this.productos.find(p => p.id === selectedId);
    if (selectedProducto) {
      this.nuevoServicio.producto_id = selectedProducto.id;
      this.nuevoServicio.producto = selectedProducto.descripcion;
      this.nuevoServicio.servicio = selectedProducto.descripcion;
      this.nuevoServicio.detalle = selectedProducto.descripcion;
      this.nuevoServicio.categoria_id = selectedProducto.categoria_id;
      this.nuevoServicio.precio_unitario = Number(selectedProducto.precio) || 0;
      if (!this.nuevoServicio.cantidad || this.nuevoServicio.cantidad <= 0) {
        this.nuevoServicio.cantidad = 1;
      }
      this.calcularTotalNuevoServicio();
    }
  }

  calcularTotalNuevoServicio() {
    const cantidad = Number(this.nuevoServicio.cantidad) || 0;
    const precio = Number(this.nuevoServicio.precio_unitario) || 0;
    this.nuevoServicio.total = Math.round((cantidad * precio) * 100) / 100;
    this.nuevoServicio.subtotal = this.nuevoServicio.total;
  }

  agregarServicioAdicional() {
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

    this.serviciosAdicionales.push({
      ...this.nuevoServicio,
      is_base: 0,
      producto: this.nuevoServicio.producto || this.nuevoServicio.detalle || ''
    });
    this.serviciosAdicionales = [...this.serviciosAdicionales];
    this.dataSourceServicios = new MatTableDataSource<CotizacionDetalleModel>(this.serviciosAdicionales);
    this.isVisibleServiciosExtra = true;
    this.inicializarNuevoServicio();
  }

  eliminarServicioAdicional(index: number, item: CotizacionDetalleModel) {
    if (item.id && item.id > 0 && this.cotizacion && this.cotizacion.id > 0) {
      this.cotizacionDetalleService.eliminar(item.id).subscribe({
        next: (res) => {
          if (res.correcto) {
            this.serviciosAdicionales.splice(index, 1);
            this.serviciosAdicionales = [...this.serviciosAdicionales];
            this.dataSourceServicios = new MatTableDataSource<CotizacionDetalleModel>(this.serviciosAdicionales);
            this.alertService.show("Servicio adicional eliminado", { duration: 3000, type: 'success' });
          } else {
            this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          }
        },
        error: (err) => {
          console.error(err);
          this.serviciosAdicionales.splice(index, 1);
          this.serviciosAdicionales = [...this.serviciosAdicionales];
          this.dataSourceServicios = new MatTableDataSource<CotizacionDetalleModel>(this.serviciosAdicionales);
        }
      });
    } else {
      this.serviciosAdicionales.splice(index, 1);
      this.serviciosAdicionales = [...this.serviciosAdicionales];
      this.dataSourceServicios = new MatTableDataSource<CotizacionDetalleModel>(this.serviciosAdicionales);
    }
  }

  // TOTALES
  getTotalServiciosAdicionales(): number {
    if (!this.serviciosAdicionales || this.serviciosAdicionales.length === 0) return 0;
    return this.serviciosAdicionales.reduce((acc, curr) => acc + (Number(curr.total) || (Number(curr.cantidad) * Number(curr.precio_unitario)) || 0), 0);
  }

  getTotalGeneral(): number {
    const totalPrecios = Number(this.precioBase?.total) || 0;
    const totalServicios = this.getTotalServiciosAdicionales();
    return Math.round((totalPrecios + totalServicios) * 100) / 100;
  }

  obtenerNombreTarifa(tarifa_id: any): string {
    if (!tarifa_id) return '';
    const t = this.tarifas.find(x => x.id === Number(tarifa_id));
    return t ? t.servicio : '';
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

  onDniEnter(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.verificarNroDocumento(this.cotizacion.dni);
    if (this.cboTipoDocId) {
      this.cboTipoDocId.focus();
    }
  }

  verificarNroDocumento(nro_documento: string) {
    const doc = nro_documento ? (nro_documento + '').trim() : '';
    if (!doc) return;

    this.isSearchingDni = true;
    this.personaService.personaPorNroDocumento(doc).subscribe({
      next: (res: any) => {
        this.isSearchingDni = false;
        if (res && typeof res === 'object' && Object.keys(res).length > 0) {
          const {
            tipo_doc_id,
            nombre,
            primer_apellido,
            segundo_apellido,
            telefono
          } = res;

          this.cotizacion.tipo_doc_id = tipo_doc_id ? Number(tipo_doc_id) : (this.cotizacion.tipo_doc_id || 1);
          this.cotizacion.nombre = nombre || '';
          this.cotizacion.primer_apellido = primer_apellido || '';
          this.cotizacion.segundo_apellido = segundo_apellido || '';
          this.cotizacion.telefono = telefono || '';
        } else {
          // Cliente nuevo: asegurar valores válidos para selectores requeridos
          if (!this.cotizacion.tipo_doc_id) {
            this.cotizacion.tipo_doc_id = 1;
          }
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSearchingDni = false;
        console.error('Error al verificar documento:', error);
        if (!this.cotizacion.tipo_doc_id) this.cotizacion.tipo_doc_id = 1;
        this.cdr.detectChanges();
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

  submit(f: NgForm) {
    if (f.valid) {
      if (!this.cotizacion.nombre || !this.cotizacion.nombre.trim()) {
        this.alertService.show("El nombre es obligatorio", { duration: 4000, type: 'warning' });
        return;
      }

      if (!this.cotizacion.primer_apellido || !this.cotizacion.primer_apellido.trim()) {
        this.alertService.show("El primer apellido es obligatorio", { duration: 4000, type: 'warning' });
        return;
      }

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

      const totalGeneral = this.getTotalGeneral();
      if (totalGeneral <= 0) {
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

      // Construir detalles
      const detallesAGuardar: CotizacionDetalleModel[] = [];

      // 1. Tarifa base (Precios)
      const cantAd = Number(this.precioBase.cantidad_adulto) || 0;
      const puAd = Number(this.precioBase.precio_unit_adulto) || 0;
      const cantNi = Number(this.precioBase.cantidad_ninio) || 0;
      const puNi = Number(this.precioBase.precio_unit_ninio) || 0;
      const subBase = Number(this.precioBase.total) || ((cantAd * puAd) + (cantNi * puNi));

      const nomServicio = this.precioBase.servicio && this.precioBase.servicio.trim() !== ''
        ? this.precioBase.servicio.trim()
        : (this.obtenerNombreTarifa(this.precioBase.tarifa_id) || 'Hospedaje');

      detallesAGuardar.push({
        id: this.precioBase.id || 0,
        cotizacion_id: this.cotizacion.id || 0,
        tarifa_id: this.precioBase.tarifa_id ? Number(this.precioBase.tarifa_id) : null,
        producto_id: null,
        cantidad: 1,
        precio_unitario: 0,
        cantidad_adulto: cantAd,
        precio_unit_adulto: puAd,
        cantidad_ninio: cantNi,
        precio_unit_ninio: puNi,
        precio_mascota: 0,
        precio_extra: 0,
        subtotal: subBase,
        servicio: nomServicio,
        detalle: this.precioBase.detalle && this.precioBase.detalle.trim() !== '' ? this.precioBase.detalle.trim() : nomServicio,
        tipo_hospedaje: this.precioBase.tipo_hospedaje || '',
        paquete: this.precioBase.paquete || '',
        is_base: 1,
        eliminado: 0
      } as any);

      // 2. Servicios adicionales
      for (const s of this.serviciosAdicionales) {
        const cant = Number(s.cantidad) || 1;
        const pu = Number(s.precio_unitario) || 0;
        const sub = Number(s.total) || (cant * pu);
        const desc = (s.producto || s.servicio || s.detalle || 'Servicio adicional').trim();

        detallesAGuardar.push({
          id: s.id || 0,
          cotizacion_id: this.cotizacion.id || 0,
          tarifa_id: null,
          producto_id: s.producto_id ? Number(s.producto_id) : null,
          cantidad: cant,
          precio_unitario: pu,
          cantidad_adulto: 0,
          precio_unit_adulto: 0,
          cantidad_ninio: 0,
          precio_unit_ninio: 0,
          precio_mascota: 0,
          precio_extra: 0,
          subtotal: sub,
          servicio: desc,
          producto: desc,
          detalle: desc,
          tipo_hospedaje: '',
          paquete: '',
          is_base: 0,
          eliminado: 0
        } as any);
      }

      this.cotizacion.detalles = detallesAGuardar;

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
