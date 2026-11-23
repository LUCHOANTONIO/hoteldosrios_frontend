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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';

import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';
import { AlertService } from '../../../../base/services/local/alert.service';
import { AlmacenService } from '../../../services/almacen.service';
import {
  InvConsolidadoItemModel,
  InvKardexRowModel
} from '../../../models/almacen.model';

// ============================================================================
// DIALOG FORM: SALIDA / AJUSTE UEPS (LIFO)
// ============================================================================
@Component({
  selector: 'app-almacen-movimiento-form',
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
    MatProgressSpinnerModule,
    BotonGuardarDirective,
    CdkDrag,
    CdkDragHandle
  ],
  template: `
    <form autocomplete="off" (ngSubmit)="submit(f)" #f="ngForm">
      <h1 mat-dialog-title cdkDrag cdkDragRootElement=".cdk-overlay-pane" cdkDragHandle class="text-bg-dark dialog-header">
        MOVIMIENTO DE INVENTARIO
        <button mat-icon-button mat-dialog-close type="button">
          <mat-icon style="color:white">close</mat-icon>
        </button>
      </h1>

      <mat-dialog-content class="mat-typography row row-cols-1 row-cols-md-2 px-0 pt-2">
        <mat-form-field class="col">
          <mat-label>Producto</mat-label>
          <mat-select [(ngModel)]="movimiento.producto_id" name="producto_id" (selectionChange)="onProductoChange($event.value)" required>
            @for (x of productos; track x.producto_id) {
              <mat-option [value]="x.producto_id">[{{ x.sku }}] {{ x.nombre }} (Stock: {{ x.stock_actual }})</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field class="col">
          <mat-label>Tipo de Movimiento</mat-label>
          <mat-select [(ngModel)]="movimiento.tipo_movimiento" name="tipo_movimiento" required>
            <mat-option value="SALIDA_CONSUMO">Salida por Consumo (LIFO)</mat-option>
            <mat-option value="SALIDA_AJUSTE">Salida por Ajuste / Merma (LIFO)</mat-option>
            <mat-option value="ENTRADA_AJUSTE">Entrada por Ajuste Positivo</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field class="col">
          <mat-label>Cantidad</mat-label>
          <input type="number" step="0.001" matInput [(ngModel)]="movimiento.cantidad" name="cantidad" required />
        </mat-form-field>

        @if (movimiento.tipo_movimiento === 'ENTRADA_AJUSTE') {
          <mat-form-field class="col">
            <mat-label>Costo Unitario (Bs.)</mat-label>
            <input type="number" step="0.01" matInput [(ngModel)]="movimiento.costo_unitario" name="costo_unitario" required />
          </mat-form-field>
        } @else {
          <mat-form-field class="col">
            <mat-label>Costo Aplicado</mat-label>
            <input matInput value="Automático por capas UEPS (LIFO)" disabled />
          </mat-form-field>
        }

        <mat-form-field class="col">
          <mat-label>Detalle / Observación</mat-label>
          <input matInput [(ngModel)]="movimiento.observacion" name="observacion" required />
        </mat-form-field>
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
export class AlmacenMovimientoFormComponent {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
  productos: InvConsolidadoItemModel[] = [];
  movimiento = {
    producto_id: 0,
    tipo_movimiento: 'SALIDA_CONSUMO' as 'SALIDA_CONSUMO' | 'SALIDA_AJUSTE' | 'ENTRADA_AJUSTE',
    cantidad: 1,
    costo_unitario: 0,
    observacion: ''
  };

  constructor(
    public dialogRef: MatDialogRef<AlmacenMovimientoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { productos: InvConsolidadoItemModel[] },
    private almacenService: AlmacenService,
    private alertService: AlertService
  ) {
    this.productos = data.productos || [];
    const sel = this.productos[0];
    if (sel) {
      this.movimiento.producto_id = sel.producto_id;
      this.movimiento.costo_unitario = Number(sel.ultimo_costo || 0);
    }
  }

  onProductoChange(prodId: number): void {
    const sel = this.productos.find(p => p.producto_id === Number(prodId));
    if (sel) {
      this.movimiento.costo_unitario = Number(sel.ultimo_costo || 0);
    }
  }

  submit(f: NgForm): void {
    if (!f.valid || !this.movimiento.producto_id || this.movimiento.cantidad <= 0) {
      this.alertService.show('Debe llenar los campos obligatorios', { duration: 3000, type: 'info' });
      return;
    }
    this.botonGuardarDirectiva.deshabilitarFormBoton();
    this.almacenService.registrarMovimientoUeps(this.movimiento).subscribe({
      next: res => {
        if (res.correcto) {
          this.dialogRef.close(res);
        } else {
          this.botonGuardarDirectiva.habilitarFormBoton();
          this.alertService.show(res.mensaje || 'Error al registrar movimiento', { duration: 4000, type: 'info' });
        }
      },
      error: () => {
        this.botonGuardarDirectiva.habilitarFormBoton();
        this.alertService.show('Error al registrar movimiento', { duration: 4000, type: 'error' });
      }
    });
  }
}

// ============================================================================
// VISTA PRINCIPAL: KARDEX UEPS (LIFO)
// ============================================================================
@Component({
  selector: 'app-almacen-kardex',
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
  templateUrl: './almacen-kardex.html',
  styleUrl: './almacen-kardex.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }]
})
export class AlmacenKardexComponent implements AfterViewInit {
  readonly dialog = inject(MatDialog);
  kardexList: InvKardexRowModel[] = [];
  productosInventario: InvConsolidadoItemModel[] = [];
  buttonEnabled = false;

  displayedColumns: string[] = [
    'codigo',
    'categoria',
    'producto',
    'detalle',
    'costo_unitario',
    'cantidad_entrada',
    'cantidad_salida',
    'saldo_cantidad',
    'valor_entrada',
    'valor_salida',
    'saldo_valorizado'
  ];
  dataSource: MatTableDataSource<InvKardexRowModel> = new MatTableDataSource<InvKardexRowModel>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private almacenService: AlmacenService) {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {}

  cargarDatos(): void {
    forkJoin({
      kardex: this.almacenService.listarKardex(),
      inventario: this.almacenService.listarInventario(null, false)
    }).subscribe({
      next: res => {
        this.actualizarDataSource(res.kardex || []);
        this.productosInventario = res.inventario?.items || [];
        this.buttonEnabled = true;
      }
    });
  }

  actualizarDataSource(lista: InvKardexRowModel[]): void {
    this.kardexList = lista;
    this.dataSource = new MatTableDataSource<InvKardexRowModel>(lista);
    this.dataSource.paginator = this.paginator;
  }

  mostrarFormularioNuevo(): void {
    const dialogRef = this.dialog.open(AlmacenMovimientoFormComponent, {
      data: { productos: this.productosInventario },
      width: '98vw',
      maxWidth: '650px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res?.correcto) {
        const data = JSON.parse(res.dato);
        if (data.kardex_list) {
          this.actualizarDataSource(data.kardex_list);
        } else {
          this.cargarDatos();
        }
        if (data.inventario?.items) {
          this.productosInventario = data.inventario.items;
        }
      }
    });
  }

  busqueda(textoBusqueda: string): void {
    this.dataSource.filter = (textoBusqueda || '').trim().toLowerCase();
  }
}
