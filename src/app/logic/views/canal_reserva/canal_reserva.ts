
//MODELS
import { CanalReservaModel } from '../../models/canal_reserva.model';

//SERVICES
import { CanalReservaService } from '../../services/canal_reserva.service';
import { AlertService } from '../../../base/services/local/alert.service';

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
import { CanalReservaFormComponent } from './canal_reserva-form/canal_reserva-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//VARIOS
import { AfterViewInit,Component, ViewChild, effect, inject, signal } from '@angular/core';

import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';


@Component({
  selector: 'app-canal_reserva',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './canal_reserva.html',
  styleUrl: './canal_reserva.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class CanalReservaComponent implements AfterViewInit{   
    canal_reservas = signal<CanalReservaModel[]>([]);
    canal_reserva:CanalReservaModel=new CanalReservaModel(); 
    buttonEnabled = false; // Deshabilita el botón Add

    displayedColumns: string[] = ['actions','descripcion'];
    dataSource : MatTableDataSource<CanalReservaModel>;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private canalReservaService:CanalReservaService, private alertService:AlertService) {
       this.cargarDatos();

       effect(() => {
           this.dataSource = new MatTableDataSource<CanalReservaModel>(this.canal_reservas());
           this.dataSource.paginator = this.paginator;
       });
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        canal_reservas: this.canalReservaService.listar(),       
      }).subscribe({
        next: (res) => {
          this.canal_reservas.set(res.canal_reservas);                             
          // Habilita el botón Add
          this.buttonEnabled = true;
        }
      });
    }

    mostrarCanalReserva() {
        this.canalReservaService.listar().subscribe({
          next: (res) => {
              this.canal_reservas.set(res);             
          },
          error: (error) => {
            console.error(error);
          }
        });
    }

    readonly dialog = inject(MatDialog);
    mostrarEditar(a:CanalReservaModel){
      this.canal_reserva={...a};//clone
      this.dialog.open(CanalReservaFormComponent,
        { data: {canal_reserva: this.canal_reserva,canal_reservas: this.canal_reservas},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");      
    }

    mostrarFormularioNuevo(){
      this.canal_reserva=new CanalReservaModel();
      this.dialog.open(CanalReservaFormComponent,
        { data: {canal_reserva: this.canal_reserva,canal_reservas: this.canal_reservas},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });     
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:CanalReservaModel){
      this.canal_reserva=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.canal_reserva.id
      });

      this.cambiarfondoFila("MistyRose");

      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.canalReservaService.eliminar(this.canal_reserva.id).subscribe({
            next:(res)=>{               
                if(res.correcto){             
                    const data = JSON.parse(res.dato);                     
                    this.canal_reservas.set(data.canal_reservas);                                    
                } else {
                    this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
                }  
            },
            error:(error)=>{
              console.error(error);
            }
          })

        } else {
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
      document.querySelectorAll<HTMLElement>("#fila" + this.canal_reserva.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

