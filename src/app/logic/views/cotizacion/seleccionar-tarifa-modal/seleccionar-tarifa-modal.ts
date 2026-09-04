import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { TarifaModel } from '../../../models/tarifa.model';
import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';

@Component({
  selector: 'app-seleccionar-tarifa-modal',
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
    MatTooltipModule,
    CdkDrag,
    CdkDragHandle
  ],
  templateUrl: './seleccionar-tarifa-modal.html',
  styleUrl: './seleccionar-tarifa-modal.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }]
})
export class SeleccionarTarifaModalComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'select',
    'servicio',
    'tipo_hospedaje',
    'paquete',
    'comida_incluida',
    'tarifa_adulto',
    'tarifa_ninio'
  ];
  dataSource: MatTableDataSource<TarifaModel>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  tarifaSeleccionadaId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<SeleccionarTarifaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tarifas: TarifaModel[], tarifaActualId?: number | null }
  ) {
    this.dataSource = new MatTableDataSource<TarifaModel>(data.tarifas || []);
    this.tarifaSeleccionadaId = data.tarifaActualId || null;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  buscar(filtro: string) {
    this.dataSource.filter = filtro.trim().toLowerCase();
  }

  seleccionarTarifa(tarifa: TarifaModel) {
    this.dialogRef.close(tarifa);
  }
}
