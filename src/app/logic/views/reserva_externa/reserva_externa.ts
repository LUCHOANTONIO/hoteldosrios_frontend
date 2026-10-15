import { Component, OnInit, signal, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';
import { forkJoin, Observable } from 'rxjs';
import { Router } from '@angular/router';
import moment from 'moment';

// MODELS
import { HabitacionModel } from '../../models/habitacion.model';
import { TipoHabitacionModel } from '../../models/tipo_habitacion.model';
import { ReservaModel } from '../../models/reserva.model';
import { CotizacionModel } from '../../models/cotizacion.model';
import { TipoDocumentoModel } from '../../../base/models/tipodocumento.model';
import { PaisModel } from '../../models/pais.model';
import { CanalReservaModel } from '../../models/canal_reserva.model';
import { FormaPagoModel } from '../../models/forma_pago.model';
import { EstadoCivilModel } from '../../../base/models/estadocivil.model';
import { TipoHuespedModel } from '../../models/tipo_huesped.model';
import { MotivoModel } from '../../models/motivo.model';
import { ProductoModel } from '../../models/producto.model';

// SERVICES
import { HabitacionService } from '../../services/habitacion.service';
import { TipoHabitacionService } from '../../services/tipo_habitacion.service';
import { ReservaService } from '../../services/reserva.service';
import { CotizacionService } from '../../services/cotizacion.service';
import { TipoDocumentoService } from '../../../base/services/tipodocumento.service';
import { PaisService } from '../../services/pais.service';
import { CanalReservaService } from '../../services/canal_reserva.service';
import { DocumentoService } from '../../services/documento.service';
import { AlertService } from '../../../base/services/local/alert.service';
import { FormaPagoService } from '../../services/forma_pago.service';
import { TipoHuespedService } from '../../services/tipo_huesped.service';
import { MotivoService } from '../../services/motivo.service';
import { ProductoService } from '../../services/producto.service';
import { EstadoCivilService } from '../../../base/services/estadocivil.service';
import { ComunicacionService } from '../../services/local/comunicacion.service';

// SUBCOMPONENTS / FORMS
import { ReservaFormComponent } from '../timeline/reserva-form/reserva-form';
import { CotizacionFormComponent } from '../cotizacion/cotizacion-form/cotizacion-form';
import { PdfViewerComponent } from '../../shared/views/pdf-viewer/pdf-viewer';

export interface HabitacionDisponibleCard {
  categoria_id: number;
  categoria: string;
  precio: number | string;
  cantidad_disponible: number;
  id: number;
  habitacion_id?: number;
  tipo_habitacion_id?: number;
  tipo_habitacion: string;
  nro_habitacion?: string;
  descripcion?: string;
  piso?: any;
  color?: string;
  color_estado?: string;
  estado_habitacion?: string;
  esFullDay?: boolean;
  esCamping?: boolean;
}

@Component({
  selector: 'app-reserva-externa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
  templateUrl: './reserva_externa.html',
  styleUrls: ['./reserva_externa.scss']
})
export class ReservaExternaComponent implements OnInit {
  // Tabs: 'catalogo' | 'reservas' | 'cotizaciones'
  vistaActiva: 'catalogo' | 'reservas' | 'cotizaciones' = 'catalogo';
  cargando: boolean = true;
  buscando: boolean = false;

  // Filter Dates
  fechaLlegada: Date = new Date();
  fechaSalida: Date = new Date();

  // Raw data from API
  habitaciones: HabitacionModel[] = [];
  tipoHabitaciones: TipoHabitacionModel[] = [];
  reservas: ReservaModel[] = [];
  cotizaciones: CotizacionModel[] = [];
  tipoDocumentos: TipoDocumentoModel[] = [];
  paises: PaisModel[] = [];
  canalReservas: CanalReservaModel[] = [];
  productos: ProductoModel[] = [];
  formaPagos: FormaPagoModel[] = [];
  estadoCivil: EstadoCivilModel[] = [];
  tipoHuespedes: TipoHuespedModel[] = [];
  motivos: MotivoModel[] = [];
  cotizacionesSignal = signal<CotizacionModel[]>([]);

  // Habitaciones Disponibles agrupadas por categoría
  habitacionesDisponibles: HabitacionDisponibleCard[] = [];
  habitacionesFiltradas: HabitacionDisponibleCard[] = [];
  habitacionesHotel: HabitacionDisponibleCard[] = [];
  habitacionesFullDay: HabitacionDisponibleCard[] = [];
  habitacionesCamping: HabitacionDisponibleCard[] = [];

  get totalHotelDisponibles(): number {
    return this.habitacionesHotel.length;
  }

  get totalFullDayDisponibles(): number {
    return this.habitacionesFullDay.length;
  }

  get totalCampingDisponibles(): number {
    return this.habitacionesCamping.length;
  }

  // Filtro por categoría en Mis Reservas
  filtroCategoriaReserva: 'TODOS' | 'HABITACION' | 'FULL_DAY' | 'CAMPING' = 'TODOS';
  textoBusquedaReserva: string = '';

  get totalReservas(): number {
    return this.reservas.length;
  }

  get totalReservasHotel(): number {
    return this.reservas.filter(r => this.obtenerInfoHabitacion(r).categoriaKey === 'HABITACION').length;
  }

  get totalReservasFullDay(): number {
    return this.reservas.filter(r => this.obtenerInfoHabitacion(r).categoriaKey === 'FULL_DAY').length;
  }

  get totalReservasCamping(): number {
    return this.reservas.filter(r => this.obtenerInfoHabitacion(r).categoriaKey === 'CAMPING').length;
  }

  // Reservas Externas (Sin montos)
  dataSourceReservas = new MatTableDataSource<ReservaModel>([]);
  reservasPaginadas$: Observable<ReservaModel[]> = this.dataSourceReservas.connect();
  displayedColumnsReservas: string[] = [
    'acciones',
    'correlativo',
    'fecha',
    'cliente',
    'telefono',
    'habitacion',
    'fechas_estadia'
  ];
  @ViewChild('paginatorReservas') paginatorReservas!: MatPaginator;

  // Cotizaciones Externas (Sin montos)
  dataSourceCotizaciones = new MatTableDataSource<CotizacionModel>([]);
  cotizacionesPaginadas$: Observable<CotizacionModel[]> = this.dataSourceCotizaciones.connect();
  displayedColumnsCotizaciones: string[] = [
    'acciones',
    'correlativo',
    'fecha',
    'cliente',
    'telefono',
    'fechas_estadia',
    'detalle'
  ];
  @ViewChild('paginatorCotizaciones') paginatorCotizaciones!: MatPaginator;

  constructor(
    private habitacionService: HabitacionService,
    private tipoHabitacionService: TipoHabitacionService,
    private reservaService: ReservaService,
    private cotizacionService: CotizacionService,
    private tipoDocumentoService: TipoDocumentoService,
    private paisService: PaisService,
    private canalReservaService: CanalReservaService,
    private documentoService: DocumentoService,
    private alertService: AlertService,
    private formaPagoService: FormaPagoService,
    private tipoHuespedService: TipoHuespedService,
    private motivoService: MotivoService,
    private productoService: ProductoService,
    private estadoCivilService: EstadoCivilService,
    private comunicacionService: ComunicacionService,
    private dialog: MatDialog,
    private router: Router
  ) {
    effect(() => {
      const cots = this.cotizacionesSignal();
      if (cots) {
        this.cotizaciones = cots;
        this.actualizarTablas();
      }
    });
  }

  ngOnInit(): void {
    this.cargarDatosGenerales();
  }

  cargarDatosGenerales(): void {
    this.cargando = true;
    const fIni = moment(this.fechaLlegada).format('YYYY-MM-DD');
    const fFin = moment(this.fechaSalida).format('YYYY-MM-DD');

    forkJoin({
      disponibilidad: this.habitacionService.disponibilidadHabitacionExterno(fIni, fFin),
      habitaciones: this.habitacionService.listar(),
      tipoHabitaciones: this.tipoHabitacionService.listar(),
      reservasRes: this.reservaService.listar({ mis_reservas: true }),
      cotizaciones: this.cotizacionService.listar(),
      tipoDocumentos: this.tipoDocumentoService.listar(),
      paises: this.paisService.listar(),
      canalReservas: this.canalReservaService.listar(),
      productos: this.productoService.listar(),
      formaPagos: this.formaPagoService.listar(),
      estadoCivil: this.estadoCivilService.listar(),
      tipoHuespedes: this.tipoHuespedService.listar(),
      motivos: this.motivoService.listar()
    }).subscribe({
      next: (res) => {
        this.habitaciones = Array.isArray(res.habitaciones) ? res.habitaciones : [];
        this.tipoHabitaciones = Array.isArray(res.tipoHabitaciones) ? res.tipoHabitaciones : [];
        this.tipoDocumentos = Array.isArray(res.tipoDocumentos) ? res.tipoDocumentos : [];
        this.paises = Array.isArray(res.paises) ? res.paises : [];
        this.canalReservas = Array.isArray(res.canalReservas) ? res.canalReservas : [];
        this.productos = Array.isArray(res.productos) ? res.productos : [];
        this.formaPagos = Array.isArray(res.formaPagos) ? res.formaPagos : [];
        this.estadoCivil = Array.isArray(res.estadoCivil) ? res.estadoCivil : [];
        this.tipoHuespedes = Array.isArray(res.tipoHuespedes) ? res.tipoHuespedes : [];
        this.motivos = Array.isArray(res.motivos) ? res.motivos : [];

        // Parse reservas
        if (res.reservasRes && res.reservasRes.dato) {
          try {
            this.reservas = typeof res.reservasRes.dato === 'string'
              ? JSON.parse(res.reservasRes.dato)
              : res.reservasRes.dato;
          } catch {
            this.reservas = [];
          }
        } else if (Array.isArray(res.reservasRes)) {
          this.reservas = res.reservasRes as any;
        }

        // Cotizaciones ordenadas por número y fecha descendente
        const rawCots = Array.isArray(res.cotizaciones) ? res.cotizaciones : [];
        this.cotizaciones = this.ordenarCotizaciones(rawCots);
        this.cotizacionesSignal.set(this.cotizaciones);

        // Procesar datos cargados desde HabitacionRepository metodo disponibilidadHabitacionExterno
        this.procesarDisponibilidad(res.disponibilidad);
        this.actualizarTablas();
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar datos generales reserva externa:", err);
        this.cargando = false;
        this.alertService.show("Error al cargar información del hotel", { duration: 4000, type: 'error' });
      }
    });
  }

  onFechaLlegadaChange(): void {
    if (this.fechaLlegada && this.fechaSalida && moment(this.fechaLlegada).isAfter(moment(this.fechaSalida))) {
      this.fechaSalida = new Date(this.fechaLlegada);
    }
  }

  buscarDisponibilidad(): void {
    const fIni = moment(this.fechaLlegada).startOf('day');
    const fFin = moment(this.fechaSalida).startOf('day');

    if (!fIni.isValid() || !fFin.isValid()) {
      this.alertService.show("Seleccione fechas válidas de estadía", { duration: 3000, type: 'warning' });
      return;
    }

    if (fIni.isAfter(fFin)) {
      this.alertService.show("La Fecha de Salida no puede ser anterior a la Fecha de Llegada", { duration: 3000, type: 'warning' });
      return;
    }

    this.buscando = true;
    const fIniStr = fIni.format('YYYY-MM-DD');
    const fFinStr = fFin.format('YYYY-MM-DD');

    this.habitacionService.disponibilidadHabitacionExterno(fIniStr, fFinStr).subscribe({
      next: (res) => {
        this.procesarDisponibilidad(res);
        this.buscando = false;
      },
      error: (err) => {
        console.error("Error al consultar disponibilidad:", err);
        this.buscando = false;
        this.alertService.show("Error al consultar disponibilidad", { duration: 3000, type: 'error' });
      }
    });
  }

  procesarDisponibilidad(data: any[]): void {
    const rawList = Array.isArray(data) ? data : [];
    this.habitacionesDisponibles = rawList.map(item => {
      const tipo = (item.tipo_habitacion || item.categoria || '').trim();
      const tipoUpper = tipo.toUpperCase();
      const descUpper = (item.descripcion || '').toUpperCase();
      const nroUpper = (item.nro_habitacion || '').toString().toUpperCase();

      const isCamping = tipoUpper.includes('CAMPING') || descUpper.includes('CAMPING') || nroUpper.includes('CAMPING');
      const isFullDay = !isCamping && (tipoUpper.includes('FULL') || descUpper.includes('FULL') || nroUpper.includes('FULL'));

      return {
        id: Number(item.id || item.habitacion_id),
        habitacion_id: Number(item.id || item.habitacion_id),
        categoria_id: Number(item.categoria_id || item.tipo_habitacion_id),
        tipo_habitacion_id: Number(item.tipo_habitacion_id || item.categoria_id),
        categoria: tipo,
        tipo_habitacion: tipo,
        precio: Number(item.precio) || 0,
        cantidad_disponible: 1,
        nro_habitacion: item.nro_habitacion || '',
        descripcion: item.descripcion || '',
        piso: item.piso,
        color: item.color,
        color_estado: item.color_estado,
        estado_habitacion: item.estado_habitacion,
        esFullDay: isFullDay,
        esCamping: isCamping
      };
    });

    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    // Clasificar en las 3 categorías: Habitaciones, Full Day, Camping
    const hotel: HabitacionDisponibleCard[] = [];
    const fullDay: HabitacionDisponibleCard[] = [];
    const camping: HabitacionDisponibleCard[] = [];

    this.habitacionesDisponibles.forEach(h => {
      if (h.esCamping) {
        camping.push(h);
      } else if (h.esFullDay) {
        fullDay.push(h);
      } else {
        hotel.push(h);
      }
    });

    // Ordenar habitaciones de hotel numéricamente (1, 2, 3...)
    hotel.sort((a, b) => {
      const nroA = parseInt(a.nro_habitacion || '', 10);
      const nroB = parseInt(b.nro_habitacion || '', 10);
      const aEsNum = !isNaN(nroA) && nroA > 0;
      const bEsNum = !isNaN(nroB) && nroB > 0;
      if (aEsNum && bEsNum) return nroA - nroB;
      if (aEsNum) return -1;
      if (bEsNum) return 1;
      return (a.nro_habitacion || '').localeCompare(b.nro_habitacion || '', undefined, { numeric: true });
    });

    const sortEspecial = (a: HabitacionDisponibleCard, b: HabitacionDisponibleCard) => {
      const nroA = parseInt(a.nro_habitacion || '', 10);
      const nroB = parseInt(b.nro_habitacion || '', 10);
      if (!isNaN(nroA) && !isNaN(nroB) && nroA !== nroB) return nroA - nroB;
      return (a.tipo_habitacion || '').localeCompare(b.tipo_habitacion || '');
    };
    fullDay.sort(sortEspecial);
    camping.sort(sortEspecial);

    this.habitacionesHotel = hotel;
    this.habitacionesFullDay = fullDay;
    this.habitacionesCamping = camping;

    this.habitacionesFiltradas = [
      ...this.habitacionesHotel,
      ...this.habitacionesFullDay,
      ...this.habitacionesCamping
    ];
  }

  formatearNombreTipo(hab: HabitacionDisponibleCard): string {
    return (hab.tipo_habitacion || hab.categoria || 'Habitación').trim();
  }

  actualizarTablas(): void {
    this.dataSourceReservas.data = this.reservas;
    this.dataSourceReservas.filterPredicate = (r: ReservaModel, filter: string) => {
      const info = this.obtenerInfoHabitacion(r);
      const tipoServicio = info.tipo.toLowerCase();
      const detalleServicio = info.detalle.toLowerCase();
      const cliente = (r.cliente || '').toLowerCase();
      const doc = (r.nro_documento || '').toLowerCase();
      const correlativo = String(r.correlativo || r.id || '').toLowerCase();
      const tel = (r.telefono || '').toLowerCase();
      const searchStr = `${cliente} ${doc} ${correlativo} ${tel} ${tipoServicio} ${detalleServicio}`;
      return searchStr.includes(filter);
    };
    if (this.paginatorReservas) {
      this.dataSourceReservas.paginator = this.paginatorReservas;
    }
    this.aplicarFiltroCompletoReservas();

    this.dataSourceCotizaciones.data = this.cotizaciones;
    this.dataSourceCotizaciones.filterPredicate = (c: CotizacionModel, filter: string) => {
      const cliente = (c.cliente || (c.nombre + ' ' + (c.primer_apellido || '')) || '').toLowerCase();
      const doc = (c.dni || '').toLowerCase();
      const correlativo = String(c.correlativo || c.id || '').toLowerCase();
      const tel = (c.telefono || '').toLowerCase();
      const detalle = (c.detalle || '').toLowerCase();
      const searchStr = `${cliente} ${doc} ${correlativo} ${tel} ${detalle}`;
      return searchStr.includes(filter);
    };
    if (this.paginatorCotizaciones) {
      this.dataSourceCotizaciones.paginator = this.paginatorCotizaciones;
    }
  }

  cambiarVista(vista: 'catalogo' | 'reservas' | 'cotizaciones'): void {
    this.vistaActiva = vista;
    setTimeout(() => {
      if (this.vistaActiva === 'reservas' && this.paginatorReservas) {
        this.dataSourceReservas.paginator = this.paginatorReservas;
      }
      if (this.vistaActiva === 'cotizaciones' && this.paginatorCotizaciones) {
        this.dataSourceCotizaciones.paginator = this.paginatorCotizaciones;
      }
    });
  }

  irReporte(): void {
    this.router.navigate(['/reporte_reserva_externa']);
  }

  abrirModalReserva(hab?: HabitacionDisponibleCard, reservaExistente?: ReservaModel, balanceExistente?: any): void {
    let reservaParaForm: ReservaModel;

    if (reservaExistente) {
      reservaParaForm = { ...reservaExistente };
      reservaParaForm.is_externo = 1;
    } else {
      reservaParaForm = new ReservaModel();
      reservaParaForm.fecha_ini = moment(this.fechaLlegada).format('YYYY-MM-DD');
      reservaParaForm.fecha_fin = moment(this.fechaSalida).format('YYYY-MM-DD');
      if (hab) {
        reservaParaForm.habitacion_id = Number(hab.id || hab.habitacion_id);
        reservaParaForm.precio_unit_adulto = hab.precio ? Number(hab.precio) : 0;
      } else {
        reservaParaForm.precio_unit_adulto = 0;
      }
      reservaParaForm.cantidad_adulto = 1;
      reservaParaForm.cantidad_ninio = 0;
      reservaParaForm.precio_unit_ninio = 0;
      reservaParaForm.canal_reserva_id = (this.canalReservas && this.canalReservas.length > 0) ? this.canalReservas[0].id : 1;
      reservaParaForm.total = 0;
      reservaParaForm.is_externo = 1;
    }

    this.comunicacionService.executeActionReserva.set(false);

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const dialogRef = this.dialog.open(ReservaFormComponent, {
      data: {
        reserva: reservaParaForm,
        balance: balanceExistente,
        reservas: this.reservas,
        habitaciones: this.habitaciones,
        tipo_documentos: this.tipoDocumentos,
        estado_civil: this.estadoCivil,
        paises: this.paises,
        forma_pagos: this.formaPagos,
        canal_reservas: this.canalReservas,
        tipo_huespedes: this.tipoHuespedes,
        motivos: this.motivos,
        productos: this.productos,
        tipo_habitaciones: this.tipoHabitaciones,
        is_externo: true,
        items: { update: () => { }, get: () => [], remove: () => { } },
        updateGroupsSignal: signal<number | null>(null)
      },
      width: isMobile ? '100vw' : '98vw',
      maxWidth: isMobile ? '100vw' : '650px',
      height: isMobile ? '100dvh' : 'auto',
      maxHeight: isMobile ? '100dvh' : '92vh',
      panelClass: isMobile ? ['mobile-fullscreen-dialog'] : [],
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.cargarDatosGenerales();
      const reservaId = Number(result?.reserva_id || result?.reserva?.id || result?.id) || 0;
      if (reservaId > 0) {
        setTimeout(() => {
          this.verVoucherReserva(reservaId);
        }, 300);
      }
    });
  }

  editarReserva(reservaId: number): void {
    this.reservaService.mostrar(reservaId).subscribe({
      next: (res: any) => {
        const r = (res?.response?.reserva || res?.reserva || res) as ReservaModel;
        const b = (res?.response?.balance || res?.balance || null);
        this.abrirModalReserva(undefined, r, b);
      },
      error: () => {
        this.alertService.show("Error al cargar la reserva", { duration: 3000, type: 'error' });
      }
    });
  }

  abrirModalCotizacion(hab?: HabitacionDisponibleCard, cotizacionExistente?: CotizacionModel): void {
    let cotizacionParaForm: CotizacionModel;

    if (cotizacionExistente) {
      cotizacionParaForm = { ...cotizacionExistente };
    } else {
      cotizacionParaForm = new CotizacionModel();
      cotizacionParaForm.fecha_ini = moment(this.fechaLlegada).format('YYYY-MM-DD');
      cotizacionParaForm.fecha_fin = moment(this.fechaSalida).format('YYYY-MM-DD');
      if (hab) {
        cotizacionParaForm.detalle = `Cotización para ${hab.tipo_habitacion || 'Habitación'} #${hab.nro_habitacion || ''}`.trim();
      }
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const dialogRef = this.dialog.open(CotizacionFormComponent, {
      data: {
        cotizacion: cotizacionParaForm,
        cotizaciones: this.cotizacionesSignal,
        is_externo: true
      },
      width: isMobile ? '100vw' : '98vw',
      maxWidth: isMobile ? '100vw' : '650px',
      height: isMobile ? '100dvh' : 'auto',
      maxHeight: isMobile ? '100dvh' : '92vh',
      panelClass: isMobile ? ['mobile-fullscreen-dialog'] : [],
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.cotizacionService.listar().subscribe({
          next: (cots) => {
            const rawCots = Array.isArray(cots) ? cots : [];
            this.cotizaciones = this.ordenarCotizaciones(rawCots);
            this.cotizacionesSignal.set(this.cotizaciones);
            this.actualizarTablas();
          }
        });
      }
    });
  }

  editarCotizacion(id: number): void {
    this.cotizacionService.getById(id).subscribe({
      next: (cot) => {
        this.abrirModalCotizacion(undefined, cot);
      },
      error: () => {
        this.alertService.show("Error al cargar la cotización", { duration: 3000, type: 'error' });
      }
    });
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return '-';
    if (typeof fecha === 'string' && fecha.includes('/')) return fecha;
    const m = moment(fecha);
    return m.isValid() ? m.format('DD/MM/YYYY') : String(fecha);
  }

  formatearFechaHora(fecha: any): string {
    if (!fecha) return '-';
    const m = moment(fecha);
    return m.isValid() ? m.format('DD/MM/YYYY HH:mm') : String(fecha);
  }

  obtenerFechaRegistro(r: ReservaModel): string {
    const f = (r as any).created_at || (r as any).fecha_registro || r.fecha_ini;
    return this.formatearFechaHora(f);
  }

  obtenerFechaRegistroCot(c: CotizacionModel): string {
    const f = c.created_at || c.fecha;
    return this.formatearFechaHora(f);
  }

  formatearRangoFechas(fIni: any, fFin: any): string {
    if (!fIni && !fFin) return '-';
    const ini = this.formatearFecha(fIni);
    const fin = this.formatearFecha(fFin);
    if (ini !== '-' && fin !== '-') return `${ini} - ${fin}`;
    return ini !== '-' ? ini : fin;
  }

  verVoucherReserva(reservaId: number): void {
    this.documentoService.obtenerVoucherReserva(reservaId).subscribe({
      next: (pdfBase64: string) => {
        if (pdfBase64) {
          const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
          this.dialog.open(PdfViewerComponent, {
            width: isMobile ? '100vw' : '92vw',
            maxWidth: isMobile ? '100vw' : '1100px',
            height: isMobile ? '100dvh' : '90vh',
            maxHeight: isMobile ? '100dvh' : '90vh',
            panelClass: isMobile ? ['mobile-fullscreen-dialog'] : [],
            data: {
              pdf_base64: pdfBase64,
              titulo_documento: `Comprobante de Reserva ${reservaId}`
            }
          });
        } else {
          this.alertService.show("No se pudo obtener el voucher de la reserva", { duration: 3000, type: 'warning' });
        }
      },
      error: () => {
        this.alertService.show("Error al consultar el comprobante", { duration: 3000, type: 'error' });
      }
    });
  }

  verVoucherCotizacion(cotizacionId: number): void {
    this.documentoService.obtenerVoucherCotizacion(cotizacionId).subscribe({
      next: (pdfBase64: string) => {
        if (pdfBase64) {
          const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
          this.dialog.open(PdfViewerComponent, {
            width: isMobile ? '100vw' : '92vw',
            maxWidth: isMobile ? '100vw' : '1100px',
            height: isMobile ? '100dvh' : '90vh',
            maxHeight: isMobile ? '100dvh' : '90vh',
            panelClass: isMobile ? ['mobile-fullscreen-dialog'] : [],
            data: {
              pdf_base64: pdfBase64,
              titulo_documento: `Cotización #${cotizacionId}`
            }
          });
        } else {
          this.alertService.show("No se pudo obtener la cotización en PDF", { duration: 3000, type: 'warning' });
        }
      },
      error: () => {
        this.alertService.show("Error al consultar el comprobante", { duration: 3000, type: 'error' });
      }
    });
  }

  busqueda(texto: string): void {
    this.textoBusquedaReserva = texto.trim().toLowerCase();
    this.aplicarFiltroCompletoReservas();
  }

  filtrarReservas(texto: string): void {
    this.busqueda(texto);
  }

  ordenarReservas(reservas: ReservaModel[]): ReservaModel[] {
    return [...reservas].sort((a, b) => {
      const numA = Number(a.correlativo || a.id) || 0;
      const numB = Number(b.correlativo || b.id) || 0;

      // 1. Ordenar por número de reserva descendente
      if (numB !== numA) {
        return numB - numA;
      }

      // 2. Si son iguales, ordenar por fecha descendente
      const fechaA = moment((a as any).created_at || a.fecha_ini).valueOf() || 0;
      const fechaB = moment((b as any).created_at || b.fecha_ini).valueOf() || 0;
      return fechaB - fechaA;
    });
  }

  ordenarCotizaciones(cotizaciones: CotizacionModel[]): CotizacionModel[] {
    return [...cotizaciones].sort((a, b) => {
      const numA = Number(a.correlativo || a.id) || 0;
      const numB = Number(b.correlativo || b.id) || 0;
      if (numB !== numA) {
        return numB - numA;
      }
      const fechaA = moment(a.fecha || a.created_at).valueOf() || 0;
      const fechaB = moment(b.fecha || b.created_at).valueOf() || 0;
      return fechaB - fechaA;
    });
  }

  aplicarFiltroCompletoReservas(): void {
    const ordenadas = this.ordenarReservas(this.reservas);
    this.dataSourceReservas.data = ordenadas;
    this.dataSourceReservas.filter = this.textoBusquedaReserva;
  }

  busquedaCot(texto: string): void {
    this.dataSourceCotizaciones.filter = texto.trim().toLowerCase();
  }

  filtrarCotizaciones(texto: string): void {
    this.busquedaCot(texto);
  }

  obtenerInfoHabitacion(r: ReservaModel | any): {
    tipo: string;
    icono: string;
    detalle: string;
    claseBadge: string;
    categoriaKey: 'HABITACION' | 'FULL_DAY' | 'CAMPING';
  } {
    const habId = Number(r.habitacion_id);
    const hab = this.habitaciones.find(h => h.id === habId);
    const tipo = (hab?.tipo_habitacion || (r as any)?.tipo_habitacion || (hab as any)?.categoria || '').toUpperCase();
    const desc = (hab?.descripcion || '').toUpperCase();
    const nro = (hab?.nro_habitacion || r.nro_habitacion || '').toString();

    const isCamping = tipo.includes('CAMPING') || desc.includes('CAMPING') || nro.includes('CAMPING');
    const isFullDay = !isCamping && (r.is_full_day === 1 || tipo.includes('FULL') || desc.includes('FULL') || nro.includes('FULL'));

    if (isCamping) {
      return {
        tipo: 'Camping',
        icono: 'forest',
        detalle: `Espacio #${nro || habId}`,
        claseBadge: 'bg-success text-white',
        categoriaKey: 'CAMPING'
      };
    }

    if (isFullDay) {
      return {
        tipo: 'Full Day',
        icono: 'wb_sunny',
        detalle: `Pase #${nro || habId}`,
        claseBadge: 'bg-warning text-dark',
        categoriaKey: 'FULL_DAY'
      };
    }

    // Por defecto es Habitación de hotel
    const tipoTexto = hab?.tipo_habitacion ? ` (${hab.tipo_habitacion})` : (r.tipo_habitacion ? ` (${r.tipo_habitacion})` : '');
    return {
      tipo: 'Habitación',
      icono: 'meeting_room',
      detalle: `Hab. ${nro || habId}${tipoTexto}`,
      claseBadge: 'bg-primary text-white',
      categoriaKey: 'HABITACION'
    };
  }

  obtenerNombreHabitacion(habId: number): string {
    const info = this.obtenerInfoHabitacion({ habitacion_id: habId });
    return `${info.tipo}: ${info.detalle}`;
  }

  obtenerEstadoBadge(estadoId: number): { texto: string; clase: string } {
    switch (estadoId) {
      case 1:
        return { texto: 'RESERVA', clase: 'badge-reserva' };
      case 2:
        return { texto: 'CHECK IN', clase: 'badge-checkin' };
      case 3:
        return { texto: 'CHECK OUT', clase: 'badge-checkout' };
      case 4:
        return { texto: 'CANCELADO', clase: 'badge-cancelado' };
      default:
        return { texto: 'REGISTRADO', clase: 'badge-default' };
    }
  }
}
