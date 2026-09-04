// MODELS
import { CotizacionModel } from '../../models/cotizacion.model';

// SERVICES
import { CotizacionService } from '../../services/cotizacion.service';
import { DocumentoService } from '../../services/documento.service';
import { AlertService } from '../../../base/services/local/alert.service';

// MATERIAL DESIGN
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

// COMPONENTS
import { CotizacionFormComponent } from './cotizacion-form/cotizacion-form';
import { CotizacionDetalleComponent } from './cotizacion_detalle/cotizacion_detalle';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { PdfViewerComponent } from '../../shared/views/pdf-viewer/pdf-viewer';

// VARIOS
import { AfterViewInit, Component, ViewChild, effect, inject, signal } from '@angular/core';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cotizacion',
  standalone: true,
  imports: [
    CommonModule,
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
  templateUrl: './cotizacion.html',
  styleUrl: './cotizacion.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }]
})
export class CotizacionComponent implements AfterViewInit {
  readonly dialog = inject(MatDialog);
  
  cotizaciones = signal<CotizacionModel[]>([]);
  cotizacion: CotizacionModel = new CotizacionModel();
  buttonEnabled = false;

  displayedColumns: string[] = [
    'actions',
    'correlativo',
    'cliente',
    'documento',
    'fecha_ini',
    'fecha_fin',
    'detalle',
    'documento_btn'
  ];
  dataSource: MatTableDataSource<CotizacionModel>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private cotizacionService: CotizacionService,
    private documentoService: DocumentoService,
    private alertService: AlertService
  ) {
    this.cargarDatos();

    effect(() => {
      this.dataSource = new MatTableDataSource<CotizacionModel>(this.cotizaciones());
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() { }

  cargarDatos() {
    this.cotizacionService.listar().subscribe({
      next: (res) => {
        this.cotizaciones.set(Array.isArray(res) ? res : []);
        this.buttonEnabled = true;
      },
      error: (err) => {
        console.error("Error al cargar cotizaciones:", err);
      }
    });
  }

  mostrarCotizaciones() {
    this.cotizacionService.listar().subscribe({
      next: (res) => {
        this.cotizaciones.set(Array.isArray(res) ? res : []);
      },
      error: (err) => console.error(err)
    });
  }

  actualizarDataSource(lista: CotizacionModel[]) {
    this.cotizaciones.set(lista);
  }

  mostrarFormularioNuevo() {
    this.cotizacion = new CotizacionModel();
    const dialogRef = this.dialog.open(CotizacionFormComponent, {
      data: { cotizacion: this.cotizacion, cotizaciones: this.cotizaciones },
      width: "98vw",
      maxWidth: "950px",
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mostrarCotizaciones();
      }
    });
  }

  mostrarEditar(item: CotizacionModel) {
    this.cotizacion = { ...item };
    const dialogRef = this.dialog.open(CotizacionFormComponent, {
      data: { cotizacion: this.cotizacion, cotizaciones: this.cotizaciones },
      width: "98vw",
      maxWidth: "950px",
      disableClose: true
    });
    this.cambiarfondoFila("azure");

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mostrarCotizaciones();
      }
      this.cambiarfondoFila("");
    });
  }

  verDocumento(item: CotizacionModel) {
    this.documentoService.obtenerVoucherCotizacion(item.id).subscribe({
      next: (pdfBase64: string) => {
        if (pdfBase64) {
          this.dialog.open(PdfViewerComponent, {
            width: '92vw',
            maxWidth: '1200px',
            height: '92vh',
            panelClass: 'pdf-viewer-dialog',
            data: {
              pdf_base64: pdfBase64,
              titulo_documento: `Cotización #${item.correlativo || item.id}`
            }
          });
        } else {
          this.alertService.show("No se pudo generar el documento PDF", { duration: 3000, type: 'warning' });
        }
      },
      error: () => {
        this.alertService.show("Error al obtener el documento PDF", { duration: 3000, type: 'error' });
      }
    });
  }

  mostrarDetalles(item: CotizacionModel) {
    this.cotizacion = { ...item };
    this.dialog.open(CotizacionDetalleComponent, {
      data: { cotizacion: this.cotizacion },
      width: "98vw",
      maxWidth: "900px",
      disableClose: true
    });
  }

  mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string, item: CotizacionModel) {
    this.cotizacion = item;
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: this.cotizacion.id
    });
    this.cambiarfondoFila("MistyRose");

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cotizacionService.eliminar(this.cotizacion.id).subscribe({
          next: (res) => {
            if (res.correcto) {
              const data = JSON.parse(res.dato);
              this.cotizaciones.set(data.cotizaciones);
              this.alertService.show("Cotización eliminada correctamente", { duration: 3000, type: 'success' });
            } else {
              this.alertService.show(res.mensaje || "Error al eliminar cotización", { duration: 5000, type: 'info' });
            }
          },
          error: (err) => console.error(err)
        });
      } else {
        this.cambiarfondoFila("");
      }
    });
  }

  busqueda(textoBusqueda: string) {
    const filterValue = textoBusqueda;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private cambiarfondoFila(color: string) {
    if (!this.cotizacion || !this.cotizacion.id) return;
    document.querySelectorAll<HTMLElement>("#fila" + this.cotizacion.id + " td").forEach(celda => {
      celda.style.backgroundColor = color;
    });
  }
}
