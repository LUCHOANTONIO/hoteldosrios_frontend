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
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';

import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { AlertService } from '../../../../base/services/local/alert.service';
import { AlmacenService } from '../../../services/almacen.service';
import { InvCategoriaModel, InvProductoModel, InvUnidadMedidaModel } from '../../../models/almacen.model';

// ============================================================================
// DIALOG FORM: CATEGORÍA DE ALMACÉN
// ============================================================================
@Component({
  selector: 'app-almacen-categoria-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CdkDrag,
    CdkDragHandle
  ],
  template: `
    <form autocomplete="off" (ngSubmit)="submit(f)" #f="ngForm">
      <h1 mat-dialog-title cdkDrag cdkDragRootElement=".cdk-overlay-pane" cdkDragHandle class="text-bg-dark dialog-header">
        CATEGORIA DE ALMACEN
        <button mat-icon-button mat-dialog-close type="button">
          <mat-icon style="color:white">close</mat-icon>
        </button>
      </h1>

      <mat-dialog-content class="mat-typography row row-cols-1 px-0 pt-2">
        <mat-form-field class="col">
          <mat-label>Nombre de Categoría</mat-label>
          <input matInput [(ngModel)]="categoria.nombre" name="nombre" required />
        </mat-form-field>

        <mat-form-field class="col">
          <mat-label>Descripción</mat-label>
          <input matInput [(ngModel)]="categoria.descripcion" name="descripcion" />
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions class="d-flex justify-content-around bg-light">
        <button mat-raised-button mat-dialog-close type="button" class="bg-primary text-white">Cancelar</button>
        <button mat-raised-button type="submit" class="bg-success text-black" [disabled]="guardando">Guardar</button>
      </mat-dialog-actions>
    </form>
  `
})
export class AlmacenCategoriaFormComponent {
  categoria: InvCategoriaModel;
  guardando = false;

  constructor(
    public dialogRef: MatDialogRef<AlmacenCategoriaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categoria: InvCategoriaModel },
    private almacenService: AlmacenService,
    private alertService: AlertService
  ) {
    this.categoria = { ...data.categoria };
  }

  submit(f: NgForm): void {
    if (!f.valid || !this.categoria.nombre?.trim()) {
      this.alertService.show('Debe llenar los campos obligatorios', { duration: 3000, type: 'info' });
      return;
    }
    this.guardando = true;
    const obs = this.categoria.id
      ? this.almacenService.actualizarCategoria(this.categoria.id, this.categoria)
      : this.almacenService.crearCategoria(this.categoria);

    obs.subscribe({
      next: res => {
        if (res.correcto) {
          this.dialogRef.close(res);
        } else {
          this.guardando = false;
          this.alertService.show(res.mensaje || 'Error al guardar categoría', { duration: 3500, type: 'info' });
        }
      },
      error: () => {
        this.guardando = false;
        this.alertService.show('Error al guardar categoría', { duration: 3500, type: 'error' });
      }
    });
  }
}

