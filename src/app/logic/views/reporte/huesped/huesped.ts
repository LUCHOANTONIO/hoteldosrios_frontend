
//MODELS
import { ReporteHuespedModel } from "../../../models/reporte_huesped.model";
import { HabitacionModel } from "../../../models/habitacion.model";

//SERVICES
import { ReporteService } from '../../../services/reporte.service';
import { HabitacionService } from '../../../services/habitacion.service';

//DATA PICKER
import {MatDatepickerModule} from '@angular/material/datepicker';
import moment from "moment";

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
import { FormsModule} from '@angular/forms';
import { AfterViewInit, Component, ViewChild, effect, inject, signal } from '@angular/core';
import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reporte-huesped',
  standalone: true,
  imports: [MatSelectModule,FormsModule,MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule,MatDatepickerModule
           ],
  templateUrl: './huesped.html',
  styleUrl: './huesped.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class ReporteHuespedComponent implements AfterViewInit{   
    reporteHuesped = signal<ReporteHuespedModel[]>([]);
    habitaciones:HabitacionModel[]=[];   
    fecha_ini:Date;
    fecha_fin:Date;
    habitacion_id:number;
    dialogRef:any; //Definir formulario modal

    //Para comprobante
    pdf_base64:String="";
    titulo_documento: string;

    displayedColumns: string[] = ['nro_reserva','fecha_ingreso','fecha_salida','huesped','nro_documento','tipo_documento','nro_habitacion','habitacion','procedencia','motivo','estado'];
    dataSource : MatTableDataSource<ReporteHuespedModel>;
  
    @ViewChild(MatPaginator) paginator: MatPaginator;
    readonly dialog = inject(MatDialog);

    constructor(private reporteService:ReporteService,private habitacionService:HabitacionService) {
        this.cargarDatos();

        effect(() => {
            this.dataSource = new MatTableDataSource<ReporteHuespedModel>(this.reporteHuesped());
            this.dataSource.paginator = this.paginator;
        });
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
      const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD');
      forkJoin({
        huesped: this.reporteService.list_huesped(this.habitacion_id,fechaIniStr,fechaFinStr),
        habitaciones: this.habitacionService.listar(),
      }).subscribe({
        next: (res) => {
          const data = JSON.parse(res.huesped.dato);
          this.reporteHuesped.set(data.huesped); 
          this.habitaciones = res.habitaciones; 
          this.fecha_ini = moment(data.fecha_ini, 'YYYY-MM-DD').local().toDate();
          this.fecha_fin = moment(data.fecha_fin, 'YYYY-MM-DD').local().toDate();                  
        }
      });
    }

   mostrarVisorPdf(enterAnimationDuration: string, exitAnimationDuration: string){
      const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
      const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD');
      forkJoin({
        pdf_base64: this.reporteService.exportar_list_huesped(this.habitacion_id,fechaIniStr,fechaFinStr),
      }).subscribe({
        next: (res) => {
          this.pdf_base64=res.pdf_base64;
          this.titulo_documento="Reporte Huesped";
          this.dialogRef =this.dialog.open(PdfViewerComponent, {
            width: '50vw',
            maxWidth: '95vw',
            height: '80vh',
            enterAnimationDuration,
            exitAnimationDuration,
            data:{pdf_base64:this.pdf_base64,titulo_documento:this.titulo_documento},
            disableClose:true,
          });

        }
      });
  }

  //------------------------------------------------------------------------
  busqueda(textoBusqueda: string) {
    const filterValue = textoBusqueda;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}

