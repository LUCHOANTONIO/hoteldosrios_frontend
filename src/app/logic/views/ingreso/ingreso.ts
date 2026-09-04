
//MODELS
import { IngresoModel } from '../../models/ingreso.model';
import { CuentaModel } from '../../models/cuenta.model';
import { FormaPagoModel } from '../../models/forma_pago.model';
import { AgenciaModel } from '../../../base/models/agencia.model';

//SERVICES
import { IngresoService } from '../../services/ingreso.service';
import { AlertService } from '../../../base/services/local/alert.service';
import { CuentaService } from '../../services/cuenta.service';
import { FormaPagoService } from '../../services/forma_pago.service';
import { AgenciaService } from '../../../base/services/agencia.service';

//PARA FECHA
import moment from "moment";

//MATERIAL DESING
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

//COMPONENT
import { IngresoFormComponent } from './ingreso-form/ingreso-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//VARIOS
import { AfterViewInit,Component, ViewChild, effect, inject } from '@angular/core';

import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';

@Component({
  selector: 'app-ingreso',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './ingreso.html',
  styleUrl: './ingreso.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class IngresoComponent implements AfterViewInit{   
    ingresos:IngresoModel[]=[];
    ingreso:IngresoModel=new IngresoModel();
    agencias:AgenciaModel[]=[];
    forma_pagos: FormaPagoModel[] = []; 
    cuentas:CuentaModel[]=[]; 
    buttonEnabled = false; // Deshabilita el botón Add

    //Mostrar botones segun permisos
    mostrar_btn_add:boolean=true;
    mostrar_btn_edit:boolean=true;
    mostrar_btn_destroy:boolean=true;

    displayedColumns: string[] = ['actions', 'fecha','agencia','cuenta','detalle','forma_pago','cantidad','monto'];
    dataSource : MatTableDataSource<IngresoModel>;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private ingresoService:IngresoService,
                private cuentaService:CuentaService, 
                private alertService:AlertService, 
                private formaPagoService: FormaPagoService,
                private agenciaService:AgenciaService) 
    {
        this.cargarDatos();       
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        ingresos: this.ingresoService.listar(),  
        cuentas: this.cuentaService.cuenta_ingresos(),
        forma_pagos: this.formaPagoService.listar(),
        agencias: this.agenciaService.listar(),          
      }).subscribe({
        next: (res) => {
          this.agencias = res.agencias;
          this.cuentas = res.cuentas; 
          this.ingresos = res.ingresos; 
          this.forma_pagos = res.forma_pagos;  
          this.dataSource = new MatTableDataSource<IngresoModel>(this.ingresos);
          this.dataSource.paginator = this.paginator;
          this.buttonEnabled = true;
        }
      });
    }   

    readonly dialog = inject(MatDialog);
    mostrarEditar(a:IngresoModel){
      this.ingreso={...a};//clone
      this.ingreso.fecha = moment(this.ingreso.fecha, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD"); //formato para datepicker 
      const dialogRef = this.dialog.open(IngresoFormComponent,
        { data: {ingreso: this.ingreso,cuentas: this.cuentas,forma_pagos: this.forma_pagos,agencias: this.agencias},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(res => {

          if (res === null || res === "") {
            return; 
          }

          if(res.correcto){             
              const data = JSON.parse(res.dato);  
              this.ingresos = data.ingresos as IngresoModel[];                                   
              this.dataSource = new MatTableDataSource<IngresoModel>(this.ingresos);
              this.dataSource.paginator = this.paginator;                 
              this.cambiarfondoFila("");
          } 
       
      });
    }

    mostrarFormularioNuevo(){
      this.ingreso=new IngresoModel();
      this.ingreso.fecha = moment().format("YYYY-MM-DD"); //Fecha actual 
      const dialogRef = this.dialog.open(IngresoFormComponent,
        { data: {ingreso: this.ingreso,cuentas: this.cuentas,forma_pagos: this.forma_pagos,agencias: this.agencias},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(res => {                          
          if (res === null || res === "") {
            return; 
          }

          if(res.correcto){             
              const data = JSON.parse(res.dato);  
              this.ingresos = data.ingresos as IngresoModel[];                                   
              this.dataSource = new MatTableDataSource<IngresoModel>(this.ingresos);
              this.dataSource.paginator = this.paginator;                  
          }
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:IngresoModel){
      this.ingreso=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.ingreso.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.ingresoService.eliminar(this.ingreso.id).subscribe({
            next:(res)=>{
               
                if (res === null) {
                  return; 
                }
                    
                if(res.correcto){             
                    const data = JSON.parse(res.dato);  
                    this.ingresos = data.ingresos as IngresoModel[];                                    
                    this.dataSource = new MatTableDataSource<IngresoModel>(this.ingresos);
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
      document.querySelectorAll<HTMLElement>("#fila" + this.ingreso.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

