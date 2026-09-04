import { Component, computed, Inject, signal, ViewChild } from '@angular/core';
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
import { MenuService } from '../../../services/menu.service';
import { MenuModel } from '../../../models/menu.model';
import { CommonModule } from '@angular/common';
//type MenusPorModulo = { modulo: string, menusAsignados: MenuAsignadoModel[] };

@Component({
  selector: 'app-asignarmenu',
  standalone: true,
  imports: [MatCardModule,MatFormFieldModule, MatIconModule,MatDividerModule,FormsModule,MatButtonModule,
            MatDialogModule,MatProgressSpinner, BotonGuardarDirective,AnimarPerderFocoDirective, MatCheckboxModule,
            CdkDrag,CdkDragHandle,BotonGuardarDirective,CommonModule],
  templateUrl: './asignarmenu.html',
  styleUrl: './asignarmenu.scss'
})

export class AsignarmenuComponent {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
  rol:RolModel;
  menuRaiz!: MenuModel;
  //menusPorModulo:MenusPorModulo[]=[];
  // -----------------------------------------------------------------------
  constructor(public dialogRef: MatDialogRef<AsignarmenuComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private alertService:AlertService,private menuService:MenuService) {
      this.rol = data.rol;
      this.obtenerListaMenusPorRol();
  }
  
  submit(f:NgForm){
    this.guardarMenusPorRol();
  }
  
  obtenerListaMenusPorRol(){
    this.menuService.listarMenusAsignadosPorRol(this.rol.id!).subscribe({
      next:(res)=>{
        this.menuRaiz= MenuService.convertArrayMenuToTree(res);
      },
      error:(error)=>{console.log(error);}
    });
  }
  // -------------------------------------------------------------------------------------
  guardarMenusPorRol(){
    let arrayMenus=MenuService.convertTreeMenuToArray(this.menuRaiz);
    this.botonGuardarDirectiva.deshabilitarFormBoton();
    this.menuService.guardarMenusAsignadosPorRol(this.rol.id!,arrayMenus).subscribe({
      next:(res)=>{
        this.alertService.show("Se guardo correctamente",{duration:4000,type:"success"});
        this.dialogRef.close({ data: this.data });
      },
      error:(error)=>{this.botonGuardarDirectiva.habilitarFormBoton();}
    });
  }
  // -------------------------------------------------------------------------------------
}
