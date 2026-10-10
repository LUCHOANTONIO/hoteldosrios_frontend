import { Component, AfterViewInit, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import moment from 'moment';

// MODELS
import { ReporteAlimentoModel, ReporteAlimentoResumen, ReporteAlimentoResponse } from '../../../models/reporte_alimento.model';
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

// COMPONENT
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';

@Component({
  selector: 'app-reporte-alimento',
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
    MatTooltipModule
  ],
  templateUrl: './alimento.html',
  styleUrl: './alimento.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})
export class ReporteAlimentoComponent implements AfterViewInit {
  reporteAlimento = signal<ReporteAlimentoModel[]>([]);
  resumen = signal<ReporteAlimentoResumen>({
    total_reservas: 0,
    total_adultos: 0,
    total_ninios: 0,
    total_incluidos: 0,
    total_extras: 0,
    gran_total_alimentos: 0
  });

  habitaciones: HabitacionModel[] = [];
  fecha_ini: Date = new Date();
  fecha_fin: Date = new Date();
  habitacion_id: any = null;
  filtroActivo: 'hoy' | 'manana' | 'semana' | 'personalizado' = 'hoy';

  dialogRef: any;
  pdf_base64: String = '';
  titulo_documento: string = '';

  displayedColumns: string[] = [
    'nro_reserva',
    'habitacion',
    'cliente',
    'fecha_ingreso',
    'fecha_salida',
    'cantidad_adulto',
    'cantidad_ninio',
    'alimentos_incluidos',
    'alimentos_extras',
    'total_alimentos',
    'notas',
    'estado'
  ];

  dataSource = new MatTableDataSource<ReporteAlimentoModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  volverCalendario() {
    this.router.navigate(['/timeline']);
  }

  constructor(
    private reporteService: ReporteService,
    private habitacionService: HabitacionService
  ) {
    this.cargarHabitaciones();
    this.cargarDatos();

    effect(() => {
      this.dataSource = new MatTableDataSource<ReporteAlimentoModel>(this.reporteAlimento());
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (data: ReporteAlimentoModel, filter: string) => {
        const str = `${data.nro_reserva} ${data.correlativo} ${data.cliente} ${data.habitacion} ${data.notas} ${data.estado} ${data.nro_documento}`.toLowerCase();
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
    const hoy = moment().startOf('day');

    if (tipo === 'hoy') {
      this.fecha_ini = hoy.toDate();
      this.fecha_fin = hoy.toDate();
    } else if (tipo === 'manana') {
      const manana = moment().add(1, 'day').startOf('day');
      this.fecha_ini = manana.toDate();
      this.fecha_fin = manana.toDate();
    } else if (tipo === 'semana') {
      this.fecha_ini = moment().startOf('week').toDate();
      this.fecha_fin = moment().endOf('week').toDate();
    }

    this.cargarDatos();
  }

  onRangoChange() {
    this.filtroActivo = 'personalizado';
    this.cargarDatos();
  }

  cargarDatos() {
    const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
    const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD');

    this.reporteService.list_alimento(fechaIniStr, fechaFinStr, this.habitacion_id).subscribe({
      next: (res) => {
        if (res && res.dato) {
          const data: ReporteAlimentoResponse = JSON.parse(res.dato);
          this.reporteAlimento.set(data.reservas || []);
          this.resumen.set(data.resumen || {
            total_reservas: 0,
            total_adultos: 0,
            total_ninios: 0,
            total_incluidos: 0,
            total_extras: 0,
            gran_total_alimentos: 0
          });
        } else {
          this.reporteAlimento.set([]);
          this.resumen.set({
            total_reservas: 0,
            total_adultos: 0,
            total_ninios: 0,
            total_incluidos: 0,
            total_extras: 0,
            gran_total_alimentos: 0
          });
        }
      },
      error: () => {
        this.reporteAlimento.set([]);
      }
    });
  }

  mostrarVisorPdf(enterAnimationDuration: string, exitAnimationDuration: string) {
    const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
    const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD');

    this.reporteService.exportar_list_alimento(fechaIniStr, fechaFinStr, this.habitacion_id).subscribe({
      next: (res: any) => {
        this.pdf_base64 = res;
        this.titulo_documento = 'Servicio de Alimentos';
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

    this.reporteService.exportar_alimento_excel(fechaIniStr, fechaFinStr, this.habitacion_id).subscribe({
      next: (res) => {
        const nombreArchivo = `servicio_alimentos_${fechaIniStr}_al_${fechaFinStr}.xlsx`;
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
    const est = (estado || '').toLowerCase();
    if (est.includes('confir') || est.includes('reserv')) return 'badge-confirmada';
    if (est.includes('check') || est.includes('ingres') || est.includes('hosped')) return 'badge-checkin';
    if (est.includes('salid') || est.includes('out')) return 'badge-checkout';
    return 'badge-default';
  }
}
