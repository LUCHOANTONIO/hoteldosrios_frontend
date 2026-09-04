import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RolModel } from '../../../models/rol.model';

@Component({
  selector: 'app-seleccion-rol',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule,
    FormsModule,
    MatSelectModule, MatOptionModule,
    CdkDrag, CdkDragHandle
  ],
  templateUrl: './seleccion-rol.html',
  styleUrl: './seleccion-rol.scss'
})

export class SeleccionRolComponent {
  roles: RolModel[] = [];
  nombreUsuario:string;
  // ---------------------------------------------------------------
  constructor(public dialogRef: MatDialogRef<SeleccionRolComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.roles = data.roles;
    this.nombreUsuario=data.nombreUsuario;
    this.dialogRef.backdropClick().subscribe(x => { })
  }
  // ---------------------------------------------------------------
  seleccion(rol:RolModel) {
    this.dialogRef.close({ rol:rol} );
  }


  // ---------------------------------------------------------------
}
