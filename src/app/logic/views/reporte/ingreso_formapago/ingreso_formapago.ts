
//MODELS
import { ReporteIngresoFormaPagoModel } from "../../../models/reporte_ingreso_formapago.model";
import { AgenciaModel } from "../../../../base/models/agencia.model";
import { FormaPagoModel } from "../../../models/forma_pago.model";

//SERVICES
import { ReporteService } from '../../../services/reporte.service';
import { AlertService } from '../../../../base/services/local/alert.service';
import { FormaPagoService } from "../../../services/forma_pago.service";
import { AgenciaService } from "../../../../base/services/agencia.service";

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
import { MatSelectModule } from '@angular/material/select';

//COMPONENT
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';

//VARIOS
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfterViewInit, Component, ViewChild, effect, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

//ECHARTS
import { NgxEchartsModule } from 'ngx-echarts';
import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';

@Component({
  selector: 'app-reporte-ingreso-formapago',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule, MatTableModule, MatIconModule, MatPaginatorModule, MatButtonModule, MatDialogModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, NgxEchartsModule
  ],
  templateUrl: './ingreso_formapago.html',
  styleUrl: './ingreso_formapago.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})

export class ReporteIngresoFormaPagoComponent implements AfterViewInit {
  reporteIngresoFormaPago = signal<ReporteIngresoFormaPagoModel[]>([]);
  anios: number[] = [];
  gestion: number;
  agencias=signal<AgenciaModel[]>([]);
  agencia_id:number;
  forma_pagos=signal<FormaPagoModel[]>([]);
  forma_pago_id:number;

  //Variables    

  dialogRef: any; //Definir formulario modal    

  //Comprobante              
  dialogVoucherRef: any;
  pdf_base64: string = '';

  //Para excel
  excel_base64: string = "";

  displayedColumns: string[] = ['detalle','agencia', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  dataSource: MatTableDataSource<ReporteIngresoFormaPagoModel>;

  public chartOptions: any = {};

  @ViewChild(MatPaginator) paginator: MatPaginator;
  readonly dialog = inject(MatDialog);

  constructor(
    private reporteService: ReporteService,
    private alertService: AlertService,
    private agenciaService: AgenciaService,
    private formaPagoService: FormaPagoService,
  ) {
    
    this.generarGestiones();
    this.cargarDatos();    

    effect(() => {
      this.dataSource = new MatTableDataSource<ReporteIngresoFormaPagoModel>(this.reporteIngresoFormaPago());
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {

  }

  cargarDatos() {
    forkJoin({
      response: this.reporteService.ingreso_forma_pago(this.gestion, this.agencia_id, this.forma_pago_id),
      agencias:this.agenciaService.listar(),
      forma_pagos:this.formaPagoService.listar(),
    }).subscribe({
      next: (res) => {
        if (res.response.correcto) {
          const data = JSON.parse(res.response.dato);
          this.reporteIngresoFormaPago.set(data.ingreso_formapago); 
          this.forma_pagos.set(res.forma_pagos);
          this.agencias.set(res.agencias);        
        } else {
          this.alertService.show(res.response.mensaje, { duration: 5000, type: 'info' });
        }
      }
    });
  }

  exportarIngresoFormaPagoExcel(): void {                     
        this.reporteService.export_ingreso_forma_pago_excel(this.gestion, this.agencia_id, this.forma_pago_id).subscribe({
        next:(res)=>{            
          this.excel_base64=res;
                      
          const nombreArchivo = 'reporte.xlsx'; // nombre sugerido

          //Convertir Base64 a Blob
          const byteCharacters = atob(this.excel_base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          //Crear URL temporal y descargar
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = nombreArchivo;
          a.click();

          //Liberar memoria
          window.URL.revokeObjectURL(url);
        },
        error:(error)=>{
            //Sin acciones
        }
      })
  }

  mostrarVisorPdf(enterAnimationDuration: string, exitAnimationDuration: string){      
      forkJoin({
        pdf_base64: this.reporteService.export_ingreso_forma_pago(this.gestion,this.agencia_id, this.forma_pago_id),
      }).subscribe({
        next: (res) => {         
          this.pdf_base64=res.pdf_base64;        
          this.dialogRef = this.dialog.open(PdfViewerComponent, {
            width: '50vw',
            maxWidth: '95vw',
            height: '80vh',
            enterAnimationDuration,
            exitAnimationDuration,
            data:{pdf_base64:this.pdf_base64,titulo_documento:"Reporte Ingreso Por Forma de Pago"},
            disableClose:true,
          });
        }
      });
  }

  generarGestiones() {
    const anioActual = new Date().getFullYear();
    const cantidadAnios = 10;
    for (let i = 0; i <= cantidadAnios; i++) {
      this.anios.push(anioActual - i);
    }    
    this.gestion = anioActual;
  }

  busqueda(textoBusqueda: string) {
    const filterValue = textoBusqueda;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}

