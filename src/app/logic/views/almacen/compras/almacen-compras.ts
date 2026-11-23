import { AfterViewInit, Component, Inject, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';
import moment from 'moment';

import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';
import { AlertService } from '../../../../base/services/local/alert.service';
import { AlmacenService } from '../../../services/almacen.service';
import { InvCompraModel, InvProductoModel } from '../../../models/almacen.model';

// ============================================================================
// MODAL CATÁLOGO: SELECCIONAR PRODUCTO PARA COMPRA
// ============================================================================
@Component({
  selector: 'app-almacen-seleccionar-producto-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    CdkDrag,
    CdkDragHandle
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
  template: `
    <div>
      <h1 mat-dialog-title cdkDrag cdkDragRootElement=".cdk-overlay-pane" cdkDragHandle class="text-bg-dark dialog-header">
        <div class="d-flex align-items-center gap-2">
          <mat-icon style="color: white;">inventory_2</mat-icon>
          <span>CATÁLOGO DE PRODUCTOS</span>
        </div>
        <button mat-icon-button mat-dialog-close type="button">
          <mat-icon style="color: white;">close</mat-icon>
        </button>
      </h1>

      <div class="px-3 py-2 bg-light border-bottom">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-100">
          <mat-label>Buscar producto...</mat-label>
          <input matInput (keyup)="buscar(txtBusqueda.value)" #txtBusqueda placeholder="Código, nombre o categoría..." />
          <mat-icon matSuffix class="text-primary">search</mat-icon>
        </mat-form-field>
      </div>

      <mat-dialog-content class="mat-typography p-0">
        <div class="table-responsive">
          <table mat-table [dataSource]="dataSource" class="w-100">
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef class="text-center" style="width: 110px;">Acción</th>
              <td mat-cell *matCellDef="let row" class="text-center">
                <button
                  mat-raised-button
                  type="button"
                  (click)="seleccionar(row)"
                  [class.bg-success]="row.id === productoActualId"
                  [class.bg-primary]="row.id !== productoActualId"
                  class="text-white btn-sm"
                >
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">{{ row.id === productoActualId ? 'check_circle' : 'check' }}</mat-icon>
                  <span>{{ row.id === productoActualId ? 'Actual' : 'Elegir' }}</span>
                </button>
              </td>
            </ng-container>

            <ng-container matColumnDef="sku">
              <th mat-header-cell *matHeaderCellDef>Código</th>
              <td mat-cell *matCellDef="let row">{{ row.sku }}</td>
            </ng-container>

            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Producto</th>
              <td mat-cell *matCellDef="let row" class="fw-semibold">{{ row.nombre }}</td>
            </ng-container>

            <ng-container matColumnDef="categoria_nombre">
              <th mat-header-cell *matHeaderCellDef>Categoría</th>
              <td mat-cell *matCellDef="let row">{{ row.categoria_nombre }}</td>
            </ng-container>

            <ng-container matColumnDef="unidad_medida">
              <th mat-header-cell *matHeaderCellDef>Unidad</th>
              <td mat-cell *matCellDef="let row">{{ row.unidad_medida }}</td>
            </ng-container>

            <ng-container matColumnDef="stock_actual">
              <th mat-header-cell *matHeaderCellDef>Stock</th>
              <td mat-cell *matCellDef="let row">{{ row.stock_actual }}</td>
            </ng-container>

            <ng-container matColumnDef="costo_referencial">
              <th mat-header-cell *matHeaderCellDef>Costo Ref.</th>
              <td mat-cell *matCellDef="let row">{{ row.costo_referencial | number:'1.2-2' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-dark text-white"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
        <mat-paginator [pageSizeOptions]="[5, 10, 20]" [pageSize]="10" showFirstLastButtons class="bg-light"></mat-paginator>
      </mat-dialog-content>

      <mat-dialog-actions class="d-flex justify-content-end bg-light">
        <button mat-raised-button mat-dialog-close type="button" class="bg-primary text-white">Cerrar</button>
      </mat-dialog-actions>
    </div>
  `
})
export class AlmacenSeleccionarProductoModalComponent implements AfterViewInit {
  displayedColumns: string[] = ['select', 'sku', 'nombre', 'categoria_nombre', 'unidad_medida', 'stock_actual', 'costo_referencial'];
  dataSource: MatTableDataSource<InvProductoModel>;
  productoActualId: number | null = null;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public dialogRef: MatDialogRef<AlmacenSeleccionarProductoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { productos: InvProductoModel[]; productoActualId?: number | null }
  ) {
    this.dataSource = new MatTableDataSource<InvProductoModel>(data.productos || []);
    this.productoActualId = data.productoActualId || null;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  buscar(filtro: string): void {
    this.dataSource.filter = (filtro || '').trim().toLowerCase();
  }

  seleccionar(producto: InvProductoModel): void {
    this.dialogRef.close(producto);
  }
}

// ============================================================================
// DIALOG FORM: COMPRA DE ALMACÉN (CABECERA Y DETALLE)
// ============================================================================
@Component({
  selector: 'app-almacen-compra-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    BotonGuardarDirective,
    CdkDrag,
    CdkDragHandle
  ],
  template: `
    <form autocomplete="off" (ngSubmit)="guardar()" #f="ngForm">
      <h1 mat-dialog-title cdkDrag cdkDragRootElement=".cdk-overlay-pane" cdkDragHandle class="text-bg-dark dialog-header">
        COMPRAS DE ALMACEN
        <button mat-icon-button mat-dialog-close type="button">
          <mat-icon style="color:white">close</mat-icon>
        </button>
      </h1>

      <mat-dialog-content class="mat-typography px-2 pt-2">
        <div class="row row-cols-1 row-cols-md-2">
          <mat-form-field class="col">
            <mat-label>Proveedor</mat-label>
            <input matInput [(ngModel)]="compra.proveedor_nombre" name="proveedor_nombre" required />
          </mat-form-field>

          <mat-form-field class="col">
            <mat-label>Fecha de Compra</mat-label>
            <input matInput [matDatepicker]="picker_fecha" [(ngModel)]="compra.fecha" name="fecha" (click)="picker_fecha.open()" required />
            <mat-datepicker-toggle matIconSuffix [for]="picker_fecha"></mat-datepicker-toggle>
            <mat-datepicker #picker_fecha></mat-datepicker>
          </mat-form-field>

          <mat-form-field class="col">
            <mat-label>Observación</mat-label>
            <input matInput [(ngModel)]="compra.observacion" name="observacion" />
          </mat-form-field>
        </div>

        <div class="row align-items-center bg-light border rounded p-2 mx-0 mb-2">
          <div class="col-12 col-md-5">
            <mat-form-field class="w-100" subscriptSizing="dynamic">
              <mat-label>Producto</mat-label>
              <input
                matInput
                readonly
                [value]="nuevoProductoTexto"
                placeholder="Seleccione un producto..."
                (click)="abrirSelectorProducto()"
                style="cursor: pointer;"
              />
              <button mat-icon-button matSuffix type="button" class="text-primary" matTooltip="Buscar producto en catálogo" (click)="abrirSelectorProducto()">
                <mat-icon>search</mat-icon>
              </button>
            </mat-form-field>
          </div>

          <div class="col-6 col-md-3">
            <mat-form-field class="w-100" subscriptSizing="dynamic">
              <mat-label>Cantidad</mat-label>
              <input type="number" step="0.001" matInput [(ngModel)]="nuevaCantidad" name="nuevaCantidad" [ngModelOptions]="{standalone: true}" />
            </mat-form-field>
          </div>

          <div class="col-6 col-md-3">
            <mat-form-field class="w-100" subscriptSizing="dynamic">
              <mat-label>Costo Unit. (Bs.)</mat-label>
              <input type="number" step="0.01" matInput [(ngModel)]="nuevoCosto" name="nuevoCosto" [ngModelOptions]="{standalone: true}" />
            </mat-form-field>
          </div>

          <div class="col-12 col-md-1 text-center">
            <button mat-icon-button type="button" class="bg-success text-black" matTooltip="Agregar Ítem" (click)="agregarItem()">
              <mat-icon>add</mat-icon>
            </button>
          </div>
        </div>

        <div class="table-responsive border rounded">
          <table class="table table-sm align-middle mb-0">
            <thead class="bg-dark text-white">
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Unidad</th>
                <th class="text-end">Cantidad</th>
                <th class="text-end">Costo Unit.</th>
                <th class="text-end">Subtotal</th>
                <th class="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              @if (compra.detalles.length === 0) {
                <tr>
                  <td colspan="7" class="text-center py-3">No hay datos disponibles en el detalle</td>
                </tr>
              }
              @for (item of compra.detalles; track $index) {
                <tr>
                  <td>{{ item.producto_sku }}</td>
                  <td>{{ item.producto_nombre }}</td>
                  <td>{{ item.unidad_medida }}</td>
                  <td class="text-end">{{ item.cantidad }}</td>
                  <td class="text-end">{{ item.costo_unitario | number:'1.2-2' }}</td>
                  <td class="text-end fw-bold">{{ (item.cantidad * item.costo_unitario) | number:'1.2-2' }}</td>
                  <td class="text-center">
                    <button mat-icon-button type="button" class="text-danger" (click)="quitarItem($index)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
            <tfoot class="bg-light">
              <tr>
                <td colspan="5" class="text-end fw-bold">TOTAL COMPRA (Bs.):</td>
                <td class="text-end fw-bold">{{ calcularTotal() | number:'1.2-2' }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="d-flex justify-content-around bg-light">
        <button mat-raised-button mat-dialog-close type="button" class="bg-primary text-white">Cancelar</button>
        <button mat-raised-button type="submit" class="bg-success text-black" appBotonGuardar [form]="f">
          <mat-icon class="d-none"><mat-spinner diameter="18"></mat-spinner></mat-icon>Guardar
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class AlmacenCompraFormComponent {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
  readonly dialog = inject(MatDialog);
  compra: InvCompraModel;
  productos: InvProductoModel[] = [];

  nuevoProductoId = 0;
  nuevoProductoTexto = '';
  nuevaCantidad = 1;
  nuevoCosto = 0;

  constructor(
    public dialogRef: MatDialogRef<AlmacenCompraFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { compra: InvCompraModel; productos: InvProductoModel[] },
    private almacenService: AlmacenService,
    private alertService: AlertService
  ) {
    this.compra = {
      ...data.compra,
      fecha: (data.compra.fecha ? moment(data.compra.fecha) : moment()) as any,
      detalles: [...(data.compra.detalles || [])]
    };
    this.productos = data.productos || [];
    if (this.productos.length > 0) {
      this.onProductoChange(this.productos[0].id || 0);
    }
  }

  abrirSelectorProducto(): void {
    const selRef = this.dialog.open(AlmacenSeleccionarProductoModalComponent, {
      data: { productos: this.productos, productoActualId: this.nuevoProductoId || null },
      width: '98vw',
      maxWidth: '850px',
      disableClose: false
    });

    selRef.afterClosed().subscribe((prod: InvProductoModel | undefined) => {
      if (prod && prod.id) {
        this.onProductoChange(prod.id);
      }
    });
  }

  onProductoChange(id: number): void {
    this.nuevoProductoId = Number(id);
    const p = this.productos.find(x => Number(x.id) === this.nuevoProductoId);
    if (p) {
      this.nuevoProductoTexto = `[${p.sku}] ${p.nombre} (${p.unidad_medida})`;
      this.nuevoCosto = Number(p.costo_referencial || 0);
    }
  }

  agregarItem(): void {
    const p = this.productos.find(x => Number(x.id) === Number(this.nuevoProductoId));
    if (!p || !p.id || this.nuevaCantidad <= 0 || this.nuevoCosto < 0) {
      this.alertService.show('Seleccione un producto y cantidad válida', { duration: 3000, type: 'info' });
      return;
    }
    this.compra.detalles.push({
      producto_id: p.id,
      producto_sku: p.sku,
      producto_nombre: p.nombre,
      unidad_medida: p.unidad_medida,
      cantidad: Number(this.nuevaCantidad),
      costo_unitario: Number(this.nuevoCosto),
      subtotal: Number((this.nuevaCantidad * this.nuevoCosto).toFixed(4))
    });
    this.calcularTotal();
  }

  quitarItem(idx: number): void {
    this.compra.detalles.splice(idx, 1);
    this.calcularTotal();
  }

  calcularTotal(): number {
    const t = (this.compra.detalles || []).reduce((acc, it) => acc + Number(it.cantidad) * Number(it.costo_unitario), 0);
    this.compra.total = Number(t.toFixed(2));
    return this.compra.total;
  }

  guardar(): void {
    if (!this.compra.proveedor_nombre?.trim()) {
      this.alertService.show('Debe ingresar el Proveedor', { duration: 3000, type: 'info' });
      return;
    }
    if (this.compra.detalles.length === 0) {
      this.alertService.show('Debe agregar al menos un producto al detalle', { duration: 3000, type: 'info' });
      return;
    }

    this.botonGuardarDirectiva.deshabilitarFormBoton();
    const payload: InvCompraModel = {
      ...this.compra,
      fecha: moment(this.compra.fecha).format('YYYY-MM-DD')
    };
    const obs = this.compra.id
      ? this.almacenService.actualizarCompra(this.compra.id, payload)
      : this.almacenService.crearCompra(payload);

    obs.subscribe({
      next: res => {
        if (res.correcto) {
          this.dialogRef.close(res);
        } else {
          this.botonGuardarDirectiva.habilitarFormBoton();
          this.alertService.show(res.mensaje || 'Error al guardar la compra', { duration: 3500, type: 'info' });
        }
      },
      error: () => {
        this.botonGuardarDirectiva.habilitarFormBoton();
        this.alertService.show('Error al guardar la compra', { duration: 3500, type: 'error' });
      }
    });
  }
}

// ============================================================================
// VISTA PRINCIPAL: COMPRAS DE ALMACÉN
// ============================================================================
@Component({
  selector: 'app-almacen-compras',
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
  templateUrl: './almacen-compras.html',
  styleUrl: './almacen-compras.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }]
})
export class AlmacenComprasComponent implements AfterViewInit {
  readonly dialog = inject(MatDialog);
  compras: InvCompraModel[] = [];
  compra!: InvCompraModel;
  productos: InvProductoModel[] = [];
  buttonEnabled = false;

  displayedColumns: string[] = [
    'actions',
    'proveedor_nombre',
    'fecha',
    'total',
    'observacion'
  ];
  dataSource: MatTableDataSource<InvCompraModel> = new MatTableDataSource<InvCompraModel>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private almacenService: AlmacenService,
    private alertService: AlertService
  ) {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {}

  cargarDatos(): void {
    forkJoin({
      compras: this.almacenService.listarCompras(),
      productos: this.almacenService.listarProductos()
    }).subscribe({
      next: res => {
        this.actualizarDataSource(res.compras || []);
        this.productos = res.productos || [];
        this.buttonEnabled = true;
      }
    });
  }

  actualizarDataSource(lista: InvCompraModel[]): void {
    this.compras = lista;
    this.dataSource = new MatTableDataSource<InvCompraModel>(lista);
    this.dataSource.paginator = this.paginator;
  }

  mostrarFormularioNuevo(): void {
    const nueva: InvCompraModel = {
      proveedor_nombre: '',
      fecha: new Date().toISOString().slice(0, 10),
      observacion: '',
      detalles: []
    };
    const dialogRef = this.dialog.open(AlmacenCompraFormComponent, {
      data: { compra: nueva, productos: this.productos },
      width: '98vw',
      maxWidth: '850px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res?.correcto) {
        const data = JSON.parse(res.dato);
        this.actualizarDataSource(data.compras);
      }
    });
  }

  mostrarEditar(a: InvCompraModel): void {
    this.compra = { ...a };
    const dialogRef = this.dialog.open(AlmacenCompraFormComponent, {
      data: { compra: this.compra, productos: this.productos },
      width: '98vw',
      maxWidth: '850px',
      disableClose: true
    });
    this.cambiarfondoFila('azure');
    dialogRef.afterClosed().subscribe(res => {
      if (res?.correcto) {
        const data = JSON.parse(res.dato);
        this.actualizarDataSource(data.compras);
      }
      this.cambiarfondoFila('');
    });
  }

  mostrarConfirmarAnular(enterAnimationDuration: string, exitAnimationDuration: string, a: InvCompraModel): void {
    this.compra = a;
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: this.compra.id
    });
    this.cambiarfondoFila('MistyRose');
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.compra.id) {
        this.almacenService.eliminarCompra(this.compra.id).subscribe({
          next: res => {
            if (res.correcto) {
              const data = JSON.parse(res.dato);
              this.actualizarDataSource(data.compras);
            } else {
              this.cambiarfondoFila('');
              this.alertService.show(res.mensaje || 'No se pudo anular la compra', { duration: 4500, type: 'info' });
            }
          },
          error: () => {
            this.cambiarfondoFila('');
            this.alertService.show('No se pudo anular la compra', { duration: 4500, type: 'error' });
          }
        });
      } else {
        this.cambiarfondoFila('');
      }
    });
  }

  busqueda(textoBusqueda: string): void {
    this.dataSource.filter = (textoBusqueda || '').trim().toLowerCase();
  }

  private cambiarfondoFila(color: string): void {
    if (!this.compra?.id) return;
    document.querySelectorAll<HTMLElement>('#fila' + this.compra.id + ' td').forEach(celda => {
      celda.style.backgroundColor = color;
    });
  }
}
