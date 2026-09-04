
//MODELS
import { ArqueoDetalleModel } from '../../models/arqueo_detalle.model';
import { ArqueoModel } from '../../models/arqueo.model';
import { FormaPagoModel } from '../../models/forma_pago.model';

//SERVICES
import { ArqueoDetalleService } from '../../services/arqueo_detalle.service';
import { ArqueoService } from '../../services/arqueo.service';
import { FormaPagoService } from '../../../logic/services/forma_pago.service';
import { AlertService } from '../../../base/services/local/alert.service';
import { DocumentoService } from '../../services/documento.service';

//DIRECTIVAS
import { BotonGuardarDirective } from '../../../base/shared/directives/boton-guardar.directive';
import { PreventEnterSubmitDirective } from '../../../base/shared/directives/prevent-enter-submit.directive';
import { AnimarPerderFocoDirective } from '../../../base/shared/directives/animar-perder-foco.directive';

//MATERIAL DESING
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

//COMPONENT
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//MENU OPCIONES
import { MatMenuModule } from '@angular/material/menu';

//VARIOS
import { AfterViewInit, Component, Inject, inject, ViewChild } from '@angular/core';
import { forkJoin, of, switchMap } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';
import { MatSelectModule } from '@angular/material/select';
import { PdfViewerComponent } from '../../shared/views/pdf-viewer/pdf-viewer';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-arqueo_detalle',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatPaginatorModule, MatButtonModule, MatDialogModule, MatDividerModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatSelectModule, BotonGuardarDirective, PreventEnterSubmitDirective, AnimarPerderFocoDirective, FormsModule, MatMenuModule
  ],
  templateUrl: './arqueo.html',
  styleUrl: './arqueo.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})

export class ArqueoComponent implements AfterViewInit {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
  arqueo_detalle_list: ArqueoDetalleModel[] = [];
  arqueo_detalle: ArqueoDetalleModel = new ArqueoDetalleModel();
  arqueo: ArqueoModel = new ArqueoModel();
  forma_pagos: FormaPagoModel[] = [];

  uidCounter = 0;

  //Variables para divisa
  caja_id: number;
  divisa_id: number;
  estado_id: number;
  titulo_dialog: string;

  //Comprobante
  dialogComprobanteRef: any;
  pdf_base64: string = '';

  mnuVisibleOpciones: boolean = false;
  buttonDisabled = false;
  buttonAddEnabled = false; // Deshabilita el botón Add

