//COMPONENTE
import { DisponibilidadComponent } from '../../../../disponibilidad/disponibilidad';

import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import moment from "moment";
  
@Component({
  selector: 'app-habitacion-form',
  standalone: true,
  imports: [DisponibilidadComponent,MatIconModule,FormsModule,MatDialogModule,MatButtonModule],
  templateUrl: './disponibilidad-form.html',
  styleUrls: ['./disponibilidad-form.scss']
})
export class DisponibilidadFormComponent {
    fecha_filter: Date = moment().toDate();     
    constructor(public dialogRef: MatDialogRef<DisponibilidadFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any, private dialog:MatDialog) {          
    }    
}
