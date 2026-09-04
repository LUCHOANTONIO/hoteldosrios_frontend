
//MODELS
import { ReservaCheckOutModel } from '../../../models/reserva_checkout.model';

//SERVICES
import { ReservaCheckOutService } from '../../../services/reserva_checkout.service';
import { AlertService } from '../../../../base/services/local/alert.service';

//DIRECTIVAS
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';
import { PreventEnterSubmitDirective } from '../../../../base/shared/directives/prevent-enter-submit.directive';

//MATERIAL DESING
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, NgForm} from '@angular/forms';

//COMPONENT

//DATA PICKER
import {MatDatepickerModule} from '@angular/material/datepicker';

//VARIOS
import { AfterViewInit,Component, Inject, ViewChild} from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { MatSelectModule } from '@angular/material/select';
import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';

@Component({
  selector: 'app-reserva_checkout-form',
  standalone: true,
  imports: [MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,MatProgressSpinnerModule,
            MatFormFieldModule,MatInputModule,MatCardModule,MatSelectModule,BotonGuardarDirective,PreventEnterSubmitDirective,FormsModule,MatDatepickerModule
           ],
  templateUrl: './reserva_checkout-form.html',
  styleUrl: './reserva_checkout-form.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class ReservaCheckoutFormComponent implements AfterViewInit{
   @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;   
   reserva_checkout:ReservaCheckOutModel;
   @ViewChild(MatPaginator) paginator: MatPaginator;
    
   constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<ReservaCheckoutFormComponent>, 
        private reservaCheckOutService: ReservaCheckOutService,             
        private alertService: AlertService,
        private cdRef: ChangeDetectorRef               
    ) {       
        this.reserva_checkout=data.reserva_checkout;              
    }

    ngAfterViewInit() {

    }

    submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.reserva_checkout.id>0){
          this.modificar();
        }else{
          //this.crear();
        }
      } else {
        this.alertService.show("Debe llenar los campos",{duration:3000,type:'info'});
      }
    }
    
    // crear(){           
    //   this.botonGuardarDirectiva.deshabilitarFormBoton();
    //   this.reservaService.crear(this.reserva_checkout).subscribe({
    //     next:(res)=>{
    //       if(res.correcto){
    //           this.botonGuardarDirectiva.habilitarFormBoton();             
    //           this.dialogRef.close(res);
    //       } else {
    //           this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
    //           this.botonGuardarDirectiva.habilitarFormBoton();             
    //       }         
    //     },
    //     error:(error)=>{
    //       this.botonGuardarDirectiva.habilitarFormBoton();
    //     }
    //   })
    // }

    modificar(){
      this.botonGuardarDirectiva.deshabilitarFormBoton();
      this.reservaCheckOutService.modificar(this.reserva_checkout).subscribe({
        next:(res)=>{
          if(res.correcto){                           
              this.botonGuardarDirectiva.habilitarFormBoton(); 
              this.dialogRef.close(res);
          } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
              this.botonGuardarDirectiva.habilitarFormBoton();              
          }  
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }
  }

