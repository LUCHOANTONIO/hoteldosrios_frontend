//MODELS

//SERVICES
import { ReporteService } from '../../../services/reporte.service';
import { CuentaCobrarService } from '../../../services/cuenta_cobrar.service';
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

//DATA PICKER
import {MatDatepickerModule} from '@angular/material/datepicker';
import moment from "moment";

//VARIOS
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfterViewInit, Component, ViewChild, effect, inject, signal } from '@angular/core';

//ECHARTS
import { NgxEchartsModule } from 'ngx-echarts';
import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';

@Component({
  selector: 'app-reporte-cuentas-cobrar',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule, MatTableModule, MatIconModule, MatPaginatorModule, MatButtonModule, MatDialogModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, NgxEchartsModule,MatDatepickerModule
  ],
  templateUrl: './cuenta_cobrar.html',
  styleUrl: './cuenta_cobrar.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})
export class ReporteCuentasCobrarComponent implements AfterViewInit {
  reporteData = signal<any[]>([]);
  fecha_ini:Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  fecha_fin:Date = new Date();

  displayedColumns: string[] = ['documento', 'nro_venta', 'fecha', 'nro_habitacion', 'cliente', 'observacion', 'credito', 'pagos', 'saldo'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  readonly dialog = inject(MatDialog);

  constructor(
    private reporteService: ReporteService,
    private cuentaCobrarService: CuentaCobrarService,
    private alertService: AlertService,   
  ) {   
    this.cargarDatos();
    effect(() => {
      this.dataSource = new MatTableDataSource<any>(this.reporteData());
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {

  }

  cargarDatos() {
    const fechaIniStr = moment(this.fecha_ini).format('DD/MM/YYYY');
    const fechaFinStr = moment(this.fecha_fin).format('DD/MM/YYYY');
    this.reporteService.list_cuentas_cobrar(fechaIniStr, fechaFinStr).subscribe({
      next: (res) => {
        if (res.correcto) {
           const data = JSON.parse(res.dato);
           this.reporteData.set(data.cuentas_cobrar);
        } else {
           this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
        }
      },
      error: () => {
         this.alertService.show("Error al cargar los datos", { duration: 5000, type: 'error' });
      }
    });
  } 
  
  exportarReportePdf(): void {
        const fechaIniStr = moment(this.fecha_ini).format('DD/MM/YYYY');
        const fechaFinStr = moment(this.fecha_fin).format('DD/MM/YYYY');                     
        this.reporteService.exportar_list_cuentas_cobrar(fechaIniStr, fechaFinStr).subscribe({
        next:(res)=>{            
          if (res.correcto) {
              const data = JSON.parse(res.dato);
              this.cargarVisorPdf(data.base64Pdf, 'Reporte de Cuentas por Cobrar');
          } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          }
        },
        error:(error)=>{
             this.alertService.show("Error al exportar el PDF", { duration: 5000, type: 'error' });
        }
      })
  } 

  mostrarVisorPdf(id: number): void {
      this.cuentaCobrarService.exportar_comprobante(id).subscribe({
        next:(res)=>{            
          if (res.correcto) {
              const data = JSON.parse(res.dato);
              this.cargarVisorPdf(data.base64Pdf, 'CUENTA POR COBRAR');
          } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          }
        },
        error:(error)=>{
             this.alertService.show("Error al generar el comprobante", { duration: 5000, type: 'error' });
        }
      })
  }

  private cargarVisorPdf(pdf_base64: string, titulo_documento: string): void {
    this.dialog.open(PdfViewerComponent, {
      width: "1000px",
      maxWidth: "95vw",
      disableClose: false,
      data: { pdf_base64, titulo_documento },
    });
  }

  busqueda(textoBusqueda: string) {
    const filterValue = textoBusqueda;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}

