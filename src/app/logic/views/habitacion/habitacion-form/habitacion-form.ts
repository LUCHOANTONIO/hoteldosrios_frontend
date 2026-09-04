//MODELS
import { HabitacionModel } from '../../../models/habitacion.model';
import { EstadoHabitacionModel } from '../../../models/estado_habitacion.model';
import { TipoHabitacionModel } from '../../../models/tipo_habitacion.model';
import { AgenciaModel } from '../../../../base/models/agencia.model';

//SERVICES
import { HabitacionService } from '../../../services/habitacion.service';
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
import { PreventEnterSelectDirective } from '../../../../base/shared/directives/prevent-enter-select.directive';
import { AnimarPerderFocoDirective } from '../../../../base/shared/directives/animar-perder-foco.directive';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';

//VARIOS
import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-habitacion-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,PreventEnterSubmitDirective,PreventEnterSelectDirective,
    AnimarPerderFocoDirective,BotonGuardarDirective],
  templateUrl: './habitacion-form.html',
  styleUrls: ['./habitacion-form.scss']
})
export class HabitacionFormComponent {
      @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
      habitacion:HabitacionModel;
      estado_habitaciones:EstadoHabitacionModel[]=[];
      tipo_habitaciones:TipoHabitacionModel[]=[];
      agencias:AgenciaModel[]=[]; 

    constructor(public dialogRef: MatDialogRef<HabitacionFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,private _snackBar: MatSnackBar, private dialog:MatDialog, private habitacionService:HabitacionService,private alertService:AlertService) {
          this.habitacion=data.habitacion;
          this.tipo_habitaciones=data.tipo_habitaciones;
          this.estado_habitaciones=data.estado_habitaciones;
          this.agencias=data.agencias;
          this.dialogRef.backdropClick().subscribe(x => {})
    }

    submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.habitacion.id>0){
          this.modificar();
        }else{
          this.crear();
        }
      } else {
        this.alertService.show("Debe llenar los campos",{duration:3000,type:'info'});
      }
    }

    crear(){
      this.habitacionService.crear(this.habitacion).subscribe({
        next:(res)=>{
          this.dialogRef.close({ data: this.data });
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }

    modificar(){
      this.habitacionService.modificar(this.habitacion).subscribe({
        next:(res)=>{
          this.dialogRef.close({ data: this.data });
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }
}
