//MODELS
import { CuentaModel } from '../../../models/cuenta.model';
import { TipoCuentaModel } from '../../../models/tipo_cuenta.model';

//SERVICES
import { CuentaService } from '../../../services/cuenta.service';
import { AlertService } from '../../../../base/services/local/alert.service';

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
  selector: 'app-cuenta-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,PreventEnterSubmitDirective,
    AnimarPerderFocoDirective,BotonGuardarDirective],
  templateUrl: './cuenta-form.html',
  styleUrls: ['./cuenta-form.scss']
})
export class CuentaFormComponent {
      @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
      tipo_cuentas:TipoCuentaModel[]=[];
      cuenta:CuentaModel;     

    constructor(public dialogRef: MatDialogRef<CuentaFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any, private dialog:MatDialog, private cuentaService:CuentaService,private alertService:AlertService) {
          this.cuenta=data.cuenta;
          this.tipo_cuentas=data.tipo_cuentas;      
          this.dialogRef.backdropClick().subscribe(x => {})
    }

    submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.cuenta.id>0){
          this.modificar();
        }else{
          this.crear();
        }
      } else {
        this.alertService.show("Debe llenar los campos",{duration:3000,type:'info'});
      }
    }

    crear(){
      this.cuentaService.crear(this.cuenta).subscribe({
        next:(res)=>{
          this.dialogRef.close(res); // <-- Aquí devuelves el res tal como está
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }

    modificar(){
      this.cuentaService.modificar(this.cuenta).subscribe({
        next:(res)=>{
          this.dialogRef.close(res); // <-- Aquí devuelves el res tal como está
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }
}
