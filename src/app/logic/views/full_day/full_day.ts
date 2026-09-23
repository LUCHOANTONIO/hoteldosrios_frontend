// MODELS
import { FullDayModel } from '../../models/full_day.model';
import { TipoDocumentoModel } from '../../../base/models/tipodocumento.model';
import { PaisModel } from '../../models/pais.model';
import { CanalReservaModel } from '../../models/canal_reserva.model';
import { FormaPagoModel } from '../../models/forma_pago.model';
import { ProductoModel } from '../../models/producto.model';

// SERVICES
import { FullDayService } from '../../services/full_day.service';
import { TipoDocumentoService } from '../../../base/services/tipodocumento.service';
import { PaisService } from '../../services/pais.service';
import { CanalReservaService } from '../../services/canal_reserva.service';
import { FormaPagoService } from '../../services/forma_pago.service';
import { ProductoService } from '../../services/producto.service';
import { DocumentoService } from '../../services/documento.service';
import { AlertService } from '../../../base/services/local/alert.service';

// MATERIAL
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

// COMPONENTS
import { FullDayFormComponent } from './full_day-form/full_day-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { PdfViewerComponent } from '../../shared/views/pdf-viewer/pdf-viewer';

// VARIOS
import { AfterViewInit, Component, OnInit, ViewChild, effect, inject, signal } from '@angular/core';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import moment from 'moment';

