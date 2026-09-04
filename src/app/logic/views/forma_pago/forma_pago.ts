
//MODELS
import { FormaPagoModel } from '../../models/forma_pago.model';

//SERVICES
import { FormaPagoService } from '../../services/forma_pago.service';
import { AlertService } from '../../../base/services/local/alert.service';
import { PermisoService } from '../../../base/services/permiso.service';

//MATERIAL DESING
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar} from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

//COMPONENT
import { FormaPagoFormComponent } from './forma_pago-form/forma_pago-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//VARIOS
import { AfterViewInit,Component, ViewChild, effect, inject } from '@angular/core';

import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';


@Component({
  selector: 'app-forma_pago',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './forma_pago.html',
  styleUrl: './forma_pago.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class FormaPagoComponent implements AfterViewInit{
    forma_pagos:FormaPagoModel[]=[];
    forma_pago:FormaPagoModel=new FormaPagoModel(); 
    buttonEnabled = false; // Deshabilita el botón Add

    displayedColumns: string[] = ['actions','descripcion'];
    dataSource : MatTableDataSource<FormaPagoModel>;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private _snackBar: MatSnackBar,private formaPagoService:FormaPagoService, private alertService:AlertService, private permisoService:PermisoService) {
       this.cargarDatos();       
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        forma_pagos: this.formaPagoService.listar_public(),       
      }).subscribe({
        next: (res) => {
          this.forma_pagos = res.forma_pagos;         
          this.dataSource = new MatTableDataSource<FormaPagoModel>(this.forma_pagos);
          this.dataSource.paginator = this.paginator;
          
          // Habilita el botón Add
          this.buttonEnabled = true;
        }
      });
    }

    mostrarFormaPago() {
        this.formaPagoService.listar().subscribe({
          next: (res) => {
              this.forma_pagos = res;
              this.dataSource = new MatTableDataSource<FormaPagoModel>(res);
              this.dataSource.paginator = this.paginator;
          },
          error: (error) => {
            console.error(error);
          }
        });
    }

    readonly dialog = inject(MatDialog);
    mostrarEditar(a:FormaPagoModel){
      this.forma_pago={...a};//clone
      const dialogRef = this.dialog.open(FormaPagoFormComponent,
        { data: {forma_pago: this.forma_pago},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(res => {         
          
          if(!res){return;} //Cuando cancele la operacion salia error por que no devolvia res, con este codigo se soluciono

          if(res.correcto){             
              const data = JSON.parse(res.dato);  
              this.forma_pagos = data.forma_pagos as FormaPagoModel[];                                   
              this.dataSource = new MatTableDataSource<FormaPagoModel>(this.forma_pagos);
              this.dataSource.paginator = this.paginator;   
              
              this.cambiarfondoFila("");
          } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          } 
       
      });
    }

    mostrarFormularioNuevo(){
      this.forma_pago=new FormaPagoModel();
      const dialogRef = this.dialog.open(FormaPagoFormComponent,
        { data: {forma_pago: this.forma_pago},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(res => {  
        
          if(!res){return;} //Cuando cancele la operacion salia error por que no devolvia res, con este codigo se soluciono

          if(res.correcto){             
              const data = JSON.parse(res.dato);               
              this.forma_pagos = data.forma_pagos as FormaPagoModel[];                                   
              this.dataSource = new MatTableDataSource<FormaPagoModel>(this.forma_pagos);
              this.dataSource.paginator = this.paginator; 
          } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          }  
          
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:FormaPagoModel){
      this.forma_pago=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.forma_pago.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        
        if(!result){return;} //Cuando cancele la operacion salia error por que no devolvia res, con este codigo se soluciono

        if(result){//eliminar
          this.formaPagoService.eliminar(this.forma_pago.id).subscribe({
            next:(res)=>{
                if(res.correcto){             
                    const data = JSON.parse(res.dato);  
                    this.forma_pagos = data.forma_pagos as FormaPagoModel[];                                    
                    this.dataSource = new MatTableDataSource<FormaPagoModel>(this.forma_pagos);
                    this.dataSource.paginator = this.paginator;                  
                } else {
                    this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
                }  
            },
            error:(error)=>{
              console.error(error);
            }
          })
        }else{
          this.cambiarfondoFila("");//cancelar
        }
      });
    }

    //------------------------------------------------------------------------
    busqueda(textoBusqueda: string) {
      const filterValue = textoBusqueda;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    //------------------------------------------------------------------------
    private cambiarfondoFila(color: string) {
      document.querySelectorAll<HTMLElement>("#fila" + this.forma_pago.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

