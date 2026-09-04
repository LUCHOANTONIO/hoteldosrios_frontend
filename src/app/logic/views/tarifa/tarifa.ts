// MODELS
import { TarifaModel } from '../../models/tarifa.model';

// SERVICES
import { TarifaService } from '../../services/tarifa.service';
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
      maxWidth: "650px",
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
      maxWidth: "650px",
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
