
//MODELS
import { CategoriaModel } from '../../models/categoria.model';

//SERVICES
import { CategoriaService } from '../../services/categoria.service';
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
import { CategoriaFormComponent } from './categoria-form/categoria-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//VARIOS
import { AfterViewInit,Component, ViewChild, effect, inject } from '@angular/core';

import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';


@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './categoria.html',
  styleUrl: './categoria.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class CategoriaComponent implements AfterViewInit{
    categorias:CategoriaModel[]=[];
    categoria:CategoriaModel=new CategoriaModel(); 
    buttonEnabled = false; // Deshabilita el botón Add

    displayedColumns: string[] = ['actions','descripcion'];
    dataSource : MatTableDataSource<CategoriaModel>;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private categoriaService:CategoriaService, private alertService:AlertService, private permisoService:PermisoService) {
       this.cargarDatos();       
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        categorias: this.categoriaService.listar(),       
      }).subscribe({
        next: (res) => {
          this.categorias = res.categorias;         
          this.dataSource = new MatTableDataSource<CategoriaModel>(this.categorias);
          this.dataSource.paginator = this.paginator;
          
          // Habilita el botón Add
          this.buttonEnabled = true;
        }
      });
    }

    mostrarCategoria() {
        this.categoriaService.listar().subscribe({
          next: (res) => {
              this.categorias = res;
              this.dataSource = new MatTableDataSource<CategoriaModel>(res);
              this.dataSource.paginator = this.paginator;
          },
          error: (error) => {
            console.error(error);
          }
        });
    }

    readonly dialog = inject(MatDialog);
    mostrarEditar(a:CategoriaModel){
      this.categoria={...a};//clone
      const dialogRef = this.dialog.open(CategoriaFormComponent,
        { data: {categoria: this.categoria},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(res => {         
          
          if(!res){return;} //Cuando cancele la operacion salia error por que no devolvia res, con este codigo se soluciono

          if(res.correcto){             
              const data = JSON.parse(res.dato);  
              this.categorias = data.categorias as CategoriaModel[];                                   
              this.dataSource = new MatTableDataSource<CategoriaModel>(this.categorias);
              this.dataSource.paginator = this.paginator;   
              
              this.cambiarfondoFila("");
          } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          } 
       
      });
    }

    mostrarFormularioNuevo(){
      this.categoria=new CategoriaModel();
      const dialogRef = this.dialog.open(CategoriaFormComponent,
        { data: {categoria: this.categoria},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(res => {  
        
          if(!res){return;} //Cuando cancele la operacion salia error por que no devolvia res, con este codigo se soluciono

          if(res.correcto){             
              const data = JSON.parse(res.dato);               
              this.categorias = data.categorias as CategoriaModel[];                                   
              this.dataSource = new MatTableDataSource<CategoriaModel>(this.categorias);
              this.dataSource.paginator = this.paginator; 
          } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          }  
          
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:CategoriaModel){
      this.categoria=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.categoria.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        
        if(!result){return;} //Cuando cancele la operacion salia error por que no devolvia res, con este codigo se soluciono

        if(result){//eliminar
          this.categoriaService.eliminar(this.categoria.id).subscribe({
            next:(res)=>{
                if(res.correcto){             
                    const data = JSON.parse(res.dato);  
                    this.categorias = data.categorias as CategoriaModel[];                                    
                    this.dataSource = new MatTableDataSource<CategoriaModel>(this.categorias);
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
      document.querySelectorAll<HTMLElement>("#fila" + this.categoria.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

