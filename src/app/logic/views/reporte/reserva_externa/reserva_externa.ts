import { Component, AfterViewInit, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import moment from 'moment';

// MODELS
import { ReporteReservaExternaModel, ReporteReservaExternaResumen, ReporteReservaExternaResponse } from '../../../models/reporte_reserva_externa.model';
import { UsuarioModel } from '../../../../base/models/usuario.model';

// SERVICES
import { ReporteService } from '../../../services/reporte.service';
import { UsuarioService } from '../../../../base/services/usuario.service';
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

// COMPONENT
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';

@Component({
  selector: 'app-reporte-reserva-externa',
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
    MatDatepickerModule
  ],
  templateUrl: './reserva_externa.html',
  styleUrl: './reserva_externa.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})
export class ReporteReservaExternaComponent implements AfterViewInit {
  reporteReservas = signal<ReporteReservaExternaModel[]>([]);
  resumen = signal<ReporteReservaExternaResumen>({
    total_reservas: 0,
    gran_total_ventas: 0,
    gran_total_pagado: 0,
    gran_total_saldo: 0
  });

  usuarios: UsuarioModel[] = [];
  usuario_id: any = null;
  fecha_ini: Date = moment().startOf('month').toDate();
  fecha_fin: Date = moment().endOf('month').toDate();

  dialogRef: any;
  pdf_base64: string = '';
  titulo_documento: string = '';

  displayedColumns: string[] = [
    'correlativo',
    'usuario_nombre',
    'fecha_registro',
    'estadia',
    'servicio_habitacion',
    'cliente',
    'estado',
    'total',
    'total_pagado',
    'saldo'
  ];

  dataSource = new MatTableDataSource<ReporteReservaExternaModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  readonly dialog = inject(MatDialog);

  constructor(
    private reporteService: ReporteService,
    private usuarioService: UsuarioService
  ) {
    this.cargarUsuarios();
    this.cargarDatos();

    effect(() => {
      this.dataSource = new MatTableDataSource<ReporteReservaExternaModel>(this.reporteReservas());
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (data: ReporteReservaExternaModel, filter: string) => {
        const str = `${data.correlativo} ${data.reserva_id} ${data.cliente} ${data.nro_documento} ${data.telefono} ${data.servicio_habitacion} ${data.usuario_nombre} ${data.estado} ${data.estadia} ${data.fecha_registro}`.toLowerCase();
        return str.includes(filter);
      };
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  cargarUsuarios() {
    this.usuarioService.listar().subscribe({
      next: (res) => {
        this.usuarios = res || [];
      },
      error: () => {
        this.usuarios = [];
      }
    });
  }

  cargarDatos() {
    const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
    const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD');

    this.reporteService.list_reserva_externa(fechaIniStr, fechaFinStr, this.usuario_id).subscribe({
      next: (res) => {
        if (res && res.dato) {
          const data: ReporteReservaExternaResponse = JSON.parse(res.dato);
          this.reporteReservas.set(data.reservas || []);
          this.resumen.set(data.resumen || {
            total_reservas: 0,
            gran_total_ventas: 0,
            gran_total_pagado: 0,
            gran_total_saldo: 0
          });
        } else {
          this.reporteReservas.set([]);
          this.resumen.set({
            total_reservas: 0,
            gran_total_ventas: 0,
            gran_total_pagado: 0,
            gran_total_saldo: 0
          });
        }
      },
      error: () => {
        this.reporteReservas.set([]);
        this.resumen.set({
          total_reservas: 0,
          gran_total_ventas: 0,
          gran_total_pagado: 0,
          gran_total_saldo: 0
        });
      }
    });
  }

  mostrarVisorPdf(enterAnimationDuration: string = '0ms', exitAnimationDuration: string = '0ms') {
    const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
    const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD');

    this.reporteService.exportar_list_reserva_externa(fechaIniStr, fechaFinStr, this.usuario_id).subscribe({
      next: (res: any) => {
        this.pdf_base64 = res;
        this.titulo_documento = 'Reporte de Reservas Externas';
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

    this.reporteService.exportar_reserva_externa_excel(fechaIniStr, fechaFinStr, this.usuario_id).subscribe({
      next: (res) => {
        const nombreArchivo = `reporte_reservas_externas_${fechaIniStr}_al_${fechaFinStr}.xlsx`;
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

  getNombreUsuario(u: UsuarioModel): string {
    return u.nombre_usuario || u.usuario || `${(u as any).nombre || ''} ${(u as any).primer_apellido || ''}`.trim() || `Usuario #${u.id}`;
  }
}