// ============================================================================
// DIALOG FORM: PRODUCTO DE ALMACÉN (CON ALTA DE CATEGORÍA EN OTRO MODAL)
// ============================================================================
@Component({
  selector: 'app-almacen-producto-form',
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
    CdkDrag,
    CdkDragHandle
  ],
  template: `
    <form autocomplete="off" (ngSubmit)="submit(f)" #f="ngForm">
      <h1 mat-dialog-title cdkDrag cdkDragRootElement=".cdk-overlay-pane" cdkDragHandle class="text-bg-dark dialog-header">
        PRODUCTOS DE ALMACEN
        <button mat-icon-button mat-dialog-close type="button">
          <mat-icon style="color:white">close</mat-icon>
        </button>
      </h1>

      <mat-dialog-content class="mat-typography row row-cols-1 row-cols-md-2 px-0 pt-2">
        <mat-form-field class="col">
          <mat-label>SKU / Código</mat-label>
          <input matInput [(ngModel)]="producto.sku" name="sku" required />
        </mat-form-field>

        <mat-form-field class="col">
          <mat-label>Nombre del Producto</mat-label>
          <input matInput [(ngModel)]="producto.nombre" name="nombre" required />
        </mat-form-field>

        <div class="col d-flex align-items-start gap-1">
          <mat-form-field class="flex-grow-1">
            <mat-label>Categoría</mat-label>
            <mat-select [(ngModel)]="producto.categoria_id" name="categoria_id" required>
              @for (x of categorias; track x.id) {
                <mat-option [value]="x.id">{{ x.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button
            mat-icon-button
            type="button"
            class="bg-success text-black mt-2"
            matTooltip="Nueva Categoría"
            (click)="abrirModalNuevaCategoria()"
          >
            <mat-icon>add</mat-icon>
          </button>
        </div>

        <mat-form-field class="col">
          <mat-label>Unidad de Medida</mat-label>
          <mat-select [(ngModel)]="producto.unidad_medida_id" name="unidad_medida_id" required>
            @for (u of unidadesMedida; track u.unidad_medida_id) {
              <mat-option [value]="u.unidad_medida_id">{{ u.descripcion }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field class="col">
          <mat-label>Stock Mínimo</mat-label>
          <input type="number" step="0.001" matInput [(ngModel)]="producto.stock_minimo" name="stock_minimo" required />
        </mat-form-field>

        <mat-form-field class="col">
          <mat-label>Costo Referencial (Bs.)</mat-label>
          <input type="number" step="0.01" matInput [(ngModel)]="producto.costo_referencial" name="costo_referencial" required />
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions class="d-flex justify-content-around bg-light">
        <button mat-raised-button mat-dialog-close type="button" class="bg-primary text-white">Cancelar</button>
        <button mat-raised-button type="submit" class="bg-success text-black" [disabled]="guardando">Guardar</button>
      </mat-dialog-actions>
    </form>
  `
})
export class AlmacenProductoFormComponent {
  readonly dialog = inject(MatDialog);
  producto: InvProductoModel;
  categorias: InvCategoriaModel[] = [];
  unidadesMedida: InvUnidadMedidaModel[] = [];
  guardando = false;

  constructor(
    public dialogRef: MatDialogRef<AlmacenProductoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { producto: InvProductoModel; categorias: InvCategoriaModel[]; unidadesMedida: InvUnidadMedidaModel[] },
    private almacenService: AlmacenService,
    private alertService: AlertService
  ) {
    this.producto = { ...data.producto };
    this.categorias = [...(data.categorias || [])];
    this.unidadesMedida = [...(data.unidadesMedida || [])];
    if (!this.producto.unidad_medida_id && this.unidadesMedida.length > 0) {
      this.producto.unidad_medida_id = this.unidadesMedida[0].unidad_medida_id;
    }
  }

  abrirModalNuevaCategoria(): void {
    const catDialogRef = this.dialog.open(AlmacenCategoriaFormComponent, {
      data: { categoria: { nombre: '', descripcion: '' } },
      width: '98vw',
      maxWidth: '500px',
      disableClose: true
    });

    catDialogRef.afterClosed().subscribe(res => {
      if (res?.correcto) {
        const data = JSON.parse(res.dato);
        if (data.categorias) {
          this.categorias = data.categorias;
        }
        if (data.categoria?.id) {
          this.producto.categoria_id = data.categoria.id;
        }
      }
    });
  }

  submit(f: NgForm): void {
    if (!f.valid || !this.producto.sku?.trim() || !this.producto.nombre?.trim() || !this.producto.categoria_id) {
      this.alertService.show('Debe llenar los campos obligatorios', { duration: 3000, type: 'info' });
      return;
    }
    this.guardando = true;
    const obs = this.producto.id
      ? this.almacenService.actualizarProducto(this.producto.id, this.producto)
      : this.almacenService.crearProducto(this.producto);

    obs.subscribe({
      next: res => {
        if (res.correcto) {
          this.dialogRef.close({ res, categorias: this.categorias });
        } else {
          this.guardando = false;
          this.alertService.show(res.mensaje || 'Error al guardar producto', { duration: 3500, type: 'info' });
        }
      },
      error: () => {
        this.guardando = false;
        this.alertService.show('Error al guardar producto', { duration: 3500, type: 'error' });
      }
    });
  }
}

