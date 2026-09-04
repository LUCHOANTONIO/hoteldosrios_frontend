
//MODELS
import { ReporteEgresoModel } from "../../../models/reporte_egreso.model";
import { UsuarioModel } from "../../../../base/models/usuario.model";
import { FormaPagoModel } from "../../../models/forma_pago.model";
import { AgenciaModel } from '../../../../base/models/agencia.model';

//SERVICES
import { ReporteService } from '../../../services/reporte.service';
import { UsuarioService } from '../../../../base/services/usuario.service';
import { AlertService } from '../../../../base/services/local/alert.service';
import { FormaPagoService } from '../../../services/forma_pago.service';
import { AgenciaService } from '../../../../base/services/agencia.service';

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
  selector: 'app-reporte-egreso',
  standalone: true,
  imports: [MatSelectModule,FormsModule,MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule,MatDatepickerModule
           ],
  templateUrl: './egreso.html',
  styleUrl: './egreso.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class ReporteEgresoComponent implements AfterViewInit{   
    reporteIngreso = signal<ReporteEgresoModel[]>([]);
    
    //Arrays       
    usuarios=signal<UsuarioModel[]>([]);
    forma_pagos=signal<FormaPagoModel[]>([]);        
    agencias=signal<AgenciaModel[]>([]);   

    //Variables
    usuario_id:number;
    forma_pago_id:number;  
    agencia_id:number;   
    fecha_ini:Date;
    fecha_fin:Date;
    dialogRef:any; //Definir formulario modal    

    //Para comprobante
    pdf_base64:String="";  

    displayedColumns: string[] = ['fecha','usuario','detalle','monto','forma_pago','cuenta','agencia'];
    dataSource : MatTableDataSource<ReporteEgresoModel>;
    
    @ViewChild(MatPaginator) paginator: MatPaginator;
    readonly dialog = inject(MatDialog);

    constructor(
        private reporteService: ReporteService,
        private usuarioService: UsuarioService, 
        private formaPagoService: FormaPagoService,              
        private agenciaService: AgenciaService,      
        private alertService:AlertService
    ) {
        this.cargarDatos();

        effect(() => {
            this.dataSource = new MatTableDataSource<ReporteEgresoModel>(this.reporteIngreso());
            this.dataSource.paginator = this.paginator;
        });
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
      const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD'); 
      forkJoin({
        egresos:this.reporteService.list_egreso(this.usuario_id,this.forma_pago_id,this.agencia_id,fechaIniStr,fechaFinStr),
        usuarios:this.usuarioService.listar(),
        forma_pagos:this.formaPagoService.listar(),
        agencias:this.agenciaService.listar(),       
      }).subscribe({
        next: (res) => {            
          if(res.egresos.correcto){
              const data = JSON.parse(res.egresos.dato);
              this.reporteIngreso.set(data.egresos);
              this.usuarios.set(res.usuarios); 
              this.forma_pagos.set(res.forma_pagos);
              this.agencias.set(res.agencias);            
              this.fecha_ini = moment(data.fecha_ini, 'YYYY-MM-DD').local().toDate();
              this.fecha_fin = moment(data.fecha_fin, 'YYYY-MM-DD').local().toDate();
          } else {
              this.alertService.show(res.egresos.mensaje, { duration: 5000, type: 'info' });
          }
        }
      });
    }

   mostrarVisorPdf(enterAnimationDuration: string, exitAnimationDuration: string){
      const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
      const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD'); 
      forkJoin({
        pdf_base64: this.reporteService.exportar_list_egreso(this.usuario_id,this.forma_pago_id,this.agencia_id,fechaIniStr,fechaFinStr),
      }).subscribe({
        next: (res) => {
          this.pdf_base64=res.pdf_base64;        
          this.dialogRef = this.dialog.open(PdfViewerComponent, {
            width: '50vw',
            maxWidth: '95vw',
            height: '80vh',
            enterAnimationDuration,
            exitAnimationDuration,
            data:{pdf_base64:this.pdf_base64,titulo_documento:"Reporte Egreso"},
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

