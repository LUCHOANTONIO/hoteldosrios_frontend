
//MODELS
import { EgresoModel } from '../../models/egreso.model';
import { CuentaModel } from '../../models/cuenta.model';
import { FormaPagoModel } from '../../models/forma_pago.model';
import { AgenciaModel } from '../../../base/models/agencia.model';

//SERVICES
import { EgresoService } from '../../services/egreso.service';
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
import { EgresoFormComponent } from './egreso-form/egreso-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//VARIOS
import { AfterViewInit,Component, ViewChild, effect, inject } from '@angular/core';

import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';

@Component({
  selector: 'app-egreso',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './egreso.html',
  styleUrl: './egreso.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class EgresoComponent implements AfterViewInit{   
    egresos:EgresoModel[]=[];
    egreso:EgresoModel=new EgresoModel();
    agencias:AgenciaModel[]=[];
    forma_pagos: FormaPagoModel[] = []; 
    cuentas:CuentaModel[]=[]; 
    buttonEnabled = false; // Deshabilita el botón Add

    //Mostrar botones segun permisos
    mostrar_btn_add:boolean=true;
    mostrar_btn_edit:boolean=true;
    mostrar_btn_destroy:boolean=true;

    displayedColumns: string[] = ['actions', 'fecha','agencia','cuenta','detalle','forma_pago','cantidad','monto'];
    dataSource : MatTableDataSource<EgresoModel>;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private egresoService:EgresoService,
                private cuentaService:CuentaService, 
                private alertService:AlertService, 
                private formaPagoService: FormaPagoService, 
                private agenciaService:AgenciaService) {
        this.cargarDatos();       
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        egresos: this.egresoService.listar(),  
        cuentas: this.cuentaService.cuenta_egresos(),
        forma_pagos: this.formaPagoService.listar(),
        agencias: this.agenciaService.listar()          
      }).subscribe({
        next: (res) => {
          this.agencias = res.agencias;
          this.cuentas = res.cuentas; 
          this.egresos = res.egresos; 
          this.forma_pagos = res.forma_pagos;  
          this.dataSource = new MatTableDataSource<EgresoModel>(this.egresos);
          this.dataSource.paginator = this.paginator;                   
          this.buttonEnabled = true;
        }
      });
    }   

    readonly dialog = inject(MatDialog);
    mostrarEditar(a:EgresoModel){
      this.egreso={...a};//clone
      this.egreso.fecha = moment(this.egreso.fecha, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD"); //formato para datepicker     
      const dialogRef = this.dialog.open(EgresoFormComponent,
        { data: {egreso: this.egreso,cuentas: this.cuentas,forma_pagos: this.forma_pagos,agencias: this.agencias},
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
              this.egresos = data.egresos as EgresoModel[];                                   
              this.dataSource = new MatTableDataSource<EgresoModel>(this.egresos);
              this.dataSource.paginator = this.paginator;                 
              this.cambiarfondoFila("");
          } 
       
      });
    }

    mostrarFormularioNuevo(){
      this.egreso=new EgresoModel();
      this.egreso.fecha = moment().format("YYYY-MM-DD"); //Fecha actual 
      const dialogRef = this.dialog.open(EgresoFormComponent,
        { data: {egreso: this.egreso,cuentas: this.cuentas,forma_pagos: this.forma_pagos,agencias: this.agencias},
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
              this.egresos = data.egresos as EgresoModel[];                                   
              this.dataSource = new MatTableDataSource<EgresoModel>(this.egresos);
              this.dataSource.paginator = this.paginator;                  
          }
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:EgresoModel){
      this.egreso=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.egreso.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.egresoService.eliminar(this.egreso.id).subscribe({
            next:(res)=>{
               
                if (res === null) {
                  return; 
                }
                    
                if(res.correcto){             
                    const data = JSON.parse(res.dato);  
                    this.egresos = data.egresos as EgresoModel[];                                    
                    this.dataSource = new MatTableDataSource<EgresoModel>(this.egresos);
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
      document.querySelectorAll<HTMLElement>("#fila" + this.egreso.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

