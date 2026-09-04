import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { BotonGuardarDirective } from '../../../shared/directives/boton-guardar.directive';
import { AnimarPerderFocoDirective } from '../../../shared/directives/animar-perder-foco.directive';
import { AlertService } from '../../../services/local/alert.service';
import { RolModel } from '../../../models/rol.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { PermisoService } from '../../../services/permiso.service';
import { PermisoAsignadoModel } from '../../../models/permiso.model';
type PermisosPorModulo = { modulo: string, permisosAsignados: PermisoAsignadoModel[] };
@Component({
  selector: 'app-asignarpermiso',
  standalone: true,
  imports: [MatCardModule,MatFormFieldModule, MatIconModule,MatDividerModule,FormsModule,MatButtonModule,
            MatDialogModule,MatProgressSpinner, BotonGuardarDirective,AnimarPerderFocoDirective, MatCheckboxModule,
            CdkDrag,CdkDragHandle,BotonGuardarDirective],
  templateUrl: './asignarpermiso.html',
  styleUrl: './asignarpermiso.scss'
})

export class AsignarpermisoComponent {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
  rol:RolModel;
  permisosAsignados!:PermisoAsignadoModel[];
  permisosPorModulo:PermisosPorModulo[]=[];
  // -----------------------------------------------------------------------
  constructor(public dialogRef: MatDialogRef<AsignarpermisoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private alertService:AlertService,private permisoService:PermisoService) {
      this.rol = data.rol;
      this.obtenerListaPermisosPorRol();
  }
  // -----------------------------------------------------------------------
  submit(f:NgForm){
    this.guardarPermisosPorRol();
  }
  
  obtenerListaPermisosPorRol(){
    this.permisoService.listarPermisosAsignadosPorRol(this.rol.id!).subscribe({
      next:(res)=>{
        this.permisosAsignados=res;
        //ordenando permisos asignados para que se muestren por grupos, pero cada checkbox esta casado a permisosAsignados y es lo que se tiene que enviar al servidor Backend
        // Recorrer el arreglo inicial y agrupar los permisos por módulo
        this.permisosAsignados.forEach(perAsig => {
          perAsig.asignado=!!perAsig.asignado; //convierte los 1 en true y los 0 en false.
          // Buscar si el módulo ya está en el arreglo `permisosPorModulo`
          let moduloExistente = this.permisosPorModulo.find(m => m.modulo === perAsig.modulo);
          // Si el módulo no existe, crear uno nuevo y agregarlo al arreglo
          if (!moduloExistente) {
            moduloExistente = { modulo: perAsig.modulo, permisosAsignados: [] };
            this.permisosPorModulo.push(moduloExistente);
          }
          // Agregar el permiso al módulo existente
          moduloExistente.permisosAsignados.push(perAsig);       
        });

      },
      error:(error)=>{console.log(error);}
    });
  }
  // -------------------------------------------------------------------------------------
  guardarPermisosPorRol(){
    this.botonGuardarDirectiva.deshabilitarFormBoton();
    this.permisoService.guardarPermisosAsignadosPorRol(this.rol.id!,this.permisosAsignados).subscribe({
      next:(res)=>{
        this.alertService.show("Se guardo correctamente",{duration:4000,type:"success"});
        this.dialogRef.close({ data: this.data });
      },
      error:(error)=>{this.botonGuardarDirectiva.habilitarFormBoton();}
    });
  }
  // -------------------------------------------------------------------------------------
  // togglePermiso(permiso: PermisoAsignadoModel) { 
  //   permiso.asignado = !permiso.asignado; 
  // }
}
