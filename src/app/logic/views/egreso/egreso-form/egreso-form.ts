//MODELS
import { EgresoModel } from '../../../models/egreso.model';
import { CuentaModel } from '../../../models/cuenta.model';
import { FormaPagoModel } from '../../../models/forma_pago.model';
import { AgenciaModel } from '../../../../base/models/agencia.model';

//SERVICES
import { EgresoService } from '../../../services/egreso.service';
import { AlertService } from '../../../../base/services/local/alert.service';

//DATA PICKER
import {MatDatepickerModule} from '@angular/material/datepicker';

//ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-egreso-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,PreventEnterSubmitDirective,
    AnimarPerderFocoDirective,BotonGuardarDirective,MatDatepickerModule],
  templateUrl: './egreso-form.html',
  styleUrls: ['./egreso-form.scss']
})
export class EgresoFormComponent {
    @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;     
    egreso:EgresoModel; 
    cuentas:CuentaModel[]=[];
    forma_pagos: FormaPagoModel[] = [];     
    agencias:AgenciaModel[]=[];
    
    constructor(public dialogRef: MatDialogRef<EgresoFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any, private dialog:MatDialog, private cajaRecepcionService:EgresoService,private alertService:AlertService) {        
          this.egreso=data.egreso;
          this.cuentas=data.cuentas;
          this.forma_pagos=data.forma_pagos;
          this.agencias=data.agencias;          
          this.dialogRef.backdropClick().subscribe(x => {})          
    }

    submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.egreso.id>0){
          this.modificar();
        }else{
          this.crear();
        }
      } else {
        this.alertService.show("Debe llenar los campos",{duration:3000,type:'info'});
      }
    }

    crear(){
      this.cajaRecepcionService.crear(this.egreso).subscribe({
        next:(res)=>{
          if(res.correcto){             
              this.dialogRef.close(res);
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

    modificar(){
      this.cajaRecepcionService.modificar(this.egreso).subscribe({
        next:(res)=>{
          if(res.correcto){             
              this.dialogRef.close(res);
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
