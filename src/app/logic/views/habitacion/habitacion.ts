
//MODELS
import { HabitacionModel } from '../../models/habitacion.model';
import { TipoHabitacionModel } from '../../models/tipo_habitacion.model';
import { EstadoHabitacionModel } from '../../models/estado_habitacion.model';
import { AgenciaModel } from '../../../base/models/agencia.model';

//SERVICES
import { HabitacionService } from '../../services/habitacion.service';
import { TipoHabitacionService } from '../../services/tipo_habitacion.service';
import { EstadoHabitacionService } from '../../services/estado_habitacion.service';
import { AgenciaService } from '../../../base/services/agencia.service';

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
import { HabitacionFormComponent } from './habitacion-form/habitacion-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//VARIOS
import { AfterViewInit,Component, ViewChild, inject } from '@angular/core';

import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';
import { HabitacionPrecioComponent } from '../habitacion_precio/habitacion_precio';


@Component({
  selector: 'app-habitacion',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './habitacion.html',
  styleUrl: './habitacion.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class HabitacionComponent implements AfterViewInit{
    habitaciones:HabitacionModel[]=[];
    habitacion:HabitacionModel=new HabitacionModel();
    agencias:AgenciaModel[]=[]; 
    estado_habitaciones:EstadoHabitacionModel[]=[];
    tipo_habitaciones:TipoHabitacionModel[]=[];
    buttonEnabled = false; // Deshabilita el botón Add

    dialogHabitacionPrecio: any; 

    displayedColumns: string[] = ['actions', 'agencia' ,'descripcion', 'nro_habitacion', 'precio', 'piso','tipo_habitacion','opcion'];
    dataSource : MatTableDataSource<HabitacionModel>;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private habitacionService:HabitacionService,
                private tipoHabitacionService:TipoHabitacionService,
                private estadoHabitacionService:EstadoHabitacionService,
                private agenciaService: AgenciaService) {
                this.cargarDatos();
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        habitaciones: this.habitacionService.listar(),
        tipo_habitaciones: this.tipoHabitacionService.listar(),
        estado_habitaciones: this.estadoHabitacionService.listar(),
        agencias: this.agenciaService.listar(), 
      }).subscribe({
        next: (res) => {
          this.agencias = res.agencias;
          this.habitaciones = res.habitaciones;
          this.tipo_habitaciones = res.tipo_habitaciones;
          this.estado_habitaciones = res.estado_habitaciones;
          this.dataSource = new MatTableDataSource<HabitacionModel>(this.habitaciones);
          this.dataSource.paginator = this.paginator;
          
          // Habilita el botón Add
          this.buttonEnabled = true;
        }
      });
    }

    mostrarHabitaciones() {
        this.habitacionService.listar().subscribe({
          next: (res) => {
              this.habitaciones = res;
              this.dataSource = new MatTableDataSource<HabitacionModel>(res);
              this.dataSource.paginator = this.paginator;
          },
          error: (error) => {
            console.error(error);
          }
        });
    }

    readonly dialog = inject(MatDialog);
    mostrarEditar(a:HabitacionModel){
      this.habitacion={...a};//clone
      const dialogRef = this.dialog.open(HabitacionFormComponent,
        { data: {habitacion: this.habitacion,tipo_habitaciones: this.tipo_habitaciones,estado_habitaciones: this.estado_habitaciones,agencias: this.agencias},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.mostrarHabitaciones();
        this.cambiarfondoFila("");
      });
    }

    mostrarFormularioNuevo(){
      this.habitacion=new HabitacionModel();
      const dialogRef = this.dialog.open(HabitacionFormComponent,
        { data: {habitacion: this.habitacion,tipo_habitaciones: this.tipo_habitaciones,estado_habitaciones: this.estado_habitaciones,agencias: this.agencias},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.mostrarHabitaciones();
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:HabitacionModel){
      this.habitacion=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.habitacion.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.habitacionService.eliminar(this.habitacion.id).subscribe({
            next:(res)=>{
              this.mostrarHabitaciones();
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

    habitacionPrecio(habitacion_id:number): void {                         
        this.dialogHabitacionPrecio = this.dialog.open(HabitacionPrecioComponent, {
          width: '40vw',
          maxWidth: '95vw',                        
          data: {
            habitacion_id: habitacion_id,
            tipo_habitaciones:this.tipo_habitaciones
          },
          disableClose: true,
        });
    }

    //------------------------------------------------------------------------
    busqueda(textoBusqueda: string) {
      const filterValue = textoBusqueda;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    //------------------------------------------------------------------------
    private cambiarfondoFila(color: string) {
      document.querySelectorAll<HTMLElement>("#fila" + this.habitacion.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

