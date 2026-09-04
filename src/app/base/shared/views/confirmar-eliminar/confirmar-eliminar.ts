import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirmar-eliminar',
  standalone: true,
  imports: [MatDialogModule,MatButtonModule,CdkDrag,CdkDragHandle,MatIconModule],
  templateUrl: './confirmar-eliminar.html',
  styleUrl: './confirmar-eliminar.scss'
})
export class ConfirmarEliminarComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string) {
  }
}
