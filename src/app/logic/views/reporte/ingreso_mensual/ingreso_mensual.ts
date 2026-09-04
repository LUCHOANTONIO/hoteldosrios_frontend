
//MODELS
import { ReporteIngresoMensualModel } from "../../../models/reporte_ingreso_mensual.model";
import { AgenciaModel } from "../../../../base/models/agencia.model";

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
import moment from "moment";

@Component({
  selector: 'app-reporte-produccion',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule, MatTableModule, MatIconModule, MatPaginatorModule, MatButtonModule, MatDialogModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, NgxEchartsModule
  ],
  templateUrl: './ingreso_mensual.html',
  styleUrl: './ingreso_mensual.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})

export class ReporteIngresoMensualComponent implements AfterViewInit {
  reporteIngresoMensual = signal<ReporteIngresoMensualModel[]>([]);
  
  anios: number[] = [];
  gestion: number;
  agencias=signal<AgenciaModel[]>([]);
  agencia_id:number;

  dialogRef: any;

  //Comprobante              
  dialogVoucherRef: any;
  pdf_base64: string = '';

  //Para excel
  excel_base64: string = "";

  displayedColumns: string[] = ['detalle', 'agencia', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  dataSource: MatTableDataSource<ReporteIngresoMensualModel>;

  public chartOptions: any = {};

  @ViewChild(MatPaginator) paginator: MatPaginator;
  readonly dialog = inject(MatDialog);

  constructor(
    private reporteService: ReporteService,
    private alertService: AlertService,
    private agenciaService: AgenciaService,
  ) {

    this.generarGestiones();
    this.cargarDatos();   

    effect(() => {
      this.dataSource = new MatTableDataSource<ReporteIngresoMensualModel>(this.reporteIngresoMensual());
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {

  }

  cargarDatos() {
    forkJoin({
      response: this.reporteService.ingreso_mensual(this.gestion, this.agencia_id),
      agencias:this.agenciaService.listar(),
    }).subscribe({
      next: (res) => {
        if (res.response.correcto) {
          const data = JSON.parse(res.response.dato);
          this.reporteIngresoMensual.set(data.ingreso_mensual);
          this.agencias.set(res.agencias);
          this.actualizarGrafico(data.ingreso_mensual);
        } else {
          this.alertService.show(res.response.mensaje, { duration: 5000, type: 'info' });
        }
      }
    });
  } 
  
  exportarIngresoMensualExcel(): void {                     
        this.reporteService.export_ingreso_mensual_excel(this.gestion,this.agencia_id).subscribe({
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

  actualizarGrafico(datos: ReporteIngresoMensualModel[]) {
    const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

    // Filter out "Resultado" rows if any, to only plot the sources
    const seriesData = datos
      .filter(d => d.detalle && !d.detalle.toLowerCase().includes('resultado'))
      .map(item => {
        let color = undefined;
        let itemName = item.detalle.toLowerCase();
        if (itemName.includes('ingresos') && !itemName.includes('airb')) {
          color = '#a9d18e';
        } else if (itemName.includes('egresos')) {
          color = '#f46c6a';
        } else if (itemName.includes('airb')) {
          color = '#b720ff';
        }

        return {
          name: item.detalle,
          type: 'bar',
          barGap: 0,
          itemStyle: color ? { color } : undefined,
          data: [
            item.enero || 0,
            item.febrero || 0,
            item.marzo || 0,
            item.abril || 0,
            item.mayo || 0,
            item.junio || 0,
            item.julio || 0,
            item.agosto || 0,
            item.septiembre || 0,
            item.octubre || 0,
            item.noviembre || 0,
            item.diciembre || 0
          ]
        };
      });

    this.chartOptions = {
      ...this.chartOptions,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        data: seriesData.map(s => s.name),
        bottom: 15,
        icon: 'square'
      },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { fontSize: 10 }
      },
      yAxis: { type: 'value' },
      series: seriesData as any
    };
  }

  mostrarVisorPdf(enterAnimationDuration: string, exitAnimationDuration: string){      
      forkJoin({
        pdf_base64: this.reporteService.export_ingreso_mensual(this.gestion,this.agencia_id),
      }).subscribe({
        next: (res) => {         
          this.pdf_base64=res.pdf_base64;        
          this.dialogRef = this.dialog.open(PdfViewerComponent, {
            width: '50vw',
            maxWidth: '95vw',
            height: '80vh',
            enterAnimationDuration,
            exitAnimationDuration,
            data:{pdf_base64:this.pdf_base64,titulo_documento:"Reporte Ingreso Mensual"},
            disableClose:true,
          });
        }
      });
  }

}

