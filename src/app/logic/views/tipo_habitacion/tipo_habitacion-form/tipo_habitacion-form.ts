//MODELS
import { TipoHabitacionModel } from '../../../models/tipo_habitacion.model';

//SERVICES
import { TipoHabitacionService } from '../../../services/tipo_habitacion.service';
import { AlertService } from '../../../../base/services/local/alert.service';

//ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';

//VARIOS
import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tipo_habitacion-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule,FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,PreventEnterSubmitDirective,BotonGuardarDirective],
  templateUrl: './tipo_habitacion-form.html',
  styleUrls: ['./tipo_habitacion-form.scss']
})
export class TipoHabitacionFormComponent {
      @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
      tipo_habitacion:TipoHabitacionModel;    

      constructor(public dialogRef: MatDialogRef<TipoHabitacionFormComponent>,private tipo_habitacionService:TipoHabitacionService,private alertService:AlertService,
        @Inject(MAT_DIALOG_DATA) public data: any,private _snackBar: MatSnackBar) {
            this.tipo_habitacion = data.tipo_habitacion;          
            this.dialogRef.backdropClick().subscribe(x => {})
      }

      submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.tipo_habitacion.id>0)
          this.modificar();
        else
          this.crear();
      } else {
        //mensaje
        this.alertService.show("Dege llenar los campos obligatorios");
      }
    }

    crear(){
      this.tipo_habitacionService.crear(this.tipo_habitacion).subscribe({
        next:(res)=>{
          this.dialogRef.close({ data: this.data });
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
          //console.error(error);
        }
      })
    }

    modificar(){
      this.tipo_habitacionService.modificar(this.tipo_habitacion).subscribe({
        next:(res)=>{
          this.dialogRef.close({ data: this.data });
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
          //console.error(error);
        }
      })
    }

}
