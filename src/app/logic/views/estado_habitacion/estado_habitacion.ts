
//MODELS
import { HabitacionModel } from '../../models/habitacion.model';
import { EstadoHabitacionModel } from '../../models/estado_habitacion.model';

//SERVICES
import { HabitacionService } from '../../services/habitacion.service';
import { TipoHabitacionService } from '../../services/tipo_habitacion.service';
import { EstadoHabitacionService } from '../../services/estado_habitacion.service';

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
import { EstadoHabitacionFormComponent } from './estado_habitacon-form/estado_habitacion-form';

//VARIOS
import { CommonModule } from '@angular/common';
import { AfterViewInit,Component, ViewChild, inject } from '@angular/core';

import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';


@Component({
  selector: 'app-habitacion',
  standalone: true,
  imports: [CommonModule, MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './estado_habitacion.html',
  styleUrl: './estado_habitacion.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class EstadoHabitacionComponent implements AfterViewInit{
    habitaciones:HabitacionModel[]=[];
    habitacion:HabitacionModel=new HabitacionModel();
    estado_habitaciones:EstadoHabitacionModel[]=[];     

    displayedColumns: string[] = ['actions', 'descripcion', 'nro_habitacion', 'piso','tipo_habitacion','estado_habitacion'];
    dataSource : MatTableDataSource<HabitacionModel>;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private habitacionService:HabitacionService,private tipoHabitacionService:TipoHabitacionService,private estadoHabitacionService:EstadoHabitacionService) {
       this.cargarDatos();
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        habitaciones: this.habitacionService.listar(),       
        estado_habitaciones: this.estadoHabitacionService.listar()
      }).subscribe({
        next: (res) => {
          this.habitaciones = res.habitaciones;          
          this.estado_habitaciones = res.estado_habitaciones;
          this.dataSource = new MatTableDataSource<HabitacionModel>(this.habitaciones);
          this.dataSource.paginator = this.paginator;                    
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
      const dialogRef = this.dialog.open(EstadoHabitacionFormComponent,
        { data: {habitacion: this.habitacion,estado_habitaciones: this.estado_habitaciones},
          width: "80vw",
          maxWidth: "400px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(result => {
        if(!result){return;}
        
        if(result) this.mostrarHabitaciones();
        this.cambiarfondoFila("");
      });
    }    

    //------------------------------------------------------------------------
    busqueda(textoBusqueda: string) {
      const filterValue = textoBusqueda;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    //------------------------------------------------------------------------
    getColorEstado(x: any): string {
      // 1. Si viene color_estado desde backend
      if (x.color_estado && x.color_estado.trim() !== '' && x.color_estado.toLowerCase() !== '#ffffff' && x.color_estado.toLowerCase() !== 'white') {
        return x.color_estado;
      }
      // 2. Buscar en la lista de estado_habitaciones cargada
      if (this.estado_habitaciones && this.estado_habitaciones.length > 0) {
        const est = this.estado_habitaciones.find(e => e.id == x.estado_habitacion_id);
        if (est && est.color && est.color.trim() !== '' && est.color.toLowerCase() !== '#ffffff' && est.color.toLowerCase() !== 'white') {
          return est.color;
        }
      }
      // 3. Si x.color tiene color válido y no es estado 1 o blanco
      if (x.color && x.color.trim() !== '' && x.color.toLowerCase() !== '#ffffff' && x.color.toLowerCase() !== 'white' && x.estado_habitacion_id != 1) {
        return x.color;
      }
      // 4. Color por defecto
      switch (Number(x.estado_habitacion_id)) {
        case 1: return '#28a745'; // Disponible (Verde)
        case 2: return '#dc3545'; // Limpieza (Rojo)
        case 3: return '#ffc107'; // Mantenimiento (Amarillo)
        default: return '#6c757d'; // Por defecto (Gris)
      }
    }

    getTextColor(bgColor: string): string {
      if (!bgColor || !bgColor.startsWith('#')) return '#ffffff';
      let c = bgColor.substring(1);
      if (c.length === 3) c = c.split('').map(char => char + char).join('');
      const rgb = parseInt(c, 16);
      if (isNaN(rgb)) return '#ffffff';
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >>  8) & 0xff;
      const b = (rgb >>  0) & 0xff;
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return luma > 160 ? '#000000' : '#ffffff';
    }
    //------------------------------------------------------------------------
    private cambiarfondoFila(color: string) {
      document.querySelectorAll<HTMLElement>("#fila" + this.habitacion.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
    //------------------------------------------------------------------------
}

