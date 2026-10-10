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
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import moment from 'moment';

// MODELS
import { HabitacionModel } from '../../models/habitacion.model';
import { TipoHabitacionModel } from '../../models/tipo_habitacion.model';
import { ReservaModel } from '../../models/reserva.model';
import { CotizacionModel } from '../../models/cotizacion.model';
import { TipoDocumentoModel } from '../../../base/models/tipodocumento.model';
import { PaisModel } from '../../models/pais.model';
import { CanalReservaModel } from '../../models/canal_reserva.model';

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

// SUBCOMPONENTS
import { ReservaExternaModalComponent } from './reserva_externa-reserva-modal/reserva_externa-reserva-modal';
import { ReservaExternaCotizacionModalComponent } from './reserva_externa-cotizacion-modal/reserva_externa-cotizacion-modal';
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
  capacidad: number;
  capacidadTexto: string;
  esFullDay?: boolean;
  esCamping?: boolean;
}

@Component({
  selector: 'app-reserva-externa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  fechaSalida: Date = moment().add(1, 'days').toDate();

  // Raw data from API
  habitaciones: HabitacionModel[] = [];
  tipoHabitaciones: TipoHabitacionModel[] = [];
  reservas: ReservaModel[] = [];
  cotizaciones: CotizacionModel[] = [];
  tipoDocumentos: TipoDocumentoModel[] = [];
  paises: PaisModel[] = [];
  canalReservas: CanalReservaModel[] = [];

  // Habitaciones Disponibles agrupadas por categoría
  habitacionesDisponibles: HabitacionDisponibleCard[] = [];
  habitacionesFiltradas: HabitacionDisponibleCard[] = [];
  habitacionesHotel: HabitacionDisponibleCard[] = [];
  habitacionesFullDay: HabitacionDisponibleCard[] = [];
  habitacionesCamping: HabitacionDisponibleCard[] = [];

  // Filtros de visualización
  categoriaFiltro: 'TODOS' | 'HOTEL' | 'FULL_DAY' | 'CAMPING' = 'TODOS';
  tiposFiltro: string[] = ['TODOS'];
  tipoFiltroSeleccionado: string = 'TODOS';
  pisoFiltroSeleccionado: string = 'TODOS';
  pisosDisponibles: string[] = ['TODOS'];
  busquedaTexto: string = '';

  // Getters para totales de disponibilidad y estadía
  get nochesEstadia(): number {
    if (!this.fechaLlegada || !this.fechaSalida) return 1;
    const diff = moment(this.fechaSalida).startOf('day').diff(moment(this.fechaLlegada).startOf('day'), 'days');
    return diff > 0 ? diff : 1;
  }

  get totalDisponibles(): number {
    return this.habitacionesDisponibles.length;
  }

  get countHotelTotal(): number {
    return this.habitacionesDisponibles.filter(h => !h.esCamping && !h.esFullDay).length;
  }

  get countFullDayTotal(): number {
    return this.habitacionesDisponibles.filter(h => h.esFullDay).length;
  }

  get countCampingTotal(): number {
    return this.habitacionesDisponibles.filter(h => h.esCamping).length;
  }

  get totalHotelDisponibles(): number {
    return this.habitacionesHotel.length;
  }

  get totalFullDayDisponibles(): number {
    return this.habitacionesFullDay.length;
  }

  get totalCampingDisponibles(): number {
    return this.habitacionesCamping.length;
  }

  // Reservas Externas (Sin montos)
  dataSourceReservas = new MatTableDataSource<ReservaModel>([]);
  displayedColumnsReservas: string[] = [
    'acciones',
    'correlativo',
    'fecha',
    'cliente',
    'telefono',
    'habitacion',
    'fechas_estadia',
    'estado'
  ];
  @ViewChild('paginatorReservas') paginatorReservas!: MatPaginator;

  // Cotizaciones Externas (Sin montos)
  dataSourceCotizaciones = new MatTableDataSource<CotizacionModel>([]);
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
    private dialog: MatDialog
  ) { }

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
      reservasRes: this.reservaService.listar(),
      cotizaciones: this.cotizacionService.listar(),
      tipoDocumentos: this.tipoDocumentoService.listar(),
      paises: this.paisService.listar(),
      canalReservas: this.canalReservaService.listar()
    }).subscribe({
      next: (res) => {
        this.habitaciones = Array.isArray(res.habitaciones) ? res.habitaciones : [];
        this.tipoHabitaciones = Array.isArray(res.tipoHabitaciones) ? res.tipoHabitaciones : [];
        this.tipoDocumentos = Array.isArray(res.tipoDocumentos) ? res.tipoDocumentos : [];
        this.paises = Array.isArray(res.paises) ? res.paises : [];
        this.canalReservas = Array.isArray(res.canalReservas) ? res.canalReservas : [];

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

        // Cotizaciones
        this.cotizaciones = Array.isArray(res.cotizaciones) ? res.cotizaciones : [];

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

  buscarDisponibilidad(): void {
    const fIni = moment(this.fechaLlegada).startOf('day');
    const fFin = moment(this.fechaSalida).startOf('day');

    if (!fIni.isValid() || !fFin.isValid()) {
      this.alertService.show("Seleccione fechas válidas de estadía", { duration: 3000, type: 'warning' });
      return;
    }

    if (fIni.isSameOrAfter(fFin)) {
      this.alertService.show("La Fecha de Salida debe ser posterior a la Fecha de Llegada", { duration: 3000, type: 'warning' });
      return;
    }

    this.buscando = true;
    const fIniStr = fIni.format('YYYY-MM-DD');
    const fFinStr = fFin.format('YYYY-MM-DD');

    this.habitacionService.disponibilidadHabitacionExterno(fIniStr, fFinStr).subscribe({
      next: (res) => {
        this.procesarDisponibilidad(res);
        this.buscando = false;
        const totalDisp = this.habitacionesDisponibles.reduce((acc, h) => acc + (Number(h.cantidad_disponible) || 0), 0);
        this.alertService.show(`Disponibilidad actualizada: ${totalDisp} unidades disponibles`, { duration: 2500, type: 'success' });
      },
      error: (err) => {
        console.error("Error al consultar disponibilidad:", err);
        this.buscando = false;
        this.alertService.show("Error al consultar disponibilidad", { duration: 3000, type: 'error' });
      }
    });
  }

  formatearFecha(f: any): string {
    return f ? moment(f).format('DD/MM/YYYY') : '';
  }

  procesarDisponibilidad(data: any[]): void {
    const rawList = Array.isArray(data) ? data : [];
    this.habitacionesDisponibles = rawList.map(item => {
      const tipo = item.tipo_habitacion || item.categoria || '';
      const tipoUpper = tipo.toUpperCase();
      const descUpper = (item.descripcion || '').toUpperCase();
      const nroUpper = (item.nro_habitacion || '').toString().toUpperCase();

      const isCamping = tipoUpper.includes('CAMPING') || descUpper.includes('CAMPING') || nroUpper.includes('CAMPING');
      const isFullDay = !isCamping && (tipoUpper.includes('FULL') || descUpper.includes('FULL') || nroUpper.includes('FULL'));

      let cap = 2;
      if (isCamping) {
        cap = 4;
      } else if (isFullDay) {
        cap = 1;
      } else if (tipoUpper.includes('TRIPLE')) {
        cap = 3;
      } else if (tipoUpper.includes('SIMPLE') || tipoUpper.includes('INDIVIDUAL')) {
        cap = 1;
      } else if (tipoUpper.includes('SUITE') || tipoUpper.includes('FAMILIAR')) {
        cap = 4;
      }

      let capTexto = `${cap} ${cap === 1 ? 'Huésped' : 'Huéspedes'}`;
      if (isFullDay) {
        capTexto = '1 Pase Individual';
      } else if (isCamping) {
        capTexto = 'Hasta 4 Personas';
      }

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
        capacidad: cap,
        capacidadTexto: capTexto,
        esFullDay: isFullDay,
        esCamping: isCamping
      };
    });

    // Extraer lista de tipos únicos y pisos para filtros
    const tiposSet = new Set<string>();
    const pisosSet = new Set<string>();
    this.habitacionesDisponibles.forEach(h => {
      if (h.categoria && h.categoria.trim()) {
        tiposSet.add(h.categoria.trim().toUpperCase());
      }
      if (h.piso !== undefined && h.piso !== null && String(h.piso).trim() !== '' && String(h.piso) !== '0') {
        pisosSet.add(String(h.piso));
      }
    });
    this.tiposFiltro = ['TODOS', ...Array.from(tiposSet).sort()];
    this.pisosDisponibles = ['TODOS', ...Array.from(pisosSet).sort()];

    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let lista = [...this.habitacionesDisponibles];

    if (this.pisoFiltroSeleccionado !== 'TODOS') {
      lista = lista.filter(h => String(h.piso) === String(this.pisoFiltroSeleccionado));
    }

    if (this.tipoFiltroSeleccionado !== 'TODOS') {
      lista = lista.filter(h => (h.categoria || '').toUpperCase() === this.tipoFiltroSeleccionado.toUpperCase());
    }

    if (this.busquedaTexto.trim() !== '') {
      const txt = this.busquedaTexto.trim().toLowerCase();
      lista = lista.filter(h =>
        (h.nro_habitacion || '').toString().toLowerCase().includes(txt) ||
        (h.tipo_habitacion || '').toLowerCase().includes(txt) ||
        (h.descripcion || '').toLowerCase().includes(txt)
      );
    }

    // Clasificar en las 3 categorías: Habitaciones, Full Day, Camping
    const hotel: HabitacionDisponibleCard[] = [];
    const fullDay: HabitacionDisponibleCard[] = [];
    const camping: HabitacionDisponibleCard[] = [];

    lista.forEach(h => {
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

    // Respetar filtro de categoría seleccionado en pestaña
    if (this.categoriaFiltro === 'HOTEL') {
      this.habitacionesHotel = hotel;
      this.habitacionesFullDay = [];
      this.habitacionesCamping = [];
    } else if (this.categoriaFiltro === 'FULL_DAY') {
      this.habitacionesHotel = [];
      this.habitacionesFullDay = fullDay;
      this.habitacionesCamping = [];
    } else if (this.categoriaFiltro === 'CAMPING') {
      this.habitacionesHotel = [];
      this.habitacionesFullDay = [];
      this.habitacionesCamping = camping;
    } else {
      this.habitacionesHotel = hotel;
      this.habitacionesFullDay = fullDay;
      this.habitacionesCamping = camping;
    }

    this.habitacionesFiltradas = [
      ...this.habitacionesHotel,
      ...this.habitacionesFullDay,
      ...this.habitacionesCamping
    ];
  }

  seleccionarCategoriaFiltro(cat: 'TODOS' | 'HOTEL' | 'FULL_DAY' | 'CAMPING'): void {
    this.categoriaFiltro = cat;
    this.aplicarFiltros();
  }

  filtrarPorTipo(tipo: string): void {
    this.tipoFiltroSeleccionado = tipo;
    this.aplicarFiltros();
  }

  filtrarPorPiso(piso: string): void {
    this.pisoFiltroSeleccionado = piso;
    this.aplicarFiltros();
  }

  formatearNombreTipo(hab: HabitacionDisponibleCard): string {
    const raw = (hab.tipo_habitacion || hab.categoria || '').trim();
    if (!raw) return 'Estándar';
    const upper = raw.toUpperCase();
    if (upper.includes('DOBLE FAMILIAR')) return 'Doble Familiar';
    if (upper.includes('MATRIMONIAL')) return 'Matrimonial Confort';
    if (upper.includes('SUITE')) return 'Suite Presidencial';
    if (upper.includes('TRIPLE')) return 'Habitación Triple';
    if (upper.includes('SIMPLE')) return 'Habitación Simple';
    if (upper.includes('FULL DAY') || upper.includes('FULLDAY')) return 'Pase Full Day';
    if (upper.includes('CAMPING')) return 'Zona de Camping';
    return raw.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  getUnidadPrecio(hab: HabitacionDisponibleCard): string {
    if (hab.esFullDay) return '/ persona';
    if (hab.esCamping) return '/ espacio';
    return '/ noche';
  }

  calcularTotalEstadia(hab: HabitacionDisponibleCard): number {
    return (Number(hab.precio) || 0) * this.nochesEstadia;
  }

  onBusquedaChange(texto: string): void {
    this.busquedaTexto = texto;
    this.aplicarFiltros();
  }

  actualizarTablas(): void {
    const reservasExternas = this.reservas.filter(r => r.is_externo == 1 || r.id > 0);
    this.dataSourceReservas = new MatTableDataSource<ReservaModel>(reservasExternas);
    if (this.paginatorReservas) {
      this.dataSourceReservas.paginator = this.paginatorReservas;
    }

    this.dataSourceCotizaciones = new MatTableDataSource<CotizacionModel>(this.cotizaciones);
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

  abrirModalReserva(hab: HabitacionDisponibleCard): void {
    const dialogRef = this.dialog.open(ReservaExternaModalComponent, {
      width: '95vw',
      maxWidth: '780px',
      maxHeight: '92vh',
      disableClose: true,
      data: {
        habitacionSeleccionada: hab,
        habitacionesDisponibles: this.habitacionesDisponibles,
        fecha_ini: this.fechaLlegada,
        fecha_fin: this.fechaSalida,
        tipoDocumentos: this.tipoDocumentos,
        paises: this.paises,
        canalReservas: this.canalReservas
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res && res.success) {
        this.cargarDatosGenerales();
      }
    });
  }

  abrirModalCotizacion(hab?: HabitacionDisponibleCard): void {
    const dialogRef = this.dialog.open(ReservaExternaCotizacionModalComponent, {
      width: '95vw',
      maxWidth: '780px',
      maxHeight: '92vh',
      disableClose: true,
      data: {
        habitacionSeleccionada: hab || null,
        habitacionesDisponibles: this.habitacionesDisponibles,
        fecha_ini: this.fechaLlegada,
        fecha_fin: this.fechaSalida,
        tipoDocumentos: this.tipoDocumentos,
        paises: this.paises,
        canalReservas: this.canalReservas
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res && res.success) {
        this.cotizacionService.listar().subscribe({
          next: (cots) => {
            this.cotizaciones = Array.isArray(cots) ? cots : [];
            this.actualizarTablas();
          }
        });
      }
    });
  }

  verVoucherReserva(reservaId: number): void {
    this.documentoService.obtenerVoucherReserva(reservaId).subscribe({
      next: (pdfBase64: string) => {
        if (pdfBase64) {
          this.dialog.open(PdfViewerComponent, {
            width: '92vw',
            maxWidth: '1100px',
            height: '90vh',
            data: {
              pdf_base64: pdfBase64,
              titulo_documento: `Voucher de Reserva #${reservaId}`
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
          this.dialog.open(PdfViewerComponent, {
            width: '92vw',
            maxWidth: '1100px',
            height: '90vh',
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

  filtrarReservas(texto: string): void {
    this.dataSourceReservas.filter = texto.trim().toLowerCase();
  }

  filtrarCotizaciones(texto: string): void {
    this.dataSourceCotizaciones.filter = texto.trim().toLowerCase();
  }

  obtenerNombreHabitacion(habId: number): string {
    const hab = this.habitaciones.find(h => h.id === habId);
    return hab ? `Hab. ${hab.nro_habitacion} (${hab.tipo_habitacion || ''})` : `Hab. #${habId}`;
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
