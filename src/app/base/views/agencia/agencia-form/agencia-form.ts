//MODELS
import { AgenciaModel } from '../../../models/agencia.model';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

//DIRECTIVAS
import { PreventEnterSubmitDirective } from '../../../shared/directives/prevent-enter-submit.directive';
import { PreventEnterSelectDirective } from '../../../shared/directives/prevent-enter-select.directive';

//VARIOS
import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { AnimarPerderFocoDirective } from '../../../shared/directives/animar-perder-foco.directive';
import { BotonGuardarDirective } from '../../../shared/directives/boton-guardar.directive';
import { AgenciaService } from '../../../services/agencia.service';
import { AlertService } from '../../../services/local/alert.service';

@Component({
  selector: 'app-agencia-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,PreventEnterSubmitDirective,PreventEnterSelectDirective,
    AnimarPerderFocoDirective,BotonGuardarDirective],
  templateUrl: './agencia-form.html',
  styleUrls: ['./agencia-form.scss']
})
export class AgenciaFormComponent {
      @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
      agencia:AgenciaModel;
      regionales:RegionalModel[];
      ciudades:CiudadModel[];

      // -----------------------------------------------------------------------
      constructor(public dialogRef: MatDialogRef<AgenciaFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,private _snackBar: MatSnackBar, private dialog:MatDialog, private agenciaService:AgenciaService,private alertService:AlertService) {
            this.agencia=data.agencia;
            this.regionales = data.regionales;
            this.ciudades = data.ciudades;
            this.dialogRef.backdropClick().subscribe(x => {})
      }
      // -----------------------------------------------------------------------

      submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.agencia.id!=null){
          this.modificar();
        }else{
          this.crear();
        }
        //this.dialogRef.close({ data: this.data });
      } else {
        //mensaje
        this._snackBar.open('Debe llenar los campos', 'Cerrar', {
          duration:3000,
          horizontalPosition: "center",
          verticalPosition: "bottom",
          panelClass: 'info-snackbar'
        });
      }
    }
    // -----------------------------------------------------------------------
    crear(){
      this.agenciaService.crear(this.agencia).subscribe({
        next:(res)=>{
          //this.mostrarAgencias();
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
      this.agenciaService.modificar(this.agencia).subscribe({
        next:(res)=>{
          //this.mostrarAgencias();
          this.dialogRef.close({ data: this.data });
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
          //console.error(error.HttpErrorResponse);
          //console.error(error);
        }
      })
    }
    // -----------------------------------------------------------------------
}
