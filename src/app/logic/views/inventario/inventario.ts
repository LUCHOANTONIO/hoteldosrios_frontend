//MODELS
import { InventarioModel } from '../../models/inventario.model';
import { ProductoModel } from '../../models/producto.model';

//SERVICES
import { InventarioService } from '../../services/inventario.service';
import { ProductoService } from '../../services/producto.service';

//MATERIAL DESING
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

//COMPONENT
import { InventarioFormComponent } from './inventario-form/inventario-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//VARIOS
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';

import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';


@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatPaginatorModule, MatButtonModule, MatDialogModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCardModule
  ],
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})
export class InventarioComponent implements AfterViewInit {
  readonly dialog = inject(MatDialog);
  inventarios: InventarioModel[] = [];
  inventario: InventarioModel = new InventarioModel();
  productos: ProductoModel[] = [];
  buttonEnabled = false;

  displayedColumns: string[] = ['actions', 'fecha', 'descripcion', 'tipo_movimiento', 'cantidad'];
  dataSource!: MatTableDataSource<InventarioModel>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private inventarioService: InventarioService, private productoService: ProductoService) {
    this.cargarDatos();
  }

  ngAfterViewInit() {

  }

  cargarDatos() {
    forkJoin({
      inventarios: this.inventarioService.listar(),
      productos: this.productoService.listar()
    }).subscribe({
      next: (res) => {
        this.actualizarDataSource(res.inventarios);
        this.productos = res.productos.filter(p => p.categoria_id == 2);
        this.buttonEnabled = true;
      }
    });
  }

  actualizarDataSource(lista: InventarioModel[]) {
    this.inventarios = lista;
    this.dataSource = new MatTableDataSource<InventarioModel>(lista);
    this.dataSource.paginator = this.paginator;
  }

  mostrarEditar(a: InventarioModel) {
    this.inventario = { ...a };
    const dialogRef = this.dialog.open(InventarioFormComponent, {
      data: { inventario: this.inventario, productos: this.productos },
      width: "98vw",
      maxWidth: "600px",
      disableClose: true
    });
    this.cambiarfondoFila("azure");
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.actualizarDataSource(result.inventarios);
      }
      this.cambiarfondoFila("");
    });
  }

  mostrarFormularioNuevo() {
    this.inventario = new InventarioModel();
    const dialogRef = this.dialog.open(InventarioFormComponent,
      {
        data: { inventario: this.inventario, productos: this.productos },
        width: "98vw",
        maxWidth: "600px",
        disableClose: true
      });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.actualizarDataSource(result.inventarios);
      }
    });
  }

  mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string, a: InventarioModel) {
    this.inventario = a;
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: this.inventario.id
    });
    this.cambiarfondoFila("MistyRose");
    dialogRef.afterClosed().subscribe(result => {
      if (result) {//eliminar
        this.inventarioService.eliminar(this.inventario.id).subscribe({
          next: (res) => {
            this.actualizarDataSource(res.inventarios);
          },
          error: (error) => {
            console.error(error);
          }
        })
      } else {
        this.cambiarfondoFila("");//cancelar
      }
    });
  }

  busqueda(textoBusqueda: string) {
    const filterValue = textoBusqueda;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private cambiarfondoFila(color: string) {
    document.querySelectorAll<HTMLElement>("#fila" + this.inventario.id + " td").forEach(celda => {
      celda.style.backgroundColor = color;
    });
  }
}
