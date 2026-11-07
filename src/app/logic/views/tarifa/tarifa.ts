// MODELS
import { TarifaModel } from '../../models/tarifa.model';

// SERVICES
import { TarifaService } from '../../services/tarifa.service';
import { ServicioService } from '../../services/servicio.service';
import { PaqueteService } from '../../services/paquete.service';
import { TipoHospedajeService } from '../../services/tipo_hospedaje.service';
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
import { TarifaFormComponent } from './tarifa-form/tarifa-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { PdfViewerComponent } from '../../shared/views/pdf-viewer/pdf-viewer';

// VARIOS
import { AfterViewInit, Component, ViewChild, effect, inject, signal } from '@angular/core';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tarifa',
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
  templateUrl: './tarifa.html',
  styleUrl: './tarifa.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }]
})
export class TarifaComponent implements AfterViewInit {
  readonly dialog = inject(MatDialog);

  tarifas = signal<TarifaModel[]>([]);
  tarifa: TarifaModel = new TarifaModel();
  buttonEnabled = false;

  displayedColumns: string[] = [
    'actions',
    'servicio',
    'tipo_hospedaje',
    'paquete',
    'comida_incluida',
    'detalle',
    'tarifa_adulto',
    'tarifa_ninio'
  ];
  dataSource: MatTableDataSource<TarifaModel>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private tarifaService: TarifaService,
    private servicioService: ServicioService,
    private paqueteService: PaqueteService,
    private tipoHospedajeService: TipoHospedajeService,
    private alertService: AlertService
  ) {
    this.cargarDatos();

    effect(() => {
      this.dataSource = new MatTableDataSource<TarifaModel>(this.tarifas());
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() { }

  cargarDatos() {
    this.tarifaService.listar().subscribe({
      next: (res) => {
        this.tarifas.set(Array.isArray(res) ? res : []);
        this.buttonEnabled = true;
        this.servicioService.listar().subscribe();
        this.paqueteService.listar().subscribe();
        this.tipoHospedajeService.listar().subscribe();
      },
      error: (err) => {
        console.error("Error al cargar tarifas:", err);
      }
    });
  }

  mostrarTarifas() {
    this.tarifaService.listar().subscribe({
      next: (res) => {
        this.tarifas.set(Array.isArray(res) ? res : []);
      },
      error: (err) => console.error(err)
    });
  }

  actualizarDataSource(lista: TarifaModel[]) {
    this.tarifas.set(lista);
  }

  mostrarFormularioNuevo() {
    this.tarifa = new TarifaModel();
    const dialogRef = this.dialog.open(TarifaFormComponent, {
      data: { tarifa: this.tarifa, tarifas: this.tarifas },
      width: "98vw",
      maxWidth: "720px",
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mostrarTarifas();
      }
    });
  }

  mostrarEditar(item: TarifaModel) {
    this.tarifa = { ...item };
    const dialogRef = this.dialog.open(TarifaFormComponent, {
      data: { tarifa: this.tarifa, tarifas: this.tarifas },
      width: "98vw",
      maxWidth: "720px",
      disableClose: true
    });
    this.cambiarfondoFila("azure");

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mostrarTarifas();
      }
      this.cambiarfondoFila("");
    });
  }

  mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string, item: TarifaModel) {
    this.tarifa = item;
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: this.tarifa.id
    });
    this.cambiarfondoFila("MistyRose");

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tarifaService.eliminar(this.tarifa.id).subscribe({
          next: (res) => {
            if (res.correcto) {
              const data = JSON.parse(res.dato);
              this.tarifas.set(data.tarifas);
              this.alertService.show("Tarifa eliminada correctamente", { duration: 3000, type: 'success' });
            } else {
              this.alertService.show(res.mensaje || "Error al eliminar tarifa", { duration: 5000, type: 'info' });
            }
          },
          error: (err) => console.error(err)
        });
      } else {
        this.cambiarfondoFila("");
      }
    });
  }

  exportarPdf(enterAnimationDuration: string = '0ms', exitAnimationDuration: string = '0ms') {
    this.tarifaService.exportarPdf().subscribe({
      next: (res: string) => {
        if (!res) {
          this.alertService.show("No se pudo generar el reporte en PDF", { duration: 4000, type: 'error' });
          return;
        }
        this.dialog.open(PdfViewerComponent, {
          width: '85vw',
          maxWidth: '95vw',
          height: '85vh',
          enterAnimationDuration,
          exitAnimationDuration,
          data: { pdf_base64: res, titulo_documento: 'Tarifas de Hospedaje y Servicios' },
          disableClose: true,
        });
      },
      error: (err) => {
        console.error("Error al exportar PDF:", err);
        this.alertService.show("Error al generar el reporte en PDF", { duration: 4000, type: 'error' });
      }
    });
  }

  exportarExcel() {
    this.tarifaService.exportarExcel().subscribe({
      next: (res: string) => {
        if (!res) {
          this.alertService.show("No se pudo generar el archivo Excel", { duration: 4000, type: 'error' });
          return;
        }
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const nombreArchivo = `tarifas_${yyyy}-${mm}-${dd}.xlsx`;

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
      },
      error: (err) => {
        console.error("Error al exportar Excel:", err);
        this.alertService.show("Error al generar el archivo Excel", { duration: 4000, type: 'error' });
      }
    });
  }

  busqueda(textoBusqueda: string) {
    const filterValue = textoBusqueda;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private cambiarfondoFila(color: string) {
    if (!this.tarifa || !this.tarifa.id) return;
    document.querySelectorAll<HTMLElement>("#fila" + this.tarifa.id + " td").forEach(celda => {
      celda.style.backgroundColor = color;
    });
  }
}
