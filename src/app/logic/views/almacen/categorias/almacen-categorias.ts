import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { AlertService } from '../../../../base/services/local/alert.service';
import { AlmacenService } from '../../../services/almacen.service';
import { InvCategoriaModel } from '../../../models/almacen.model';
import { AlmacenCategoriaFormComponent } from '../productos/almacen-productos';

@Component({
  selector: 'app-almacen-categorias',
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
  templateUrl: './almacen-categorias.html',
  styleUrl: './almacen-categorias.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }]
})
export class AlmacenCategoriasComponent implements AfterViewInit {
  readonly dialog = inject(MatDialog);
  categorias: InvCategoriaModel[] = [];
  categoria: InvCategoriaModel = { nombre: '', descripcion: '' };
  buttonEnabled = false;

  displayedColumns: string[] = ['actions', 'descripcion'];
  dataSource: MatTableDataSource<InvCategoriaModel> = new MatTableDataSource<InvCategoriaModel>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private almacenService: AlmacenService,
    private alertService: AlertService
  ) {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {}

  cargarDatos(): void {
    this.almacenService.listarCategorias().subscribe({
      next: res => {
        this.actualizarDataSource(res || []);
        this.buttonEnabled = true;
      }
    });
  }

  actualizarDataSource(lista: InvCategoriaModel[]): void {
    this.categorias = lista || [];
    this.dataSource = new MatTableDataSource<InvCategoriaModel>(this.categorias);
    this.dataSource.paginator = this.paginator;
  }

  mostrarFormularioNuevo(): void {
    this.categoria = { nombre: '', descripcion: '' };
    const dialogRef = this.dialog.open(AlmacenCategoriaFormComponent, {
      data: { categoria: this.categoria },
      width: '98vw',
      maxWidth: '500px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (!res) return;
      if (res.correcto) {
        const data = JSON.parse(res.dato);
        this.actualizarDataSource(data.categorias);
      } else {
        this.alertService.show(res.mensaje, { duration: 4000, type: 'info' });
      }
    });
  }

  mostrarEditar(c: InvCategoriaModel): void {
    this.categoria = { ...c };
    const dialogRef = this.dialog.open(AlmacenCategoriaFormComponent, {
      data: { categoria: this.categoria },
      width: '98vw',
      maxWidth: '500px',
      disableClose: true
    });
    this.cambiarfondoFila('azure');
    dialogRef.afterClosed().subscribe(res => {
      if (res?.correcto) {
        const data = JSON.parse(res.dato);
        this.actualizarDataSource(data.categorias);
      } else if (res) {
        this.alertService.show(res.mensaje, { duration: 4000, type: 'info' });
      }
      this.cambiarfondoFila('');
    });
  }

  mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string, c: InvCategoriaModel): void {
    this.categoria = c;
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: this.categoria.id
    });
    this.cambiarfondoFila('MistyRose');
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.categoria.id) {
        this.almacenService.eliminarCategoria(this.categoria.id).subscribe({
          next: res => {
            if (res.correcto) {
              const data = JSON.parse(res.dato);
              this.actualizarDataSource(data.categorias);
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
    if (!this.categoria?.id) return;
    document.querySelectorAll<HTMLElement>('#fila' + this.categoria.id + ' td').forEach(celda => {
      celda.style.backgroundColor = color;
    });
  }
}
