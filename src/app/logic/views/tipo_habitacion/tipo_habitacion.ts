
//MODELS
import { TipoHabitacionModel } from '../../models/tipo_habitacion.model';

//SERVICES
import { TipoHabitacionService } from '../../services/tipo_habitacion.service';

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
import { TipoHabitacionFormComponent } from './tipo_habitacion-form/tipo_habitacion-form';

//VARIOS
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';


@Component({
  selector: 'app-tipo_habitacion',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './tipo_habitacion.html',
  styleUrl: './tipo_habitacion.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class TipoHabitacionComponent implements AfterViewInit{
    tipo_habitacions:TipoHabitacionModel[]=[];
    tipo_habitacion:TipoHabitacionModel=new TipoHabitacionModel();  
    buttonEnabled = false; // Deshabilita el botón Add

    //displayedColumns: string[] = ['actions','codigo','descripcion','color'];
    displayedColumns: string[] = ['actions','codigo','descripcion'];
    dataSource : MatTableDataSource<TipoHabitacionModel>;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private tipo_habitacionService:TipoHabitacionService) {
        this.cargarDatos();
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        tipo_habitacions: this.tipo_habitacionService.listar(),      
      }).subscribe({
        next: (res) => {
          this.tipo_habitacions = res.tipo_habitacions;        

          this.dataSource = new MatTableDataSource<TipoHabitacionModel>(this.tipo_habitacions);
          this.dataSource.paginator = this.paginator;

          // Habilita el botón Add
          this.buttonEnabled = true;
        }
      });
    }

    mostrarTipoHabitaciones() {
        this.tipo_habitacionService.listar().subscribe({
          next: (res) => {
              this.tipo_habitacions = res;
              this.dataSource = new MatTableDataSource<TipoHabitacionModel>(res);
              this.dataSource.paginator = this.paginator;
          },
          error: (error) => {
            console.error(error);
          }
        });
    }

    readonly dialog = inject(MatDialog);
    mostrarEditar(a:TipoHabitacionModel){
      this.tipo_habitacion={...a};//clone
      const dialogRef = this.dialog.open(TipoHabitacionFormComponent,
        { data: {tipo_habitacion: this.tipo_habitacion},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.mostrarTipoHabitaciones();
        this.cambiarfondoFila("");
      });
    }

    mostrarFormularioNuevo(){
      this.tipo_habitacion=new TipoHabitacionModel();
      const dialogRef = this.dialog.open(TipoHabitacionFormComponent,
        { data: {tipo_habitacion: this.tipo_habitacion},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.mostrarTipoHabitaciones();
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:TipoHabitacionModel){
      this.tipo_habitacion=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.tipo_habitacion.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.tipo_habitacionService.eliminar(this.tipo_habitacion.id).subscribe({
            next:(res)=>{
              this.mostrarTipoHabitaciones();
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
      document.querySelectorAll<HTMLElement>("#fila" + this.tipo_habitacion.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

