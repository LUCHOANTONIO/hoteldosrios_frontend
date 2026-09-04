
//MODELS
import { ReporteSiatModel } from "../../../models/reporte_siat.model";

//SERVICES
import { ReporteService } from '../../../services/reporte.service';
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

//DATA PICKER
import {MatDatepickerModule} from '@angular/material/datepicker';
import moment from "moment";

//VARIOS
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfterViewInit, Component, ViewChild, effect, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

//ECHARTS
import { NgxEchartsModule } from 'ngx-echarts';
import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';

@Component({
  selector: 'app-reporte-produccion',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule, MatTableModule, MatIconModule, MatPaginatorModule, MatButtonModule, MatDialogModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, NgxEchartsModule,MatDatepickerModule
  ],
  templateUrl: './siat.html',
  styleUrl: './siat.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})

export class ReporteSiatComponent implements AfterViewInit {
  reporteSiat = signal<ReporteSiatModel[]>([]);
  dialogRef: any;
  fecha_ini:Date;
  fecha_fin:Date;

  //Para excel
  excel_base64: string = "";

  displayedColumns: string[] = ['nro_documento', 'nacionalidad', 'fecha_ingreso', 'fecha_salida', 'nro_factura', 'nro_autorizacion', 'observacion', 'justificacion', 'nit_beneficiario'];
  dataSource: MatTableDataSource<ReporteSiatModel>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  readonly dialog = inject(MatDialog);

  constructor(
    private reporteService: ReporteService,
    private alertService: AlertService,   
  ) {   
    this.cargarDatos();
    effect(() => {
      this.dataSource = new MatTableDataSource<ReporteSiatModel>(this.reporteSiat());
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {

  }

  cargarDatos() {
    const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
    const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD');
    forkJoin({
      response: this.reporteService.list_siat(fechaIniStr, fechaFinStr),     
    }).subscribe({
      next: (res) => {
        if (res.response.correcto) {
           const data = JSON.parse(res.response.dato);
           this.reporteSiat.set(data.reporte_siat);
           this.fecha_ini = moment(data.fecha_ini, 'YYYY-MM-DD').local().toDate();
           this.fecha_fin = moment(data.fecha_fin, 'YYYY-MM-DD').local().toDate();         
        } else {
           this.alertService.show(res.response.mensaje, { duration: 5000, type: 'info' });
        }
      }
    });
  } 
  
  exportarReporteSiatExcel(): void {
        const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
        const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD');                     
        this.reporteService.export_list_siat_excel(fechaIniStr, fechaFinStr).subscribe({
        next:(res)=>{            
          this.excel_base64=res;
                      
          const nombreArchivo = 'reporte_siat.xlsx';

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

  busqueda(textoBusqueda: string) {
    const filterValue = textoBusqueda;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}

