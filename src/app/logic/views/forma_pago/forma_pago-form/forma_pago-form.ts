//MODELS
import { FormaPagoModel } from '../../../models/forma_pago.model';

//SERVICES
import { FormaPagoService } from '../../../services/forma_pago.service';
import { AlertService } from '../../../../base/services/local/alert.service';

//ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  selector: 'app-forma_pago-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,PreventEnterSubmitDirective,
    AnimarPerderFocoDirective,BotonGuardarDirective],
  templateUrl: './forma_pago-form.html',
  styleUrls: ['./forma_pago-form.scss']
})
export class FormaPagoFormComponent {
      @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
      forma_pago:FormaPagoModel;     

    constructor(public dialogRef: MatDialogRef<FormaPagoFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,private _snackBar: MatSnackBar, private dialog:MatDialog, private formaPagoService:FormaPagoService,private alertService:AlertService) {
          this.forma_pago=data.forma_pago;        
          this.dialogRef.backdropClick().subscribe(x => {})
    }

    submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.forma_pago.id>0){
          this.modificar();
        }else{
          this.crear();
        }
      } else {
        this.alertService.show("Debe llenar los campos",{duration:3000,type:'info'});
      }
    }

    crear(){
      this.formaPagoService.crear(this.forma_pago).subscribe({
        next:(res)=>{
          this.dialogRef.close(res); // <-- Aquí devuelves el res tal como está
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }

    modificar(){
      this.formaPagoService.modificar(this.forma_pago).subscribe({
        next:(res)=>{
          this.dialogRef.close(res); // <-- Aquí devuelves el res tal como está
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }
}
