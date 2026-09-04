//MODELS
import { IngresoModel } from '../../../models/ingreso.model';
import { CuentaModel } from '../../../models/cuenta.model';
import { FormaPagoModel } from '../../../models/forma_pago.model';
import { AgenciaModel } from '../../../../base/models/agencia.model';

//SERVICES
import { IngresoService } from '../../../services/ingreso.service';
import { AlertService } from '../../../../base/services/local/alert.service';

//DATA PICKER
import {MatDatepickerModule} from '@angular/material/datepicker';
import moment from "moment";

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
  selector: 'app-ingreso-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,PreventEnterSubmitDirective,
    AnimarPerderFocoDirective,BotonGuardarDirective,MatDatepickerModule],
  templateUrl: './ingreso-form.html',
  styleUrls: ['./ingreso-form.scss']
})
export class IngresoFormComponent {
    @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;     
    ingreso:IngresoModel; 
    agencias:AgenciaModel[]=[]; 
    cuentas:CuentaModel[]=[];
    forma_pagos: FormaPagoModel[] = [];     

    constructor(public dialogRef: MatDialogRef<IngresoFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any, private dialog:MatDialog, private cajaRecepcionService:IngresoService,private alertService:AlertService) {        
          this.ingreso=data.ingreso;
          this.agencias=data.agencias;
          this.cuentas=data.cuentas;
          this.forma_pagos=data.forma_pagos;
          this.dialogRef.backdropClick().subscribe(x => {})          
    }

    submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.ingreso.id>0){
          this.modificar();
        }else{
          this.crear();
        }
      } else {
        this.alertService.show("Debe llenar los campos",{duration:3000,type:'info'});
      }
    }

    crear(){
      this.cajaRecepcionService.crear(this.ingreso).subscribe({
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
      this.cajaRecepcionService.modificar(this.ingreso).subscribe({
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