  displayedColumns: string[] = ['forma_pago', 'nro_habitacion', 'nro_personas', 'monto', 'detalle', 'factura', 'nro_factura'];
  footerColumns: string[] = ['footerLabel', 'footerTotal'];
  dataSource: MatTableDataSource<ArqueoDetalleModel>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ArqueoComponent>,
    private arqueoDetalleService: ArqueoDetalleService,
    private arqueoService: ArqueoService,
    private formaPagoService: FormaPagoService,
    private alertService: AlertService,
    private documentoService: DocumentoService,
  ) {
    this.caja_id = data.caja_id;
    this.estado_id = data.estado_id;

    if (this.estado_id == 2) { //Para habilitar o deshabilitar el boton guardar           
      this.buttonDisabled = true;
    }

    this.cargarDatos();
  }

  ngAfterViewInit() {

  }

  submit(f: NgForm) {
    let tablaValida = true;
    let registrosActivos = 0;

    for (let item of this.arqueo_detalle_list) {
      if (item.estado !== 'eliminado') {
        registrosActivos++;
        // Validar campos requeridos: forma_pago, monto, factura
        if (
          item.forma_pago_id === null || item.forma_pago_id === undefined ||
          item.monto === null || item.monto === undefined || item.monto.toString().trim() === '' ||
          item.factura === null || item.factura === undefined || item.factura.trim() === ''
        ) {
          tablaValida = false;
          break;
        }
      }
    }

    if (registrosActivos === 0) {
      this.alertService.show("Debe agregar al menos un registro para guardar.", { duration: 3000, type: 'info' });
      return;
    }

    if (f.valid && tablaValida) {
      this.botonGuardarDirectiva.deshabilitarFormBoton();
      if (this.arqueo.id > 0) {
        this.modificar();
      } else {
        this.crear();
      }
    } else {
      f.control.markAllAsTouched();
      this.alertService.show("Debe llenar los campos", { duration: 3000, type: 'info' });
    }
  }

  cargarDatos() {
    this.arqueoService.getArqueoById(this.caja_id).pipe(
      switchMap((arqueo) => {
        return forkJoin({
          arqueo: of(arqueo),
          arqueo_detalle_list: this.arqueoDetalleService.listar(arqueo.id),
          forma_pagos: this.formaPagoService.listar()
        });
      })
    ).subscribe({
      next: (res) => {

        this.forma_pagos = res.forma_pagos;
        this.arqueo = res.arqueo;
        this.arqueo.caja_id = this.caja_id;
        this.arqueo_detalle_list = res.arqueo_detalle_list;
        this.arqueo_detalle_list.forEach(item => {
          (item as any).uid = this.uidCounter++;
        });

        this.dataSource = new MatTableDataSource<ArqueoDetalleModel>(this.arqueo_detalle_list);
        this.dataSource.paginator = this.paginator;

        if (this.arqueo_detalle_list.length === 0) {
          this.adicionarFila()
        }

        if (this.arqueo.id > 0) {
          this.mnuVisibleOpciones = true;
        }

        // Habilita el botón Add
        this.buttonAddEnabled = true;

      }
    });
  }

  crear() {
    this.botonGuardarDirectiva.deshabilitarFormBoton();
    this.arqueoDetalleService.crear(this.arqueo, this.arqueo_detalle_list).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          this.arqueo = data.arqueo as ArqueoModel;
          this.arqueo_detalle_list.forEach(item => {
            if (item.estado === 'nuevo') item.estado = 'guardado';
          });
          this.dataSource = new MatTableDataSource<ArqueoDetalleModel>(this.arqueo_detalle_list);
          this.dataSource.paginator = this.paginator;
          this.mnuVisibleOpciones = true;
          this.botonGuardarDirectiva.habilitarFormBoton();
        } else {
          this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      },
      error: (error) => {
        this.botonGuardarDirectiva.habilitarFormBoton();
      }
    })
  }

  modificar() {
    this.botonGuardarDirectiva.deshabilitarFormBoton();
    this.arqueoDetalleService.modificar(this.arqueo, this.arqueo_detalle_list).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          this.arqueo = data.arqueo as ArqueoModel;
          this.arqueo_detalle_list.forEach(item => {
            if (item.estado === 'nuevo') item.estado = 'guardado';
          });
          this.dataSource = new MatTableDataSource<ArqueoDetalleModel>(this.arqueo_detalle_list);
          this.dataSource.paginator = this.paginator;

          this.mnuVisibleOpciones = true;

          this.botonGuardarDirectiva.habilitarFormBoton();
        } else {
          this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      },
      error: (error) => {
        this.botonGuardarDirectiva.habilitarFormBoton();
      }
    })
  }

  readonly dialog = inject(MatDialog);
  eliminar(enterAnimationDuration: string, exitAnimationDuration: string, a: ArqueoDetalleModel) {
    this.arqueo_detalle = a;

    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: this.arqueo_detalle.id
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        if (result === null) {
          return;
        }

        if (this.arqueo_detalle.estado === 'guardado') {
          // Eliminación lógica
          this.arqueo_detalle.estado = 'eliminado';
        } else if (this.arqueo_detalle.estado === 'nuevo') {
          // Eliminación física                                    
          const index = this.dataSource.data.indexOf(this.arqueo_detalle);
          if (index >= 0) {
            this.dataSource.data.splice(index, 1); // elimina solo ese objeto
            this.dataSource._updateChangeSubscription();
          }
        }
      }
    });

  }

  adicionarFila() {
    const nuevaFila = new ArqueoDetalleModel();
    nuevaFila.id = 0;
    nuevaFila.forma_pago_id = null;
    nuevaFila.nro_habitacion = null;
    nuevaFila.nro_personas = null;
    nuevaFila.monto = null;
    nuevaFila.detalle = null;
    nuevaFila.factura = null;
    nuevaFila.nro_factura = null;
    nuevaFila.estado = "nuevo";
    (nuevaFila as any).uid = this.uidCounter++;
    this.arqueo_detalle_list.unshift(nuevaFila); // Insertar al inicio
    this.dataSource.data = this.arqueo_detalle_list;
  }

  getTotalSum(): string {
      if (!this.dataSource || !this.dataSource.data) {
        return '0.00';
      }

      const sum = this.dataSource.data.reduce((acc, x) => {
        if (x.estado === 'eliminado') return acc;
        const value = Number(x.monto);
        return acc + (isNaN(value) ? 0 : value);
      }, 0);

      return sum.toFixed(2);
  }   

  // filtrarCorte(formaPagoId: number, fila: CorteModel) {
  //   fila.corte_filtrado = this.corte_list.filter(c => c.tipo_efectivo_id === formaPagoId);
  // }

  voucherArqueo(id: number): void {
    this.documentoService.obtenerVoucherArqueo(id).subscribe({
      next: (res) => {
        this.pdf_base64 = res;
        this.cargarVisorPdf(this.pdf_base64, "Arqueo de Caja");
      },
      error: (error) => {
        //Sin acciones
      }
    })
  }

  private cargarVisorPdf(pdf_base64: string, titulo_documento: string): void {
    this.dialogComprobanteRef = this.dialog.open(PdfViewerComponent, {
      width: '50vw',
      maxWidth: '95vw',
      height: '80vh',
      data: { pdf_base64, titulo_documento },
      disableClose: true,
    });
  }

}

