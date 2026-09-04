//MODELS
import { MovimientoModel } from '../../../models/movimiento.model';
import { ReservaModel } from '../../../models/reserva.model';

//SERVICES
import { AlertService } from '../../../../base/services/local/alert.service';
import { MovimientoService } from '../../../services/movimiento.service';
import { BalanceService } from '../../../services/balance.service';
import { DocumentoService } from '../../../services/documento.service';
import { ComunicacionService } from '../../../services/local/comunicacion.service';
import { PermisoService } from '../../../../base/services/permiso.service';

//DIRECTIVAS
import { PreventEnterSubmitDirective } from '../../../../base/shared/directives/prevent-enter-submit.directive';
import { PreventEnterSelectDirective } from '../../../../base/shared/directives/prevent-enter-select.directive';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';

//ANGULAR
import { Component, effect, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, NgForm} from '@angular/forms';

//ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { FormaPagoModel } from '../../../models/forma_pago.model';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';

//COMPONENT
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';
import moment from 'moment';
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pago-form',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    // Directivas personalizadas
    PreventEnterSubmitDirective,
    PreventEnterSelectDirective,  
    BotonGuardarDirective,
  
    // Módulos de Angular Material
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatIconModule,
    MatTabsModule,
    FormsModule,
    MatDialogModule, 
    MatCardModule,   
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './pago-form.html',
  styleUrl: './pago-form.scss'
})
export class PagoFormComponent implements OnInit {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective; 
  @Input() reserva!: ReservaModel; 
  @Input() forma_pagos!: FormaPagoModel[];
  @Input() items!:any;
   
  //Pagos
  transaccion_pago:MovimientoModel=new MovimientoModel(); 
  transaccion_pagos:MovimientoModel[]=[];
     
  balance:any; //Variable signal cargado desde constructor

  //Comprobante              
  dialogVoucherRef: any;

  // mostrar botones segun permisos
  mostrar_btn_destroy:boolean=false;
  isLoadingPdf: boolean = false;
  isProcessing: boolean = false;

  //Pagos
  displayedColumnsPagos: string[] = ['actions', 'fecha','usuario', 'detalle', 'monto'];
  dataSourceMovimientos : MatTableDataSource<MovimientoModel>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  constructor(
    private dialog: MatDialog,
    private alertService: AlertService,
    private documentoService: DocumentoService,
    private balanceService: BalanceService,
    private transaccionPagoService: MovimientoService,    
    private comunicacionService: ComunicacionService,
    private permisoService:PermisoService      
  ) {
     this.balance = this.balanceService.balance; 
     
     effect(()=>{
        let permisos=this.permisoService.permisos();
        if(permisos.length>0){
          this.mostrar_btn_destroy=permisos.find(p=>p.nombre=='ELIMINAR RESERVA CALENDARIO')?true:false;
        }
      });
  }

  ngOnInit() {
    setTimeout(() => {
        if (this.reserva) {           
           this.cargarDatos();
        }
    });
  }

  submitPago(f: NgForm) {               
      if (f.valid) {
          this.isProcessing = true;             
          this.botonGuardarDirectiva.deshabilitarFormBoton();
          this.procesarPago(); 
      } else {
          this.alertService.show("Debe llenar los campos", { duration: 3000, type: 'info' });
      }
  }   

  cargarDatos() {
      forkJoin({       
        transaccion_pago: this.transaccionPagoService.pagos(this.reserva.id),                          
      }).subscribe({
        next: (res) => {                                      
            const data_pagos = JSON.parse(res.transaccion_pago.dato);        
            this.balance.set(data_pagos.balance); //Establecer valor por medio de signal
            this.transaccion_pagos = data_pagos.pagos as MovimientoModel[];       
            this.dataSourceMovimientos = new MatTableDataSource<MovimientoModel>(this.transaccion_pagos);
            this.dataSourceMovimientos.paginator = this.paginator;                        
        }
      });
  } 

