import { Component, AfterViewInit, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import moment from 'moment';

// MODELS
import { ReporteAlmuerzoModel, ReporteAlmuerzoResumen, ReporteAlmuerzoResponse } from '../../../models/reporte_almuerzo.model';
import { HabitacionModel } from '../../../models/habitacion.model';

// SERVICES
import { ReporteService } from '../../../services/reporte.service';
import { HabitacionService } from '../../../services/habitacion.service';
import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';

// MATERIAL DESIGN
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// COMPONENT
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';

@Component({
  selector: 'app-reporte-almuerzo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './almuerzo.html',
  styleUrl: './almuerzo.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})
export class ReporteAlmuerzoComponent implements AfterViewInit {
  reporteAlmuerzo = signal<ReporteAlmuerzoModel[]>([]);
  resumen = signal<ReporteAlmuerzoResumen>({
    total_reservas: 0,
    total_adultos: 0,
    total_ninios: 0,
    total_incluidos: 0,
    total_extras: 0,
    gran_total_almuerzos: 0
  });

  habitaciones: HabitacionModel[] = [];
  fecha_ini: Date = new Date();
  fecha_fin: Date = new Date();
  habitacion_id: any = null;
  filtroActivo: 'hoy' | 'manana' | 'semana' | 'personalizado' = 'hoy';
  cargando: boolean = false;

  dialogRef: any;
  pdf_base64: String = '';
  titulo_documento: string = '';

  displayedColumns: string[] = [
    'correlativo',
    'habitacion',
    'cliente',
    'estadia',
    'cantidad_adulto',
    'cantidad_ninio',
    'almuerzos_incluidos',
    'almuerzos_extras',
    'total_almuerzos',
    'notas',
    'estado'
  ];

  dataSource = new MatTableDataSource<ReporteAlmuerzoModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  readonly dialog = inject(MatDialog);

  constructor(
    private reporteService: ReporteService,
    private habitacionService: HabitacionService
  ) {
    this.cargarHabitaciones();
    this.cargarDatos();

    effect(() => {
      this.dataSource = new MatTableDataSource<ReporteAlmuerzoModel>(this.reporteAlmuerzo());
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (data: ReporteAlmuerzoModel, filter: string) => {
        const str = `${data.correlativo} ${data.cliente} ${data.habitacion} ${data.notas} ${data.estado} ${data.nro_documento}`.toLowerCase();
        return str.includes(filter);
      };
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  cargarHabitaciones() {
    this.habitacionService.listar().subscribe({
      next: (res) => {
        this.habitaciones = res || [];
      }
    });
  }

  setFiltro(tipo: 'hoy' | 'manana' | 'semana') {
    this.filtroActivo = tipo;
    const hoy = moment();
    if (tipo === 'hoy') {
      this.fecha_ini = hoy.clone().startOf('day').toDate();
      this.fecha_fin = hoy.clone().endOf('day').toDate();
    } else if (tipo === 'manana') {
      const manana = hoy.clone().add(1, 'day');
      this.fecha_ini = manana.clone().startOf('day').toDate();
      this.fecha_fin = manana.clone().endOf('day').toDate();
    } else if (tipo === 'semana') {
      this.fecha_ini = hoy.clone().startOf('week').toDate();
      this.fecha_fin = hoy.clone().endOf('week').toDate();
    }
    this.cargarDatos();
  }

  onRangoChange() {
    this.filtroActivo = 'personalizado';
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
    const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD');

    this.reporteService.list_almuerzo(fechaIniStr, fechaFinStr, this.habitacion_id).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res && res.dato) {
          const data: ReporteAlmuerzoResponse = JSON.parse(res.dato);
          this.reporteAlmuerzo.set(data.reservas || []);
          if (data.resumen) {
            this.resumen.set(data.resumen);
          }
        } else {
          this.reporteAlmuerzo.set([]);
          this.resumen.set({
            total_reservas: 0,
            total_adultos: 0,
            total_ninios: 0,
            total_incluidos: 0,
            total_extras: 0,
            gran_total_almuerzos: 0
          });
        }
      },
      error: () => {
        this.cargando = false;
        this.reporteAlmuerzo.set([]);
      }
    });
  }

  mostrarVisorPdf(enterAnimationDuration: string = '0ms', exitAnimationDuration: string = '0ms') {
    const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
    const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD');

    this.reporteService.exportar_list_almuerzo(fechaIniStr, fechaFinStr, this.habitacion_id).subscribe({
      next: (res: any) => {
        this.pdf_base64 = res;
        this.titulo_documento = 'Reporte de Almuerzos';
        this.dialogRef = this.dialog.open(PdfViewerComponent, {
          width: '80vw',
          maxWidth: '95vw',
          height: '85vh',
          enterAnimationDuration,
          exitAnimationDuration,
          data: { pdf_base64: this.pdf_base64, titulo_documento: this.titulo_documento },
          disableClose: true,
        });
      }
    });
  }

  exportarExcel() {
    const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
    const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD');

    this.reporteService.exportar_almuerzo_excel(fechaIniStr, fechaFinStr, this.habitacion_id).subscribe({
      next: (res) => {
        const nombreArchivo = `reporte_almuerzos_${fechaIniStr}_al_${fechaFinStr}.xlsx`;
        const byteCharacters = atob(res);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  busqueda(textoBusqueda: string) {
    this.dataSource.filter = (textoBusqueda || '').trim().toLowerCase();
  }

  getEstadoClass(estado: string): string {
    const e = (estado || '').toLowerCase();
    if (e.includes('check-in') || e.includes('check in')) return 'badge-checkin';
    if (e.includes('check-out') || e.includes('check out')) return 'badge-checkout';
    if (e.includes('confirm')) return 'badge-confirmada';
    return 'badge-default';
  }
}
