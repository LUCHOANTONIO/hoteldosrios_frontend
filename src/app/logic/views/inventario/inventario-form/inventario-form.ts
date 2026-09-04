//MODELS
import { InventarioModel } from '../../../models/inventario.model';
import { ProductoModel } from '../../../models/producto.model';

//SERVICES
import { InventarioService } from '../../../services/inventario.service';
import { AlertService } from '../../../../base/services/local/alert.service';

//ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
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
import { FormsModule, NgForm } from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ShowErrorDirective } from '../../../../base/shared/directives/show-error.directive';

@Component({
  selector: 'app-inventario-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule, MatIconModule,
    CdkDrag, CdkDragHandle, PreventEnterSubmitDirective, PreventEnterSelectDirective,
    AnimarPerderFocoDirective, BotonGuardarDirective, ShowErrorDirective],
  templateUrl: './inventario-form.html',
  styleUrls: ['./inventario-form.scss']
})
export class InventarioFormComponent {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
  inventario: InventarioModel;
  productos: ProductoModel[] = [];

  constructor(public dialogRef: MatDialogRef<InventarioFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog, private inventarioService: InventarioService, private alertService: AlertService) {
    this.inventario = data.inventario;
    this.productos = data.productos;
    this.dialogRef.backdropClick().subscribe(x => { })
  }

  submit(f: NgForm) {
    if (f.valid) {
      this.botonGuardarDirectiva.deshabilitarFormBoton();
      if (this.inventario.id > 0) {
        this.modificar();
      } else {
        this.crear();
      }
    } else {
      this.alertService.show("Debe llenar los campos", { duration: 3000, type: 'info' });
    }
  }

  crear() {
    this.inventarioService.crear(this.inventario).subscribe({
      next: (res) => {
        this.dialogRef.close(res);
      },
      error: (error) => {
        this.botonGuardarDirectiva.habilitarFormBoton();
      }
    })
  }

  modificar() {
    this.inventarioService.modificar(this.inventario).subscribe({
      next: (res) => {
        this.dialogRef.close(res);
      },
      error: (error) => {
        this.botonGuardarDirectiva.habilitarFormBoton();
      }
    })
  }
}
