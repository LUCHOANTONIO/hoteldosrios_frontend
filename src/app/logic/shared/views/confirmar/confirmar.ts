import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmar',
  standalone: true,
  imports: [MatDialogModule,MatButtonModule,CdkDrag,CdkDragHandle],
  templateUrl: './confirmar.html',
  styleUrl: './confirmar.scss'
})
export class ConfirmarComponent {
  title:string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
     this.title=data.title;
  }
}
