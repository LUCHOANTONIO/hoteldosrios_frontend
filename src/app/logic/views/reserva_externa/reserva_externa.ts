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

export interface HabitacionDisponibleCard extends HabitacionModel {
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
  pisosDisponibles: number[] = [];
  habitacionesPorPiso: { [piso: number]: HabitacionDisponibleCard[] } = {};

  // Filtros de visualización
  tiposFiltro: string[] = ['TODOS'];
  tipoFiltroSeleccionado: string = 'TODOS';
  pisoFiltroSeleccionado: string = 'TODOS';
  busquedaTexto: string = '';

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
  ) {}

  ngOnInit(): void {
    this.cargarDatosGenerales();
  }

  cargarDatosGenerales(): void {
    this.cargando = true;
    forkJoin({
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

        // Extraer lista de tipos únicos para filtros
        const tiposSet = new Set<string>();
        this.habitaciones.forEach(h => {
          if (h.tipo_habitacion && h.tipo_habitacion.trim()) {
            tiposSet.add(h.tipo_habitacion.trim().toUpperCase());
          }
        });
        this.tiposFiltro = ['TODOS', ...Array.from(tiposSet).sort()];

        // Calcular disponibilidad de cada habitación individual
        this.recalcularDisponibilidad();
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
    this.reservaService.listar().subscribe({
      next: (res) => {
        if (res && res.dato) {
          try {
            this.reservas = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
          } catch { }
        }
        this.recalcularDisponibilidad();
        this.buscando = false;
        this.alertService.show(`Disponibilidad actualizada: ${this.habitacionesDisponibles.length} habitaciones disponibles`, { duration: 2500, type: 'success' });
      },
      error: () => {
        this.recalcularDisponibilidad();
        this.buscando = false;
      }
    });
  }

  formatearFecha(f: any): string {
    return f ? moment(f).format('DD/MM/YYYY') : '';
  }

  recalcularDisponibilidad(): void {
    const fIni = moment(this.fechaLlegada).startOf('day');
    const fFin = moment(this.fechaSalida).startOf('day');

    // Cada habitación individual se evalúa contra las reservas existentes
    this.habitacionesDisponibles = this.habitaciones
      .filter(h => {
        const solapa = this.reservas.some(r => {
          if (Number(r.habitacion_id) !== h.id) return false;
          if (r.estado_reserva_id === 4) return false; // 4 = Cancelado
          const rIni = moment(r.fecha_ini).startOf('day');
          const rFin = moment(r.fecha_fin).startOf('day');
          return rIni.isBefore(fFin) && rFin.isAfter(fIni);
        });
        return !solapa;
      })
      .map(h => {
        const tipoUpper = (h.tipo_habitacion || '').toUpperCase();
        let cap = 2;
        if (tipoUpper.includes('TRIPLE')) cap = 3;
        else if (tipoUpper.includes('SIMPLE') || tipoUpper.includes('INDIVIDUAL')) cap = 1;
        else if (tipoUpper.includes('SUITE') || tipoUpper.includes('FAMILIAR')) cap = 4;

        return {
          ...h,
          capacidad: cap,
          capacidadTexto: `${cap} ${cap === 1 ? 'Huésped' : 'Huéspedes'}`
        };
      });

    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let lista = [...this.habitacionesDisponibles];

    if (this.tipoFiltroSeleccionado !== 'TODOS') {
      lista = lista.filter(h => (h.tipo_habitacion || '').toUpperCase() === this.tipoFiltroSeleccionado.toUpperCase());
    }

    if (this.pisoFiltroSeleccionado !== 'TODOS') {
      lista = lista.filter(h => (h.piso || '').toString() === this.pisoFiltroSeleccionado.toString());
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
    this.habitacionesHotel = [];
    this.habitacionesFullDay = [];
    this.habitacionesCamping = [];

    lista.forEach(h => {
      const tipo = (h.tipo_habitacion || '').toUpperCase();
      const desc = (h.descripcion || '').toUpperCase();
      const nro = (h.nro_habitacion || '').toString().toUpperCase();

      if (tipo.includes('CAMPING') || desc.includes('CAMPING') || nro.includes('CAMPING')) {
        h.esCamping = true;
        this.habitacionesCamping.push(h);
      } else if (tipo.includes('FULL') || desc.includes('FULL') || nro.includes('FULL')) {
        h.esFullDay = true;
        this.habitacionesFullDay.push(h);
      } else {
        this.habitacionesHotel.push(h);
      }
    });

    // Ordenar habitaciones de hotel numéricamente (1, 2, 3...)
    this.habitacionesHotel.sort((a, b) => {
      const nroA = parseInt(a.nro_habitacion, 10);
      const nroB = parseInt(b.nro_habitacion, 10);
      const aEsNum = !isNaN(nroA) && nroA > 0;
      const bEsNum = !isNaN(nroB) && nroB > 0;
      if (aEsNum && bEsNum) return nroA - nroB;
      if (aEsNum) return -1;
      if (bEsNum) return 1;
      return (a.nro_habitacion || '').localeCompare(b.nro_habitacion || '', undefined, { numeric: true });
    });

    const sortEspecial = (a: HabitacionDisponibleCard, b: HabitacionDisponibleCard) => {
      const nroA = parseInt(a.nro_habitacion, 10);
      const nroB = parseInt(b.nro_habitacion, 10);
      if (!isNaN(nroA) && !isNaN(nroB) && nroA !== nroB) return nroA - nroB;
      return (a.tipo_habitacion || '').localeCompare(b.tipo_habitacion || '');
    };
    this.habitacionesFullDay.sort(sortEspecial);
    this.habitacionesCamping.sort(sortEspecial);

    this.habitacionesFiltradas = [
      ...this.habitacionesHotel,
      ...this.habitacionesFullDay,
      ...this.habitacionesCamping
    ];

    // Agrupar por pisos
    this.habitacionesPorPiso = {};
    const pisosSet = new Set<number>();
    this.habitacionesFiltradas.forEach(h => {
      let p = 0;
      if (h.piso) {
        p = parseInt(h.piso, 10) || 0;
      } else {
        const nro = parseInt(h.nro_habitacion, 10) || 0;
        p = Math.floor(nro / 100);
      }
      if (!this.habitacionesPorPiso[p]) {
        this.habitacionesPorPiso[p] = [];
      }
      this.habitacionesPorPiso[p].push(h);
      pisosSet.add(p);
    });

    this.pisosDisponibles = Array.from(pisosSet).sort((a, b) => a - b);
  }

  filtrarPorTipo(tipo: string): void {
    this.tipoFiltroSeleccionado = tipo;
    this.aplicarFiltros();
  }

  filtrarPorPiso(piso: string): void {
    this.pisoFiltroSeleccionado = piso;
    this.aplicarFiltros();
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
