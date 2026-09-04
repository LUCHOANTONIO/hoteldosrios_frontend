
//MODELS
import { FormaPagoModel } from '../../models/forma_pago.model';
import { CuentaCobrarModel } from '../../models/cuenta_cobrar.model';

//SERVICES
import { FormaPagoService } from '../../services/forma_pago.service';
import { CuentaCobrarService } from '../../services/cuenta_cobrar.service';
import { AlertService } from '../../../base/services/local/alert.service';
import { PdfViewerComponent } from '../../shared/views/pdf-viewer/pdf-viewer';

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
import { CuentaCobrarFormComponent } from './cuenta_cobrar-form/cuenta_cobrar-form';

//VARIOS
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';

import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';

@Component({
  selector: 'app-ingreso',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatPaginatorModule, MatButtonModule, MatDialogModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCardModule
  ],
  templateUrl: './cuenta_cobrar.html',
  styleUrl: './cuenta_cobrar.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})

export class CuentaCobrarComponent implements AfterViewInit {
  readonly dialog = inject(MatDialog);
  cuentas_cobrar: CuentaCobrarModel[] = [];
  cuenta_cobrar: CuentaCobrarModel = new CuentaCobrarModel();
  forma_pagos: FormaPagoModel[] = [];

  displayedColumns: string[] = ['actions', 'documento', 'correlativo', 'nro_habitacion', 'fecha', 'cliente', 'detalle', 'monto', 'pago', 'saldo'];
  dataSource = new MatTableDataSource<CuentaCobrarModel>([]); // arreglo vacío

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private cuentaCobrarService: CuentaCobrarService,
    private formaPagoService: FormaPagoService,
    private alertService: AlertService
  ) {
    this.cargarDatos();
  }

  ngAfterViewInit() {

  }

  cargarDatos() {
    forkJoin({
      cuentas_cobrar: this.cuentaCobrarService.listar(),
      forma_pagos: this.formaPagoService.listar_public(),
    }).subscribe({
      next: (res) => {
        this.cuentas_cobrar = res.cuentas_cobrar;
        this.forma_pagos = res.forma_pagos;
        this.dataSource = new MatTableDataSource<CuentaCobrarModel>(this.cuentas_cobrar);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  mostrarFormularioPagar(x: CuentaCobrarModel) {
    const cuentaCobrar = { ...x }
    cuentaCobrar.detalle = ""; //Para que el detalle no vaya al formulario pagar                     
    const dialogRef = this.dialog.open(CuentaCobrarFormComponent,
      {
        data: { cuentaCobrar: cuentaCobrar, forma_pagos: this.forma_pagos },
        width: "98vw",
        maxWidth: "600px",
        disableClose: true
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res === null || res === "") {
        return;
      }
      const data = JSON.parse(res.dato);
      this.cuentas_cobrar = data.cuentas_cobrar;
      this.dataSource = new MatTableDataSource<CuentaCobrarModel>(this.cuentas_cobrar);
      this.dataSource.paginator = this.paginator;
    });
  }

  mostrarVisorPdf(id: number) {
    this.cuentaCobrarService.exportar_comprobante(id).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          this.cargarVisorPdf(data.base64Pdf, "Comprobante de Cuenta por Cobrar");
        } else {
          this.alertService.show(res.mensaje, { duration: 5000, type: 'error' });
        }
      },
      error: (error) => {
        console.error(error);
        this.alertService.show("Error al generar el comprobante", { duration: 5000, type: 'error' });
      }
    });
  }

  private cargarVisorPdf(pdf_base64: string, titulo_documento: string): void {
    this.dialog.open(PdfViewerComponent, {
      width: "1000px",
      maxWidth: "95vw",
      disableClose: false,
      data: { pdf_base64, titulo_documento },
    });
  }

  //------------------------------------------------------------------------
  busqueda(textoBusqueda: string) {
    const filterValue = textoBusqueda;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  //------------------------------------------------------------------------
}