@Component({
  selector: 'app-full-day',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './full_day.html',
  styleUrls: ['./full_day.scss'],
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }]
})
export class FullDayComponent implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private fullDayService = inject(FullDayService);
  private tipoDocumentoService = inject(TipoDocumentoService);
  private paisService = inject(PaisService);
  private canalReservaService = inject(CanalReservaService);
  private formaPagoService = inject(FormaPagoService);
  private productoService = inject(ProductoService);
  private documentoService = inject(DocumentoService);
  private alertService = inject(AlertService);

  fullDays = signal<FullDayModel[]>([]);
  reserva: FullDayModel = new FullDayModel();
  buttonEnabled = false;

  tipo_documentos: TipoDocumentoModel[] = [];
  paises: PaisModel[] = [];
  canal_reservas: CanalReservaModel[] = [];
  forma_pagos: FormaPagoModel[] = [];
  productos: ProductoModel[] = [];

  displayedColumns: string[] = [
    'actions',
    'documento_btn',
    'correlativo',
    'fecha',
    'hora',
    'cliente',
    'telefono',
    'nro_documento',
    'personas',
    'total',
    'pagado',
    'saldo',
    'estado'
  ];

  dataSource = new MatTableDataSource<FullDayModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    effect(() => {
      this.dataSource = new MatTableDataSource<FullDayModel>(this.fullDays());
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  ngOnInit(): void {
    this.cargarAuxiliares();
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  cargarAuxiliares(): void {
    forkJoin({
      tipo_documentos: this.tipoDocumentoService.listar(),
      paises: this.paisService.listar(),
      canal_reservas: this.canalReservaService.listar(),
      forma_pagos: this.formaPagoService.listar(),
      productos: this.productoService.listar()
    }).subscribe({
      next: (res) => {
        this.tipo_documentos = res.tipo_documentos;
        this.paises = res.paises;
        this.canal_reservas = res.canal_reservas;
        this.forma_pagos = res.forma_pagos;
        this.productos = res.productos;
      },
      error: (err) => console.error("Error al cargar auxiliares:", err)
    });
  }

  cargarDatos(): void {
    this.fullDayService.listar().subscribe({
      next: (res) => {
        if (res.correcto) {
          const list = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
          this.fullDays.set(Array.isArray(list) ? list : []);
          this.buttonEnabled = true;
        } else {
          this.alertService.show(res.mensaje || "Error al cargar datos", { duration: 4000, type: 'info' });
        }
      },
      error: (err) => {
        console.error("Error al cargar Full Day list:", err);
      }
    });
  }

  busqueda(texto: string): void {
    this.dataSource.filter = (texto || '').trim().toLowerCase();
  }

  mostrarFormularioNuevo(): void {
    const nuevaReserva = new FullDayModel();
    nuevaReserva.is_full_day = true;
    nuevaReserva.habitacion_id = null;
    nuevaReserva.fecha_ini = moment().format('YYYY-MM-DD');
    nuevaReserva.fecha_fin = nuevaReserva.fecha_ini;
    nuevaReserva.hora_llegada = '09:00';

    const dialogRef = this.dialog.open(FullDayFormComponent, {
      width: "98vw",
      maxWidth: "600px",
      disableClose: true,
      data: {
        reserva: nuevaReserva,
        tipo_documentos: this.tipo_documentos,
        paises: this.paises,
        canal_reservas: this.canal_reservas,
        forma_pagos: this.forma_pagos,
        productos: this.productos
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.cargarDatos();
    });
  }

  mostrarEditar(item: FullDayModel): void {
    this.reserva = { ...item };
    this.cambiarfondoFila("azure");

    this.fullDayService.mostrar(item.id).subscribe({
      next: (res) => {
        const fullDayData = res.reserva || item;
        const dialogRef = this.dialog.open(FullDayFormComponent, {
          width: "98vw",
          maxWidth: "600px",
          disableClose: true,
          data: {
            reserva: fullDayData,
            tipo_documentos: this.tipo_documentos,
            paises: this.paises,
            canal_reservas: this.canal_reservas,
            forma_pagos: this.forma_pagos,
            productos: this.productos
          }
        });

        dialogRef.afterClosed().subscribe(() => {
          this.cargarDatos();
          this.cambiarfondoFila("");
        });
      },
      error: (err) => {
        console.error("Error al obtener detalle Full Day:", err);
        const dialogRef = this.dialog.open(FullDayFormComponent, {
          width: "98vw",
          maxWidth: "600px",
          disableClose: true,
          data: {
            reserva: item,
            tipo_documentos: this.tipo_documentos,
            paises: this.paises,
            canal_reservas: this.canal_reservas,
            forma_pagos: this.forma_pagos,
            productos: this.productos
          }
        });

        dialogRef.afterClosed().subscribe(() => {
          this.cargarDatos();
          this.cambiarfondoFila("");
        });
      }
    });
  }

  mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string, item: FullDayModel): void {
    this.reserva = item;
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: item.id
    });
    this.cambiarfondoFila("MistyRose");

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fullDayService.eliminar(item.id).subscribe({
          next: (res) => {
            if (res.correcto) {
              this.alertService.show("Full Day eliminado correctamente", { duration: 4000, type: 'success' });
              this.cargarDatos();
            } else {
              this.alertService.show(res.mensaje || "Error al eliminar", { duration: 5000, type: 'info' });
              this.cambiarfondoFila("");
            }
          },
          error: (err) => {
            console.error("Error al eliminar:", err);
            this.cambiarfondoFila("");
          }
        });
      } else {
        this.cambiarfondoFila("");
      }
    });
  }

  verVoucher(item: FullDayModel): void {
    this.documentoService.obtenerVoucherReserva(item.id).subscribe({
      next: (pdfBase64: string) => {
        if (pdfBase64) {
          this.dialog.open(PdfViewerComponent, {
            width: '92vw',
            maxWidth: '1200px',
            height: '92vh',
            data: {
              pdf_base64: pdfBase64,
              titulo_documento: `Voucher Full Day #${item.correlativo || item.id}`
            }
          });
        } else {
          this.alertService.show("No se pudo generar el comprobante PDF", { duration: 3000, type: 'warning' });
        }
      },
      error: () => {
        this.alertService.show("Error al obtener el comprobante PDF", { duration: 3000, type: 'error' });
      }
    });
  }

  private cambiarfondoFila(color: string): void {
    if (!this.reserva || !this.reserva.id) return;
    document.querySelectorAll<HTMLElement>("#fila" + this.reserva.id + " td").forEach(celda => {
      celda.style.backgroundColor = color;
    });
  }
}
