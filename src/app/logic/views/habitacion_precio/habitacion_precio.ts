
//MODELS
import { HabitacionPrecioModel } from '../../models/habitacion_precio.model';
import { TipoHabitacionModel } from '../../models/tipo_habitacion.model';

//SERVICES
import { HabitacionPrecioService } from '../../services/habitacion_precio.service';

//DIRECTIVAS
import { BotonGuardarDirective } from '../../../base/shared/directives/boton-guardar.directive';
import { PreventEnterSubmitDirective } from '../../../base/shared/directives/prevent-enter-submit.directive';
import { AnimarPerderFocoDirective } from '../../../base/shared/directives/animar-perder-foco.directive';

//MATERIAL DESING
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, NgForm} from '@angular/forms';

//COMPONENT
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//VARIOS
import { AfterViewInit,Component, Inject, inject, ViewChild} from '@angular/core';
import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';
import { MatSelectModule } from '@angular/material/select';
import { AlertService } from '../../../base/services/local/alert.service';

@Component({
  selector: 'app-habitacion_precio',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,MatProgressSpinnerModule,
            MatFormFieldModule,MatInputModule,MatCardModule,MatSelectModule,BotonGuardarDirective,PreventEnterSubmitDirective,AnimarPerderFocoDirective,FormsModule
           ],
  templateUrl: './habitacion_precio.html',
  styleUrl: './habitacion_precio.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class HabitacionPrecioComponent implements AfterViewInit{
   @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
   habitacion_precio_list:HabitacionPrecioModel[]=[];
   habitacion_precio:HabitacionPrecioModel=new HabitacionPrecioModel(); 
   tipo_habitaciones:TipoHabitacionModel[]=[];
   habitacion_id:number;       

   displayedColumns: string[] = ['actions', 'tipo_habitacion','precio'];   
   dataSource : MatTableDataSource<HabitacionPrecioModel>;

   @ViewChild(MatPaginator) paginator: MatPaginator;
    
   constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<HabitacionPrecioComponent>,
        private habitacionPrecioService: HabitacionPrecioService,
        private alertService: AlertService        
    ) {      
        this.habitacion_id = data.habitacion_id;
        this.tipo_habitaciones = data.tipo_habitaciones;
        this.cargarDatos();
    }

    ngAfterViewInit() {

    }

    submit(f: NgForm) {
      if (f.valid) {
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        if(this.habitacion_id>0){
          this.modificar();
        }else{
          this.crear();
        }
      } else {
        this.alertService.show("Debe llenar los campos",{duration:3000,type:'info'});
      }
    }

    cargarDatos() {
      forkJoin({       
        habitacion_precio_list: this.habitacionPrecioService.listar(this.habitacion_id),                     
      }).subscribe({
        next: (res) => {                                      
          this.habitacion_precio_list = res.habitacion_precio_list;         
          this.dataSource = new MatTableDataSource<HabitacionPrecioModel>(this.habitacion_precio_list);
          this.dataSource.paginator = this.paginator;

          if(this.habitacion_precio_list.length===0){
            this.adicionarFila()
          }        
                   
        }
      });
    }
    
    crear(){    

      if (!this.habitacion_precio_list || this.habitacion_precio_list.length === 0) {
        this.alertService.show('Debe agregar al menos un precio.', { 
          duration: 5000, 
          type: 'warning' 
        }); 
        this.botonGuardarDirectiva.habilitarFormBoton();          
        return; // Detiene la ejecución aquí
      }

      this.habitacionPrecioService.crear(this.habitacion_id,this.habitacion_precio_list).subscribe({
        next:(res)=>{
          if(res.correcto){             
              const data = JSON.parse(res.dato);  

              this.habitacion_precio_list = data.habitacion_precio_list || [];
              this.dataSource = new MatTableDataSource<HabitacionPrecioModel>(this.habitacion_precio_list);
              this.dataSource.paginator = this.paginator; 
              this.botonGuardarDirectiva.habilitarFormBoton();

              this.alertService.show("Se guardo correctamente los datos", { duration: 5000, type: 'info' });
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

    modificar(){  
      
      if (!this.habitacion_precio_list || this.habitacion_precio_list.length === 0) {
        this.alertService.show('Debe agregar al menos un precio.', { 
          duration: 5000, 
          type: 'warning' 
        }); 
        this.botonGuardarDirectiva.habilitarFormBoton();          
        return; // Detiene la ejecución aquí
      }
      
      this.habitacionPrecioService.modificar(this.habitacion_id,this.habitacion_precio_list).subscribe({
        next:(res)=>{
          if(res.correcto){             
              const data = JSON.parse(res.dato);  
              this.habitacion_precio_list = data.habitacion_precio_list || [];
              this.dataSource = new MatTableDataSource<HabitacionPrecioModel>(this.habitacion_precio_list);
              this.dataSource.paginator = this.paginator; 

              this.botonGuardarDirectiva.habilitarFormBoton();
              this.alertService.show("Se actualizo correctamente los datos", { duration: 5000, type: 'info' });
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

    readonly dialog = inject(MatDialog);
    eliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:HabitacionPrecioModel){
        this.habitacion_precio=a;
  
        const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
          width: '250px',
          enterAnimationDuration,
          exitAnimationDuration,
          data: this.habitacion_precio.id
        });                  

        dialogRef.afterClosed().subscribe(result => {
          if (result) {

            if (result === null) {
              return; 
            }
            
            if (this.habitacion_precio.estado === 'guardado') {
              // Eliminación lógica
              this.habitacion_precio.estado = 'eliminado';
            } else if (this.habitacion_precio.estado === 'nuevo') {
              // Eliminación física                                    
              const index = this.dataSource.data.indexOf(this.habitacion_precio);
              if (index >= 0) {
                this.dataSource.data.splice(index, 1); // elimina solo ese objeto
                this.dataSource._updateChangeSubscription();
              }
            }
          }
        });

    }    
    
    adicionarFila() {
      const nuevaFila = new HabitacionPrecioModel();
      nuevaFila.id = 0;
      nuevaFila.tipo_habitacion_id = null;    
      nuevaFila.precio = null;
      nuevaFila.estado = "nuevo";
      this.habitacion_precio_list.push(nuevaFila);
      this.dataSource.data = this.habitacion_precio_list;
    }    
   
  }

