
//MODELS
import { ProductoModel } from '../../models/producto.model';
import { CategoriaModel } from '../../models/categoria.model';

//SERVICES
import { ProductoService } from '../../services/producto.service';

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
import { ProductoFormComponent } from './producto-form/producto-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//VARIOS
import { AfterViewInit,Component, ViewChild, inject } from '@angular/core';

import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';
import { CategoriaService } from '../../services/categoria.service';


@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './producto.html',
  styleUrl: './producto.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class ProductoComponent implements AfterViewInit{
    readonly dialog = inject(MatDialog);
    productos:ProductoModel[]=[];
    producto:ProductoModel=new ProductoModel();
    categorias:CategoriaModel[]=[];  
    buttonEnabled = false; // Deshabilita el botón Add

    displayedColumns: string[] = ['actions', 'descripcion', 'categoria', 'precio'];
    dataSource : MatTableDataSource<ProductoModel>;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private _snackBar: MatSnackBar,private productoService:ProductoService,private categoriaService:CategoriaService) {
       this.cargarDatos();
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        productos: this.productoService.listar(),     
        categorias:this.categoriaService.listar()
      }).subscribe({
        next: (res) => {
          this.actualizarDataSource(res.productos);
          this.categorias = res.categorias;
              
          //Habilita el botón Add
          this.buttonEnabled = true;
        }
      });
    }

    actualizarDataSource(lista:ProductoModel[]){
        this.productos=lista;
        this.dataSource = new MatTableDataSource<ProductoModel>(lista);
        this.dataSource.paginator = this.paginator;
    }

    mostrarEditar(a: ProductoModel) {
        this.producto = { ...a };     
        const dialogRef = this.dialog.open(ProductoFormComponent, {
          data: { producto: this.producto, categorias: this.categorias },
          width: "98vw", 
          maxWidth: "600px",
          disableClose: true
        });    
        this.cambiarfondoFila("azure");    
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.actualizarDataSource(result.productos);
          }
          this.cambiarfondoFila("");
        });
    }

    mostrarFormularioNuevo(){
      this.producto=new ProductoModel();
      const dialogRef = this.dialog.open(ProductoFormComponent,
        { data: {producto: this.producto,categorias:this.categorias},
          width: "98vw", 
          maxWidth: "600px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
            this.actualizarDataSource(result.productos);
          }
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:ProductoModel){
      this.producto=a;
      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.producto.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.productoService.eliminar(this.producto.id).subscribe({
            next:(res)=>{
              this.actualizarDataSource(res.productos);
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
      document.querySelectorAll<HTMLElement>("#fila" + this.producto.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

