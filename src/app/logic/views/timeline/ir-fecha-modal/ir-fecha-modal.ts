import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

// 1. IMPORTA ESTOS DOS MÓDULOS DE FECHAS CLAVE
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; 

@Component({
  selector: 'app-ir-fecha-modal',
  standalone: true, // Si estás utilizando standalone
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    
    // 2. INSÉRTALOS AQUÍ EN TUS IMPORTS
    MatDatepickerModule,
    MatNativeDateModule 
  ],
  templateUrl: './ir-fecha-modal.html',
  styleUrl: './ir-fecha-modal.scss'
})
export class IrFechaModalComponent {
  fechaSeleccionada: Date = new Date();

  constructor(
    public dialogRef: MatDialogRef<IrFechaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
}
