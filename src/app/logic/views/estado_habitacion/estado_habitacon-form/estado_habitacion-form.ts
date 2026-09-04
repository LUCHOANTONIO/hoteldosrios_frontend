//MODELS
import { HabitacionModel } from '../../../models/habitacion.model';
import { EstadoHabitacionModel } from '../../../models/estado_habitacion.model';

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
  templateUrl: './estado_habitacion-form.html',
  styleUrls: ['./estado_habitacion-form.scss']
})
export class EstadoHabitacionFormComponent {
      @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
      habitacion:HabitacionModel;
      estado_habitaciones:EstadoHabitacionModel[]=[];

    constructor(public dialogRef: MatDialogRef<EstadoHabitacionFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any, private dialog:MatDialog, private habitacionService:HabitacionService,private alertService:AlertService) {
          this.habitacion=data.habitacion;         
          this.estado_habitaciones=data.estado_habitaciones;
          this.dialogRef.backdropClick().subscribe(x => {})
    }

    submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
         this.establecer_estado_habitacion();
      } else {
        this.alertService.show("Debe llenar los campos",{duration:3000,type:'info'});
      }
    }    

    establecer_estado_habitacion(){
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
