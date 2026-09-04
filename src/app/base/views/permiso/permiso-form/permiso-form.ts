//MODELS
import { PermisoModel } from '../../../models/permiso.model';
import { ModuloModel } from '../../../models/modulo.model';
import { TipoPermisoModel } from '../../../models/tipopermiso.model';

//SERVICES

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

//VARIOS
import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { AnimarPerderFocoDirective } from '../../../shared/directives/animar-perder-foco.directive';
import { BotonGuardarDirective } from '../../../shared/directives/boton-guardar.directive';
import { PermisoService } from '../../../services/permiso.service';
import { AlertService } from '../../../services/local/alert.service';

@Component({
  selector: 'app-permiso-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,AnimarPerderFocoDirective,BotonGuardarDirective],
  templateUrl: './permiso-form.html',
  styleUrls: ['./permiso-form.scss']
})
export class PermisoFormComponent {
      @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
      permiso:PermisoModel;
      modulos:ModuloModel[];
      tipoPermisos:TipoPermisoModel[];

      // -----------------------------------------------------------------------
      constructor(public dialogRef: MatDialogRef<PermisoFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any, private dialog:MatDialog, private permisoService:PermisoService,private alertService:AlertService) {
            this.permiso=data.permiso;
            this.modulos = data.modulos;
            this.tipoPermisos = data.tipoPermisos;
            this.dialogRef.backdropClick().subscribe(x => {})
      }
      // -----------------------------------------------------------------------

      submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.permiso.id!=null){
          this.modificar();
        }else{
          this.crear();
        }
       
      } else {
        //mensaje
        this.alertService.show("Debe llenar los campos",{duration:4000,type:"info"});
      }
    }
    // -----------------------------------------------------------------------
    crear(){
      this.permisoService.crear(this.permiso).subscribe({
        next:(res)=>{         
          this.dialogRef.close({ data: this.data });
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();         
        }
      })
    }

    // -----------------------------------------------------------------------
    modificar(){
      this.permisoService.modificar(this.permiso).subscribe({
        next:(res)=>{         
          this.dialogRef.close({ data: this.data });
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();         
        }
      })
    }
    // -----------------------------------------------------------------------
}