  procesarPago(){   
    this.transaccion_pago.reserva_id=this.reserva.id;
    this.transaccion_pago.cliente_id=this.reserva.cliente_id;

    this.transaccionPagoService.crear(this.transaccion_pago).subscribe({
      next:(res)=>{
        if(res.correcto){
          const data = JSON.parse(res.dato);        
          this.balance.set(data.balance); 
          this.transaccion_pagos = data.pagos as MovimientoModel[];                     
          const pdf_base64 = data.base64Pdf as string;
          
          this.dataSourceMovimientos = new MatTableDataSource<MovimientoModel>(this.transaccion_pagos);
          this.dataSourceMovimientos.paginator = this.paginator; 
          this.transaccion_pago=new MovimientoModel();//Limpiar datos de transaccion pago
          
          //this.mostrarVisorPdf(pdf_base64);           
          const fechaIni = moment(this.reserva.fecha_ini).startOf('day').hour(14).minute(0).second(0);
          const fechaFin = moment(this.reserva.fecha_fin).startOf('day').hour(11).minute(0).second(0);
          this.reserva.fecha_ini = moment(fechaIni).format("YYYY-MM-DD HH:mm");
          this.reserva.fecha_fin = moment(fechaFin).format("YYYY-MM-DD HH:mm");          

          this.reserva.saldo=data.balance.saldo;          
          
          this.items.update({id:this.reserva.id,cliente:this.reserva.cliente,start:this.reserva.fecha_ini,end:this.reserva.fecha_fin,group:this.reserva.habitacion_id,className:this.reserva.color,saldo:this.reserva.saldo});
          
          //Actualizar los datos de saldo de las reservas relacionadas al grupo
          const lista = data.list_grupo;         
          if (Array.isArray(lista)) {               
            lista.forEach((item: any) => {
              this.items.update({
                id: item.id,
                saldo:item.saldo
              });
            });
          }
          
          this.comunicacionService.executeActionReserva.set(true); //Señal para indicar que hubo accion en reserva          
          
        } else {
          this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
        }
        this.isProcessing = false;             
        this.botonGuardarDirectiva.habilitarFormBoton();                       
      },
      error:(error)=>{
        this.isProcessing = false;
        this.botonGuardarDirectiva.habilitarFormBoton();
      }
    })
  }

  eliminarMovimiento(enterAnimationDuration: string, exitAnimationDuration: string,data:MovimientoModel){
    const transaccion_pago_id=data.id;   

    const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data:transaccion_pago_id
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){//eliminar
        this.transaccionPagoService.eliminar(transaccion_pago_id,data).subscribe({
          next:(res)=>{
            if(res.correcto){             
                const data = JSON.parse(res.dato);        
                this.balance.set(data.balance); 
                this.transaccion_pagos = data.pagos as MovimientoModel[];                     
                const pdf_base64 = data.base64Pdf as string;
                
                this.dataSourceMovimientos = new MatTableDataSource<MovimientoModel>(this.transaccion_pagos);
                this.dataSourceMovimientos.paginator = this.paginator; 
                this.transaccion_pago = new MovimientoModel();//Limpiar datos de transaccion pago
                
                //this.mostrarVisorPdf(pdf_base64);
                const fechaIni = moment(this.reserva.fecha_ini).startOf('day').hour(14).minute(0).second(0);
                const fechaFin = moment(this.reserva.fecha_fin).startOf('day').hour(11).minute(0).second(0);
                this.reserva.fecha_ini = moment(fechaIni).format("YYYY-MM-DD HH:mm");
                this.reserva.fecha_fin = moment(fechaFin).format("YYYY-MM-DD HH:mm"); 
                         
                this.reserva.saldo=data.balance.saldo;                
                this.items.update({id:this.reserva.id,cliente:this.reserva.cliente,start:this.reserva.fecha_ini,end:this.reserva.fecha_fin,group:this.reserva.habitacion_id,className:this.reserva.color,saldo:this.reserva.saldo});
                this.comunicacionService.executeActionReserva.set(true); //Señal para indicar que hubo accion en reserva

            } else {
                this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
            }  
              
            this.botonGuardarDirectiva.habilitarFormBoton(); 
          },
          error:(error)=>{
            this.botonGuardarDirectiva.habilitarFormBoton();
            console.error(error);
          }
        })
      }
    });
  }


  mostrarVisorPdf(pdf_base64:string) {       
    if (this.reserva) {
      if (!pdf_base64) {
        this.isLoadingPdf = true;          
        this.documentoService.obtenerVoucherCargo(this.reserva.id).subscribe({
          next: (res) => {
            this.isLoadingPdf = false;
            this.cargarVisorPdf(res,"Comprobante");
          },
          error: (err) => {
            this.isLoadingPdf = false;
          }
        });
      } else {           
         this.cargarVisorPdf(pdf_base64,"Comprobante");
      }
    }
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

}
