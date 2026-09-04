//MODELS
import { CanalReservaModel } from '../../../models/canal_reserva.model';

//SERVICES
import { CanalReservaService } from '../../../services/canal_reserva.service';
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
  selector: 'app-canal_reserva-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,PreventEnterSubmitDirective,
    AnimarPerderFocoDirective,BotonGuardarDirective],
  templateUrl: './canal_reserva-form.html',
  styleUrls: ['./canal_reserva-form.scss']
})
export class CanalReservaFormComponent {
      @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
      canal_reserva:CanalReservaModel; 
      canal_reservas:any;    

    constructor(public dialogRef: MatDialogRef<CanalReservaFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,private dialog:MatDialog, private canalReservaService:CanalReservaService,private alertService:AlertService) {
          this.canal_reserva=data.canal_reserva; 
          this.canal_reservas=data.canal_reservas;       
          this.dialogRef.backdropClick().subscribe(x => {})
    }

    submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.canal_reserva.id>0){
          this.modificar();
        }else{
          this.crear();
        }
      } else {
        this.alertService.show("Debe llenar los campos",{duration:3000,type:'info'});
      }
    }

    crear(){
      this.canalReservaService.crear(this.canal_reserva).subscribe({
        next:(res)=>{
           if(res.correcto){
              const data = JSON.parse(res.dato);               
              this.canal_reservas.set(data.canal_reservas);
              this.dialogRef.close();
           } else {
               this.alertService.show(res.mensaje, { duration: 10000, type: 'info' });
               this.botonGuardarDirectiva.habilitarFormBoton();
           }          
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }

    modificar(){
      this.canalReservaService.modificar(this.canal_reserva).subscribe({
        next:(res)=>{
            if(res.correcto){
                const data = JSON.parse(res.dato);                
                this.canal_reservas.set(data.canal_reservas);
                this.dialogRef.close();
            } else {
                this.alertService.show(res.mensaje, { duration: 10000, type: 'info' });
                this.botonGuardarDirectiva.habilitarFormBoton();
            }
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }
}
