
//MODELS
import { ReporteEgresoCuentaModel } from "../../../models/reporte_egreso_cuenta.model";
import { AgenciaModel } from "../../../../base/models/agencia.model";
import { CuentaModel } from "../../../models/cuenta.model";

//SERVICES
import { ReporteService } from '../../../services/reporte.service';
import { AgenciaService } from "../../../../base/services/agencia.service";
import { AlertService } from '../../../../base/services/local/alert.service';

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
import { CuentaService } from "../../../services/cuenta.service";

@Component({
  selector: 'app-reporte-egreso-cuenta',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule, MatTableModule, MatIconModule, MatPaginatorModule, MatButtonModule, MatDialogModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, NgxEchartsModule
  ],
  templateUrl: './egreso_cuenta.html',
  styleUrl: './egreso_cuenta.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})

export class ReporteEgresoCuentaComponent implements AfterViewInit {
  reporteEgresoCuenta = signal<ReporteEgresoCuentaModel[]>([]);
  
  anios: number[] = [];
  gestion: number;
  agencias=signal<AgenciaModel[]>([]);
  agencia_id:number;
  cuentas=signal<CuentaModel[]>([]);
  cuenta_id:number;

  dialogRef: any;

  //Comprobante              
  dialogVoucherRef: any;
  pdf_base64: string = '';

  //Para excel
  excel_base64: string = "";

  displayedColumns: string[] = ['detalle', 'agencia', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  dataSource: MatTableDataSource<ReporteEgresoCuentaModel>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  readonly dialog = inject(MatDialog);

  constructor(
    private reporteService: ReporteService,
    private alertService: AlertService,
    private agenciaService: AgenciaService,
    private cuentaService: CuentaService,
  ) {
    this.cargarDatos();
    this.generarGestiones();

    effect(() => {
      this.dataSource = new MatTableDataSource<ReporteEgresoCuentaModel>(this.reporteEgresoCuenta());
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {

  }

  cargarDatos() {
    forkJoin({
      response: this.reporteService.egreso_cuenta(this.gestion, this.agencia_id,this.cuenta_id),
      agencias:this.agenciaService.listar(),
      cuentas:this.cuentaService.cuenta_egresos(),
    }).subscribe({
      next: (res) => {
        if (res.response.correcto) {
          const data = JSON.parse(res.response.dato);          
          this.reporteEgresoCuenta.set(data.egreso_cuenta);
          this.agencias.set(res.agencias);
          this.cuentas.set(res.cuentas);         
        } else {
          this.alertService.show(res.response.mensaje, { duration: 5000, type: 'info' });
        }
      }
    });
  }

  exportarEgresoCuentaExcel(): void {                     
        this.reporteService.export_egreso_cuenta_excel(this.gestion, this.agencia_id, this.cuenta_id).subscribe({
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
        pdf_base64: this.reporteService.export_egreso_cuenta(this.gestion,this.agencia_id, this.cuenta_id),
      }).subscribe({
        next: (res) => {         
          this.pdf_base64=res.pdf_base64;        
          this.dialogRef = this.dialog.open(PdfViewerComponent, {
            width: '50vw',
            maxWidth: '95vw',
            height: '80vh',
            enterAnimationDuration,
            exitAnimationDuration,
            data:{pdf_base64:this.pdf_base64,titulo_documento:"Reporte Egreso Por Cuenta"},
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

