//MODELS
import { RolModel } from '../../../models/rol.model';
import { RegionalModel } from '../../../models/regional.model';
import { CiudadModel } from '../../../models/ciudad.model';

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
import { AnimarPerderFocoDirective } from '../../../shared/directives/animar-perder-foco.directive';
import { BotonGuardarDirective } from '../../../shared/directives/boton-guardar.directive';

//VARIOS
import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { RolService } from '../../../services/rol.service';
import { AlertService } from '../../../services/local/alert.service';

@Component({
  selector: 'app-rol-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,
    AnimarPerderFocoDirective,BotonGuardarDirective],
  templateUrl: './rol-form.html',
  styleUrls: ['./rol-form.scss']
})
export class RolFormComponent{
      @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
      rol:RolModel;
      regionales:RegionalModel[];
      ciudades:CiudadModel[];

      // -----------------------------------------------------------------------
      constructor(public dialogRef: MatDialogRef<RolFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any, private dialog:MatDialog, private rolService:RolService,private alertService:AlertService) {
            this.rol=data.rol;
            this.regionales = data.regionales;
            this.ciudades = data.ciudades;
            this.dialogRef.backdropClick().subscribe(x => {})
      }
      // -----------------------------------------------------------------------

      submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.rol.id!=null){
          this.modificar();
        }else{
          this.crear();
        }       
      } else {      
        this.alertService.show("Debe llenar los campos",{duration:4000,type:"info"});
      }
    }
    // -----------------------------------------------------------------------
    crear(){
      this.rolService.crear(this.rol).subscribe({
        next:(res)=>{         
          this.dialogRef.close({ data: this.data });
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
          // alertService.show( "pregunta",{type:'success',cancelShow:true}).subscribe({
          //   next:(res)=>{
          //     if(res){
          //       alert("presiono ok");
          //     }else{}
          //   },
          // });
        }
      })
    }

    // -----------------------------------------------------------------------
    modificar(){
      this.rolService.modificar(this.rol).subscribe({
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
