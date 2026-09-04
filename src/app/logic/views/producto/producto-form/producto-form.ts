//MODELS
import { ProductoModel } from '../../../models/producto.model';
import { CategoriaModel } from '../../../models/categoria.model';

//SERVICES
import { ProductoService } from '../../../services/producto.service';
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
import { ShowErrorDirective } from '../../../../base/shared/directives/show-error.directive';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,PreventEnterSubmitDirective,PreventEnterSelectDirective,
    AnimarPerderFocoDirective,BotonGuardarDirective,ShowErrorDirective],
  templateUrl: './producto-form.html',
  styleUrls: ['./producto-form.scss']
})
export class ProductoFormComponent {
      @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
      producto:ProductoModel;
      categorias:CategoriaModel[]=[];    

    constructor(public dialogRef: MatDialogRef<ProductoFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,private _snackBar: MatSnackBar, private dialog:MatDialog, private productoService:ProductoService,private alertService:AlertService) {
          this.producto=data.producto;         
          this.categorias=data.categorias;
          this.dialogRef.backdropClick().subscribe(x => {})
    }

    submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.producto.id>0){
          this.modificar();
        }else{
          this.crear();
        }
      } else {
        this.alertService.show("Debe llenar los campos",{duration:3000,type:'info'});
      }
    }

    crear(){
      this.productoService.crear(this.producto).subscribe({
        next:(res)=>{
          this.dialogRef.close(res);
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }

    modificar(){
      this.productoService.modificar(this.producto).subscribe({
        next:(res)=>{
          this.dialogRef.close(res);
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }
}
