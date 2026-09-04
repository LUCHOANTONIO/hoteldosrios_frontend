
//MODELS
import { ReporteCajaModel } from "../../../models/reporte_caja.model";
import { UsuarioModel } from "../../../../base/models/usuario.model";


//SERVICES
import { ReporteService } from '../../../services/reporte.service';
import { UsuarioService } from '../../../../base/services/usuario.service';
import { AlertService } from '../../../../base/services/local/alert.service';
import { CajaService } from '../../../services/caja.service';

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

//COMPONENT
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';

//VARIOS
import { FormsModule} from '@angular/forms';
import { AfterViewInit, Component, ViewChild, effect, inject, signal } from '@angular/core';
import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-reporte-caja',
  standalone: true,
  imports: [MatSelectModule,FormsModule,MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule,MatDatepickerModule
           ],
  templateUrl: './caja.html',
  styleUrl: './caja.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class ReporteCajaComponent implements AfterViewInit{   
    reporteCaja = signal<ReporteCajaModel[]>([]);
    
    //Arrays   
    usuarios=signal<UsuarioModel[]>([]);   

    //Variables
    usuario_id:number;   
    fecha_ini:Date;
    fecha_fin:Date;    
    dialogRef:any; //Definir formulario modal    

    //Para comprobante
    //Comprobante              
    dialogVoucherRef: any;   
    pdf_base64: string = ''; 

    displayedColumns: string[] = ['usuario','fecha_ini','fecha_fin','estado','acciones'];
    dataSource : MatTableDataSource<ReporteCajaModel>;
    
    @ViewChild(MatPaginator) paginator: MatPaginator;
    readonly dialog = inject(MatDialog);

    constructor(
        private reporteService: ReporteService,
        private usuarioService: UsuarioService,
        private cajaService: CajaService,       
        private alertService:AlertService
    ) {
        this.cargarDatos();

        effect(() => {
            this.dataSource = new MatTableDataSource<ReporteCajaModel>(this.reporteCaja());
            this.dataSource.paginator = this.paginator;
        });
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      const fechaIniStr = moment(this.fecha_ini).format('YYYY-MM-DD');
      const fechaFinStr = moment(this.fecha_fin).format('YYYY-MM-DD');     

      forkJoin({        
        cajas:this.reporteService.list_caja(this.usuario_id,fechaIniStr,fechaFinStr),
        usuarios:this.usuarioService.listar(),       
      }).subscribe({
        next: (res) => {            
          if(res.cajas.correcto){
              const data = JSON.parse(res.cajas.dato);
              this.reporteCaja.set(data.cajas);
              this.usuarios.set(res.usuarios);
              this.fecha_ini = moment(data.fecha_ini, 'YYYY-MM-DD').local().toDate();
              this.fecha_fin = moment(data.fecha_fin, 'YYYY-MM-DD').local().toDate();
          } else {
              this.alertService.show(res.cajas.mensaje, { duration: 5000, type: 'info' });
          }
        }
      });
    }  
    
    voucherCierreCaja(caja_id:number): void {              
        this.cajaService.voucherCierreCaja(caja_id).subscribe({
          next:(res)=>{            
             this.pdf_base64 = res; 
             this.cargarVisorPdf(this.pdf_base64,"Cierre caja");    
          },
          error:(error)=>{
              //Sin acciones
          }
        })
    }

    private cargarVisorPdf(pdf_base64: string, titulo_documento: string): void {              
        this.dialogVoucherRef = this.dialog.open(PdfViewerComponent, {
          width: '50vw',
          maxWidth: '95vw',
          height: '80vh',                  
          data: { pdf_base64, titulo_documento },
          disableClose: true,
        });
    }

  //------------------------------------------------------------------------
  busqueda(textoBusqueda: string) {
    const filterValue = textoBusqueda;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}