// ============================================================================
// VISTA PRINCIPAL: PRODUCTOS DE ALMACÉN
// ============================================================================
@Component({
  selector: 'app-almacen-productos',
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
  templateUrl: './almacen-productos.html',
  styleUrl: './almacen-productos.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }]
})
export class AlmacenProductosComponent implements AfterViewInit {
  readonly dialog = inject(MatDialog);

  productos: InvProductoModel[] = [];
  producto: InvProductoModel = this.nuevoProducto();
  categorias: InvCategoriaModel[] = [];
  unidadesMedida: InvUnidadMedidaModel[] = [];
  buttonEnabled = false;

  displayedColumns: string[] = [
    'actions',
    'sku',
    'nombre',
    'categoria_nombre',
    'unidad_medida',
    'stock_actual',
    'stock_minimo',
    'costo_referencial'
  ];
  dataSource: MatTableDataSource<InvProductoModel> = new MatTableDataSource<InvProductoModel>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private almacenService: AlmacenService,
    private alertService: AlertService
  ) {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {}

  private nuevoProducto(): InvProductoModel {
    return {
      categoria_id: 0,
      sku: '',
      nombre: '',
      unidad_medida: '',
      stock_minimo: 5,
      costo_referencial: 0
    };
  }

  cargarDatos(): void {
    forkJoin({
      productos: this.almacenService.listarProductos(),
      categorias: this.almacenService.listarCategorias(),
      unidades: this.almacenService.listarUnidadesMedida()
    }).subscribe({
      next: res => {
        this.actualizarDataSource(res.productos || []);
        this.categorias = res.categorias || [];
        this.unidadesMedida = res.unidades || [];
        this.buttonEnabled = true;
      }
    });
  }

  actualizarDataSource(lista: InvProductoModel[]): void {
    this.productos = lista || [];
    this.dataSource = new MatTableDataSource<InvProductoModel>(this.productos);
    this.dataSource.paginator = this.paginator;
  }

  mostrarFormularioNuevo(): void {
    const primeraCat = this.categorias[0];
    this.producto = {
      ...this.nuevoProducto(),
      categoria_id: primeraCat?.id || 0,
      sku: `ALM-${String(this.productos.length + 1).padStart(4, '0')}`
    };
    const dialogRef = this.dialog.open(AlmacenProductoFormComponent, {
      data: { producto: this.producto, categorias: this.categorias, unidadesMedida: this.unidadesMedida },
      width: '98vw',
      maxWidth: '650px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      if (result.categorias) this.categorias = result.categorias;
      if (result.res?.correcto) {
        const data = JSON.parse(result.res.dato);
        this.actualizarDataSource(data.productos);
      }
    });
  }

  mostrarEditar(a: InvProductoModel): void {
    this.producto = { ...a };
    const dialogRef = this.dialog.open(AlmacenProductoFormComponent, {
      data: { producto: this.producto, categorias: this.categorias, unidadesMedida: this.unidadesMedida },
      width: '98vw',
      maxWidth: '650px',
      disableClose: true
    });
    this.cambiarfondoFila('azure');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.categorias) this.categorias = result.categorias;
        if (result.res?.correcto) {
          const data = JSON.parse(result.res.dato);
          this.actualizarDataSource(data.productos);
        }
      }
      this.cambiarfondoFila('');
    });
  }

  mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string, a: InvProductoModel): void {
    this.producto = a;
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: this.producto.id
    });
    this.cambiarfondoFila('MistyRose');
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.producto.id) {
        this.almacenService.eliminarProducto(this.producto.id).subscribe({
          next: res => {
            if (res.correcto) {
              const data = JSON.parse(res.dato);
              this.actualizarDataSource(data.productos);
            } else {
              this.alertService.show(res.mensaje, { duration: 4000, type: 'info' });
              this.cambiarfondoFila('');
            }
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
    if (!this.producto?.id) return;
    document.querySelectorAll<HTMLElement>('#fila' + this.producto.id + ' td').forEach(celda => {
      celda.style.backgroundColor = color;
    });
  }
}
