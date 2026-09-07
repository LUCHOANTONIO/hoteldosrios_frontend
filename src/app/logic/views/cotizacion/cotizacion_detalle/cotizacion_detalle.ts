// MODELS
import { CotizacionModel } from '../../../models/cotizacion.model';
import { CotizacionDetalleModel } from '../../../models/cotizacion_detalle.model';

// SERVICES
import { CotizacionDetalleService } from '../../../services/cotizacion_detalle.service';
import { AlertService } from '../../../../base/services/local/alert.service';

// MATERIAL DESIGN
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, NgForm } from '@angular/forms';

// COMPONENT
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

// VARIOS
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cotizacion-detalle',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    FormsModule
  ],
  templateUrl: './cotizacion_detalle.html',
  styleUrl: './cotizacion_detalle.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }]
})
export class CotizacionDetalleComponent implements AfterViewInit {
  cotizacion: CotizacionModel;
  cotizacion_id: number;
  detalles: CotizacionDetalleModel[] = [];
  detalle_actual: CotizacionDetalleModel = new CotizacionDetalleModel();
  
  editandoIndex: number = -1;
  mostrarFormItem: boolean = false;

  displayedColumns: string[] = [
    'actions',
    'servicio_paquete',
    'cantidad_adulto',
    'precio_unit_adulto',
    'cantidad_ninio',
    'precio_unit_ninio',
    'precio_mascota',
    'precio_extra',
    'subtotal'
  ];
  dataSource: MatTableDataSource<CotizacionDetalleModel>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  totalGeneral: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CotizacionDetalleComponent>,
    private cotizacionDetalleService: CotizacionDetalleService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {
    this.cotizacion = data.cotizacion;
    this.cotizacion_id = this.cotizacion.id;
    this.cargarDatos();
  }

  ngAfterViewInit() { }

  cargarDatos() {
    this.cotizacionDetalleService.listar(this.cotizacion_id).subscribe({
      next: (res: any) => {
        this.detalles = Array.isArray(res) ? res : [];
        this.actualizarDataSource(this.detalles);
      },
      error: (err) => {
        console.error("Error al cargar detalles de cotización:", err);
      }
    });
  }

  actualizarDataSource(lista: CotizacionDetalleModel[]) {
    this.detalles = lista;
    this.dataSource = new MatTableDataSource<CotizacionDetalleModel>(lista);
    this.dataSource.paginator = this.paginator;
    this.calcularTotalGeneral();
  }

  calcularTotalGeneral() {
    this.totalGeneral = this.detalles.reduce((acc, item) => {
      const pMascota = Math.max(0, Number(item.precio_mascota) || 0);
      const pExtra = Math.max(0, Number(item.precio_extra) || 0);
      const sub = Number(item.subtotal) || 
        ((Number(item.cantidad_adulto) || 0) * (Number(item.precio_unit_adulto) || 0) +
         (Number(item.cantidad_ninio) || 0) * (Number(item.precio_unit_ninio) || 0) +
         pMascota + pExtra);
      return acc + sub;
    }, 0);
  }

  calcularSubtotalActual(): number {
    const cantAd = Number(this.detalle_actual.cantidad_adulto) || 0;
    const preAd = Number(this.detalle_actual.precio_unit_adulto) || 0;
    const cantNi = Number(this.detalle_actual.cantidad_ninio) || 0;
    const preNi = Number(this.detalle_actual.precio_unit_ninio) || 0;
    const pMascota = Number(this.detalle_actual.precio_mascota) || 0;
    const pExtra = Number(this.detalle_actual.precio_extra) || 0;
    return (cantAd * preAd) + (cantNi * preNi) + pMascota + pExtra;
  }

  nuevoDetalle() {
    this.detalle_actual = new CotizacionDetalleModel();
    this.detalle_actual.cotizacion_id = this.cotizacion_id;
    this.detalle_actual.tarifa_id = 1; // Default tarifa_id
    this.detalle_actual.cantidad_adulto = 1;
    this.detalle_actual.precio_unit_adulto = 0;
    this.detalle_actual.cantidad_ninio = 0;
    this.detalle_actual.precio_unit_ninio = 0;
    this.detalle_actual.precio_mascota = 0;
    this.detalle_actual.precio_extra = 0;
    this.editandoIndex = -1;
    this.mostrarFormItem = true;
  }

  editarDetalle(item: CotizacionDetalleModel, index: number) {
    this.detalle_actual = { ...item };
    this.editandoIndex = index;
    this.mostrarFormItem = true;
  }

  cancelarEdicion() {
    this.mostrarFormItem = false;
    this.detalle_actual = new CotizacionDetalleModel();
    this.editandoIndex = -1;
  }

  guardarDetalle(f: NgForm) {
    if (!f.valid) {
      this.alertService.show("Complete los datos requeridos del item", { duration: 3000, type: 'info' });
      return;
    }

    this.detalle_actual.cotizacion_id = this.cotizacion_id;
    this.detalle_actual.subtotal = this.calcularSubtotalActual();

    if (this.detalle_actual.id > 0) {
      this.cotizacionDetalleService.modificar(this.detalle_actual).subscribe({
        next: (res) => {
          if (res.correcto) {
            this.alertService.show("Item actualizado correctamente", { duration: 3000, type: 'success' });
            this.cargarDatos();
            this.cancelarEdicion();
          } else {
            this.alertService.show(res.mensaje || "Error al actualizar item", { duration: 5000, type: 'info' });
          }
        },
        error: (err) => console.error(err)
      });
    } else {
      this.cotizacionDetalleService.crear(this.detalle_actual).subscribe({
        next: (res) => {
          if (res.correcto) {
            this.alertService.show("Item agregado correctamente", { duration: 3000, type: 'success' });
            this.cargarDatos();
            this.cancelarEdicion();
          } else {
            this.alertService.show(res.mensaje || "Error al agregar item", { duration: 5000, type: 'info' });
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  eliminarDetalle(item: CotizacionDetalleModel) {
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      data: item.id
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cotizacionDetalleService.eliminar(item.id).subscribe({
          next: (res) => {
            if (res.correcto) {
              this.alertService.show("Item eliminado", { duration: 3000, type: 'success' });
              this.cargarDatos();
            } else {
              this.alertService.show(res.mensaje || "Error al eliminar item", { duration: 5000, type: 'info' });
            }
          },
          error: (err) => console.error(err)
        });
      }
    });
  }
}
