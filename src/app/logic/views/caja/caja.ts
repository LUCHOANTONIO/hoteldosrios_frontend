
//MODELS
import { CajaModel } from '../../models/caja.model';

//SERVICES
import { CajaService } from '../../services/caja.service';
import { AlertService } from '../../../base/services/local/alert.service';

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
import { CajaFormComponent } from './caja-form/caja-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { ConfirmarComponent } from '../../shared/views/confirmar/confirmar';
import { ArqueoComponent } from '../arqueo/arqueo';

//VARIOS
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';

import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';
import { PdfViewerComponent } from '../../shared/views/pdf-viewer/pdf-viewer';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatPaginatorModule, MatButtonModule, MatDialogModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCardModule
  ],
  templateUrl: './caja.html',
  styleUrl: './caja.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})

export class CajaComponent implements AfterViewInit {
  cajas: CajaModel[] = [];
  caja: CajaModel = new CajaModel();
  buttonEnabled = false; // Deshabilita el botón Add

  //Comprobante              
  dialogRef: any;
  dialogArqueo: any;
  pdf_base64: string = '';

  // displayedColumns: string[] = ['actions', 'usuario','nro_documento', 'fecha_ini', 'fecha_fin', 'estado','arqueo_usd','arqueo_bob','detalle'];
  displayedColumns: string[] = ['actions', 'usuario', 'nro_documento', 'fecha_ini', 'fecha_fin', 'estado', 'arqueo', 'detalle'];
  dataSource: MatTableDataSource<CajaModel>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private cajaService: CajaService,
    private alertService: AlertService
  ) {
    this.cargarDatos();
  }

  ngAfterViewInit() {

  }

  cargarDatos() {
    forkJoin({
      cajas: this.cajaService.listar(),
    }).subscribe({
      next: (res) => {
        this.cajas = res.cajas;
        this.dataSource = new MatTableDataSource<CajaModel>(this.cajas);
        this.dataSource.paginator = this.paginator;

        // Habilita el botón Add
        this.buttonEnabled = true;
      }
    });
  }

  mostrarCajas() {
    this.cajaService.listar().subscribe({
      next: (res) => {
        this.cajas = res;
        this.dataSource = new MatTableDataSource<CajaModel>(res);
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  readonly dialog = inject(MatDialog);
  mostrarEditar(a: CajaModel) {
    this.caja = { ...a };//clone
    const dialogRef = this.dialog.open(CajaFormComponent,
      {
        data: { caja: this.caja },
        width: "98vw",
        maxWidth: "600px",
        disableClose: true
      });
    this.cambiarfondoFila("azure");
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.mostrarCajas();
      this.cambiarfondoFila("");
    });
  }


  mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string, a: CajaModel) {
    this.caja = a;

    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: this.caja.id
    });
    this.cambiarfondoFila("MistyRose");
    dialogRef.afterClosed().subscribe(result => {
      if (result) {//eliminar
        this.cajaService.eliminar(this.caja.id).subscribe({
          next: (res) => {
            this.mostrarCajas();
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

  //------------------------------------------------------------------------
  busqueda(textoBusqueda: string) {
    const filterValue = textoBusqueda;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  //------------------------------------------------------------------------
  private cambiarfondoFila(color: string) {
    document.querySelectorAll<HTMLElement>("#fila" + this.caja.id + " td").forEach(celda => {
      celda.style.backgroundColor = color;
    });
  }
  //------------------------------------------------------------------------

  confirmarCrearCaja() {
    this.caja = new CajaModel;
    const dialogRef = this.dialog.open(ConfirmarComponent, {
      width: '250px',
      data: { title: "Esta seguro de abrir caja?" }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {//eliminar
        this.cajaService.crear(this.caja).subscribe({
          next: (res) => {
            if (res.correcto) {
              const data = JSON.parse(res.dato);
              this.cajas = data.cajas as CajaModel[];
              this.dataSource = new MatTableDataSource<CajaModel>(this.cajas);
              this.dataSource.paginator = this.paginator;
            } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
            }
          },
          error: (error) => {
            console.error(error);
          }
        })
      }
    });
  }

  confirmarCerrarCaja() {
    const dialogRef = this.dialog.open(ConfirmarComponent, {
      width: '250px',
      // data: "Esta seguro de cerrar caja?"
      data: { title: "Esta seguro de cerrar caja?" }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {//eliminar
        this.cajaService.cerrar().subscribe({
          next: (res) => {
            if (res.correcto) {
              const data = JSON.parse(res.dato);
              this.cajas = data.cajas as CajaModel[];
              this.dataSource = new MatTableDataSource<CajaModel>(this.cajas);
              this.dataSource.paginator = this.paginator;

            } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
            }
          },
          error: (error) => {
            console.error(error);
          }
        })
      }
    });
  }

  voucherCierreCaja(caja_id: number): void {
    this.cajaService.voucherCierreCaja(caja_id).subscribe({
      next: (res) => {
        this.pdf_base64 = res;
        this.cargarVisorPdf(this.pdf_base64, "Cierre caja");
      },
      error: (error) => {
        //Sin acciones
      }
    })
  }

  arqueoCaja(caja_id: number, estado_id: number): void {
    this.dialogArqueo = this.dialog.open(ArqueoComponent, {
      width: '50vw',
      maxWidth: '95vw',
      data: { caja_id, estado_id },
      disableClose: true,
    });
  }

  private cargarVisorPdf(pdf_base64: string, titulo_documento: string): void {
    this.dialogRef = this.dialog.open(PdfViewerComponent, {
      width: '50vw',
      maxWidth: '95vw',
      height: '80vh',
      data: { pdf_base64, titulo_documento },
      disableClose: true,
    });
  }

}

