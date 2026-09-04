//MODELS;
import { FormaPagoModel } from '../../../models/forma_pago.model';
import { CuentaCobrarModel } from '../../../models/cuenta_cobrar.model';

//SERVICES
import { AlertService } from '../../../../base/services/local/alert.service';
import { CuentaCobrarService } from '../../../services/cuenta_cobrar.service';

//ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

//DIRECTIVAS
import { PreventEnterSubmitDirective } from '../../../../base/shared/directives/prevent-enter-submit.directive';
import { AnimarPerderFocoDirective } from '../../../../base/shared/directives/animar-perder-foco.directive';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';

//VARIOS
import { Component, Inject, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule, NgForm} from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

@Component({
  selector: 'app-ingreso-form',
  standalone: true,
  imports: [DecimalPipe, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,PreventEnterSubmitDirective,
    AnimarPerderFocoDirective,BotonGuardarDirective, MatTableModule, MatTooltipModule],
  templateUrl: './cuenta_cobrar-form.html',
  styleUrls: ['./cuenta_cobrar-form.scss']
})
export class CuentaCobrarFormComponent implements OnInit {
    @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;              
    forma_pagos: FormaPagoModel[] = []; 
    cuentaCobrar: CuentaCobrarModel = new CuentaCobrarModel();    
    pagos: any[] = [];
    dataSource = new MatTableDataSource<any>([]);
    displayedColumns: string[] = ['actions', 'fecha', 'detalle', 'forma_pago', 'monto'];
    
    mostrandoFormulario = false;
    pagoEditadoId: number | null = null;
    monto_total = 0;
    total_pagado = 0;
    saldo_pendiente = 0;

    constructor(public dialogRef: MatDialogRef<CuentaCobrarFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any, private cuentaCobrarService: CuentaCobrarService,private alertService:AlertService, private dialog: MatDialog, private cdr: ChangeDetectorRef) {        
          this.cuentaCobrar=data.cuentaCobrar;
          this.forma_pagos=data.forma_pagos;
          this.monto_total = parseFloat(this.cuentaCobrar.monto.toString());
          this.saldo_pendiente = this.monto_total;
          this.dialogRef.backdropClick().subscribe(x => {})          
    }

    ngOnInit() {
        this.cargarPagos();
    }

    cargarPagos() {
        if (this.cuentaCobrar && this.cuentaCobrar.id) {
            this.cuentaCobrarService.getPagos(this.cuentaCobrar.id).subscribe({
                next: (res) => {
                    this.pagos = res;
                    this.dataSource = new MatTableDataSource<any>(this.pagos);
                    this.calcularSaldos();
                },
                error: (err) => {
                    this.alertService.show("Error al cargar los pagos", { duration: 3000, type: 'error' });
                }
            });
        }
    }
    
    calcularSaldos() {
        this.total_pagado = this.pagos.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
        this.saldo_pendiente = this.monto_total - this.total_pagado;
        this.cdr.detectChanges();
    }
    
    nuevoPago() {
        this.pagoEditadoId = null;
        this.cuentaCobrar.monto = this.saldo_pendiente;
        this.cuentaCobrar.detalle = "";
        this.cuentaCobrar.forma_pago_id = null;
        this.mostrandoFormulario = true;
    }

    editarPago(pago: any) {
        this.pagoEditadoId = pago.id;
        this.cuentaCobrar.monto = pago.monto;
        this.cuentaCobrar.detalle = pago.detalle;
        
        // Find forma de pago ID by name, assuming we might need to map it back or it's provided. 
        // We will try to map it by comparing description if id is not directly available in 'pago' obj
        let fp = this.forma_pagos.find(f => f.descripcion === pago.forma_pago);
        this.cuentaCobrar.forma_pago_id = fp ? fp.id : null;
        
        this.mostrandoFormulario = true;
    }

    eliminarPago(pago: any) {
      const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        data: pago.id
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) { // Confirm elimination
          this.cuentaCobrarService.deletePago(pago.id).subscribe({
            next:(res)=>{
              if(res.correcto){
                 this.alertService.show("Pago eliminado", { duration: 3000, type: 'success' });
                 this.ultimoRespuesta = res;
                 this.cargarPagos();
              } else {
                 this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
              }
            },
            error:(error)=>{
              this.alertService.show("Error al eliminar", { duration: 3000, type: 'error' });
            }
          });
        }
      });
    }
    
    cancelarPago() {
        this.mostrandoFormulario = false;
        this.pagoEditadoId = null;
    }
    
    ultimoRespuesta: any = null;

    cerrarVentana() {
        this.dialogRef.close(this.ultimoRespuesta);
    }

    submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if (this.pagoEditadoId) {
            this.actualizarPago();
        } else {
            this.cobranza();
        }
      } else {
        this.alertService.show("Debe llenar los campos",{duration:3000,type:'info'});
      }
    }

    actualizarPago() {
      const data = {
         id: this.pagoEditadoId,
         monto: this.cuentaCobrar.monto,
         forma_pago_id: this.cuentaCobrar.forma_pago_id,
         detalle: this.cuentaCobrar.detalle
      };
      
      this.cuentaCobrarService.updatePago(this.pagoEditadoId!, data).subscribe({
        next:(res)=>{
          if(res.correcto){              
              //this.alertService.show("Pago actualizado correctamente", { duration: 3000, type: 'success' });
              this.botonGuardarDirectiva.habilitarFormBoton();
              this.mostrandoFormulario = false;
              this.pagoEditadoId = null;
              this.ultimoRespuesta = res;
              this.cargarPagos();
          } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
              this.botonGuardarDirectiva.habilitarFormBoton();             
          }         
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      });
    }

    cobranza(){     
      this.cuentaCobrarService.cobranza(this.cuentaCobrar).subscribe({
        next:(res)=>{
          if(res.correcto){              
              //this.alertService.show("Pago registrado correctamente", { duration: 3000, type: 'success' });
              this.botonGuardarDirectiva.habilitarFormBoton();
              this.mostrandoFormulario = false;
              this.ultimoRespuesta = res;
              this.cargarPagos(); // Reload payments
          } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
              this.botonGuardarDirectiva.habilitarFormBoton();             
          }         
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }  
    
    bloquearNegativos(event: KeyboardEvent): void {    
      if (event.key === '-' || event.key === 'e') {
        event.preventDefault();
      }
    }

}
