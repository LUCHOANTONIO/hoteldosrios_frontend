
//MODELS
import { TipoCuentaModel } from '../../models/tipo_cuenta.model';
import { CuentaModel } from '../../models/cuenta.model';

//SERVICES
import { TipoCuentaService } from '../../services/tipo_cuenta.service';
import { CuentaService } from '../../services/cuenta.service';
import { AlertService } from '../../../base/services/local/alert.service';
import { PermisoService } from '../../../base/services/permiso.service';

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
import { CuentaFormComponent } from './cuenta-form/cuenta-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//VARIOS
import { AfterViewInit,Component, ViewChild, inject } from '@angular/core';

import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';


@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './cuenta.html',
  styleUrl: './cuenta.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class CuentaComponent implements AfterViewInit{
    tipo_cuentas:TipoCuentaModel[]=[];
    cuentas:CuentaModel[]=[];
    cuenta:CuentaModel=new CuentaModel(); 
    buttonEnabled = false; // Deshabilita el botón Add

    displayedColumns: string[] = ['actions','tipo_cuenta','descripcion'];
    dataSource : MatTableDataSource<TipoCuentaModel>;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private tipoCuentaService:TipoCuentaService , private cuentaService:CuentaService , private alertService:AlertService, private permisoService:PermisoService) {
       this.cargarDatos();       
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        tipo_cuentas: this.tipoCuentaService.listar(),
        cuentas: this.cuentaService.listar(),     
      }).subscribe({
        next: (res) => {
          this.tipo_cuentas = res.tipo_cuentas;
          this.cuentas = res.cuentas;         
          this.dataSource = new MatTableDataSource<CuentaModel>(this.cuentas);
          this.dataSource.paginator = this.paginator;
          
          // Habilita el botón Add
          this.buttonEnabled = true;
        }
      });
    }

    mostrarCuenta() {
        this.cuentaService.listar().subscribe({
          next: (res) => {
              this.cuentas = res;
              this.dataSource = new MatTableDataSource<CuentaModel>(res);
              this.dataSource.paginator = this.paginator;
          },
          error: (error) => {
            console.error(error);
          }
        });
    }

    readonly dialog = inject(MatDialog);
    mostrarEditar(a:CuentaModel){
      this.cuenta={...a};//clone
      const dialogRef = this.dialog.open(CuentaFormComponent,
        { data: {cuenta: this.cuenta,tipo_cuentas: this.tipo_cuentas},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(res => {         
          
          if(!res){return;} //Cuando cancele la cuenta salia error por que no devolvia res, con este codigo se soluciono

          if(res.correcto){             
              const data = JSON.parse(res.dato);  
              this.cuentas = data.cuentas as CuentaModel[];                                   
              this.dataSource = new MatTableDataSource<CuentaModel>(this.cuentas);
              this.dataSource.paginator = this.paginator;   
              
              this.cambiarfondoFila("");
          } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          } 
       
      });
    }

    mostrarFormularioNuevo(){
      this.cuenta=new CuentaModel();
      const dialogRef = this.dialog.open(CuentaFormComponent,
        { data: {cuenta: this.cuenta,tipo_cuentas: this.tipo_cuentas},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(res => {  
        
          if(!res){return;} //Cuando cancele la cuenta salia error por que no devolvia res, con este codigo se soluciono

          if(res.correcto){             
              const data = JSON.parse(res.dato);               
              this.cuentas = data.cuentas as CuentaModel[];                                   
              this.dataSource = new MatTableDataSource<CuentaModel>(this.cuentas);
              this.dataSource.paginator = this.paginator; 
          } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          }  
          
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:CuentaModel){
      this.cuenta=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.cuenta.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        
        if(!result){return;} //Cuando cancele la cuenta salia error por que no devolvia res, con este codigo se soluciono

        if(result){//eliminar
          this.cuentaService.eliminar(this.cuenta.id).subscribe({
            next:(res)=>{
                if(res.correcto){             
                    const data = JSON.parse(res.dato);  
                    this.cuentas = data.cuentas as CuentaModel[];                                    
                    this.dataSource = new MatTableDataSource<CuentaModel>(this.cuentas);
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
      document.querySelectorAll<HTMLElement>("#fila" + this.cuenta.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

