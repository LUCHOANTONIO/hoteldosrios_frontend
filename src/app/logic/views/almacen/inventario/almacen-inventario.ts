import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';
import { AlmacenService } from '../../../services/almacen.service';
import { InvConsolidadoItemModel } from '../../../models/almacen.model';

@Component({
  selector: 'app-almacen-inventario',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  templateUrl: './almacen-inventario.html',
  styleUrl: './almacen-inventario.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }]
})
export class AlmacenInventarioComponent implements AfterViewInit {
  items: InvConsolidadoItemModel[] = [];

  displayedColumns: string[] = [
    'sku',
    'categoria_nombre',
    'nombre',
    'ultimo_costo',
    'stock_actual'
  ];
  dataSource: MatTableDataSource<InvConsolidadoItemModel> = new MatTableDataSource<InvConsolidadoItemModel>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private almacenService: AlmacenService) {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {}

  cargarDatos(): void {
    this.almacenService.listarInventario(null, false).subscribe({
      next: res => {
        this.items = res.items || [];
        this.dataSource = new MatTableDataSource<InvConsolidadoItemModel>(this.items);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  busqueda(textoBusqueda: string): void {
    this.dataSource.filter = (textoBusqueda || '').trim().toLowerCase();
  }
}
