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
import { MatCheckboxModule } from '@angular/material/checkbox';

//COMPONENT
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';
import moment from 'moment';
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';


@Component({
  selector: 'app-completar_pago-form',
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
    MatCheckboxModule,
  ],
  templateUrl: './pago-form.html',
  styleUrl: './pago-form.scss'
})
export class CompletarPagoFormComponent implements OnInit {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective; 
  @Input() reserva!: ReservaModel; 
  @Input() forma_pagos!: FormaPagoModel[];
                 
  transaccion_pago:MovimientoModel=new MovimientoModel(); 
  transaccion_pagos:MovimientoModel[]=[];     
  selectedTransacciones: any[] = [];
  balance:any; //Variable signal cargado desde constructor

  //Comprobante              
  dialogVoucherRef: any;

  // mostrar botones segun permisos
  mostrar_btn_destroy:boolean=false;

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
           this.cargarMovimiento(this.reserva.id);
        }
    });
  }

  isAllPaid(): boolean {
    const detalles = this.balance()?.detalles;
    if (!detalles || detalles.length === 0) return false;
    return detalles.every((item: any) => Number(item.saldo) <= 0);
  }

  isItemChecked(item: any): boolean {
    if (Number(item.saldo) <= 0) {
      return true;
    }
    return this.selectedTransacciones.some(t => t.id === item.id);
  }

  isItemSelectedActive(item: any): boolean {
    return Number(item.saldo) > 0 && this.selectedTransacciones.some(t => t.id === item.id);
  }

  onMontoChange(valor?: any) {
    const monto = Number(this.transaccion_pago.monto) || 0;
    this.selectedTransacciones = [];

    if (monto <= 0) {
      this.transaccion_pago.transaccion_id = null;
      this.transaccion_pago.transacciones = [];
      this.transaccion_pago.detalle = '';
      return;
    }

    const detalles = this.balance()?.detalles || [];
    const pendientes = detalles.filter((d: any) => Number(d.saldo) > 0);

    let restante = monto;
    const transaccionesParaPago: any[] = [];
    const detallesNombres: string[] = [];

    for (const item of pendientes) {
      if (restante <= 0) {
        break;
      }
      const saldoItem = Number(item.saldo);
      const cubierto = Math.min(restante, saldoItem);

      this.selectedTransacciones.push(item);
      transaccionesParaPago.push({
        transaccion_id: item.id,
        monto: cubierto,
        detalle: 'Pago ' + (item.detalle || '')
      });
      detallesNombres.push(item.detalle);

      restante -= cubierto;
    }

    this.transaccion_pago.transacciones = transaccionesParaPago;
    if (transaccionesParaPago.length > 0) {
      this.transaccion_pago.transaccion_id = transaccionesParaPago[0].transaccion_id;
      this.transaccion_pago.detalle = 'Pago ' + detallesNombres.join(', ');
    } else {
      this.transaccion_pago.transaccion_id = null;
      this.transaccion_pago.detalle = '';
    }
  }

  toggleSeleccion(item: any) {
    if (Number(item.saldo) <= 0) {
      return;
    }
    const idx = this.selectedTransacciones.findIndex(t => t.id === item.id);
    if (idx !== -1) {
      this.selectedTransacciones.splice(idx, 1);
    } else {
      this.selectedTransacciones.push(item);
    }

    this.recalcularDesdeSeleccion();
  }

  recalcularDesdeSeleccion() {
    if (this.selectedTransacciones.length === 0) {
      this.transaccion_pago.monto = null as any;
      this.transaccion_pago.transaccion_id = null;
      this.transaccion_pago.detalle = '';
      this.transaccion_pago.transacciones = [];
      return;
    }

    let totalSeleccionado = 0;
    const transaccionesParaPago: any[] = [];
    const detallesNombres: string[] = [];

    for (const item of this.selectedTransacciones) {
      const saldoItem = Number(item.saldo);
      totalSeleccionado += saldoItem;
      transaccionesParaPago.push({
        transaccion_id: item.id,
        monto: saldoItem,
        detalle: 'Pago ' + (item.detalle || '')
      });
      detallesNombres.push(item.detalle);
    }

    this.transaccion_pago.monto = Math.round(totalSeleccionado * 100) / 100;
    this.transaccion_pago.transacciones = transaccionesParaPago;
    this.transaccion_pago.transaccion_id = transaccionesParaPago[0]?.transaccion_id || null;
    this.transaccion_pago.detalle = 'Pago ' + detallesNombres.join(', ');
  }

  submitPago(f: NgForm) {               
      if (this.selectedTransacciones.length === 0) {
          this.alertService.show("Debe ingresar un monto o seleccionar una opción para realizar el pago", { duration: 3000, type: 'info' });
          return;
      }
      if (f.valid) {             
          const montoNum = Number(this.transaccion_pago.monto);
          if (!this.transaccion_pago.monto || montoNum <= 0) {
              this.alertService.show("El monto debe ser mayor a cero", { duration: 3000, type: 'info' });
              return;
          }
          const saldoTotal = Number(this.balance()?.saldo) || 0;
          if (montoNum > saldoTotal) {
              this.alertService.show(`El monto no puede superar el saldo pendiente total de Bs. ${saldoTotal.toFixed(2)}`, { duration: 4000, type: 'info' });
              return;
          }
          if (!this.transaccion_pago.transacciones || this.transaccion_pago.transacciones.length === 0) {
              this.onMontoChange();
          }
          this.botonGuardarDirectiva.deshabilitarFormBoton();
          this.procesarPago(); 
      } else {
          this.alertService.show("Debe llenar los campos requeridos", { duration: 3000, type: 'info' });
      }
  }
  
  cargarMovimiento(reserva_id:number){    
    this.transaccionPagoService.pagos(reserva_id).subscribe({
      next:(res)=>{
        if (res?.dato) {
            const data = JSON.parse(res.dato);        
            if (data?.balance) {
                this.balance.set(data.balance); //Establecer valor por medio de signal
            }
            this.transaccion_pagos = (data?.pagos || []) as MovimientoModel[];       
            this.dataSourceMovimientos = new MatTableDataSource<MovimientoModel>(this.transaccion_pagos);
            this.dataSourceMovimientos.paginator = this.paginator;        
            this.selectedTransacciones = [];
        }
      },
      error:(error)=>{
         //Sin acciones
      }
    })
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
          
          this.dataSourceMovimientos = new MatTableDataSource<MovimientoModel>(this.transaccion_pagos);
          this.dataSourceMovimientos.paginator = this.paginator; 
          this.transaccion_pago=new MovimientoModel();//Limpiar datos de transaccion pago                          
          this.selectedTransacciones = [];                          

          //this.reserva.saldo=data.balance.saldo;                    
          
        } else {
          this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
        }             
        this.botonGuardarDirectiva.habilitarFormBoton();                       
      },
      error:(error)=>{
        this.botonGuardarDirectiva.habilitarFormBoton();
      }
    })
  }

  eliminarMovimiento(enterAnimationDuration: string, exitAnimationDuration: string,a:MovimientoModel){
    const transaccion_pago_id=a.id;

    const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data:transaccion_pago_id
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){//eliminar
        this.transaccionPagoService.eliminar(transaccion_pago_id).subscribe({
          next:(res)=>{
            if(res.correcto){             
                const data = JSON.parse(res.dato);        
                this.balance.set(data.balance); 
                this.transaccion_pagos = data.pagos as MovimientoModel[];                     
                const pdf_base64 = data.base64Pdf as string;
                
                this.dataSourceMovimientos = new MatTableDataSource<MovimientoModel>(this.transaccion_pagos);
                this.dataSourceMovimientos.paginator = this.paginator; 
                this.transaccion_pago = new MovimientoModel();//Limpiar datos de transaccion pago                                 
                         
                this.reserva.saldo=data.balance.saldo;
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
        this.documentoService.obtenerVoucherCargo(this.reserva.id).subscribe({
          next: (res) => {
            this.cargarVisorPdf(res,"Comprobante");
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
