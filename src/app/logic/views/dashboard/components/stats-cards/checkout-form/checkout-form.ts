//COMPONENTE
import { ReservaCheckOutComponent } from '../../../../reserva_checkout/reserva_checkout';

import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import moment from "moment";

  
@Component({
  selector: 'app-checkout-form',
  standalone: true,
  imports: [MatIconModule,FormsModule,MatDialogModule,MatButtonModule,ReservaCheckOutComponent],
  templateUrl: './checkout-form.html',
  styleUrls: ['./checkout-form.scss']
})
export class CheckOutFormComponent {
    fecha_filter: Date = moment().toDate();     
    constructor(public dialogRef: MatDialogRef<CheckOutFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any, private dialog:MatDialog) {          
    }    
}
