
//MODELS
import { AgenciaModel } from '../../models/agencia.model';
import { RegionalModel } from '../../models/regional.model';
import { CiudadModel } from '../../models/ciudad.model';

//SERVICES
import { AgenciaService } from '../../services/agencia.service';
import { RegionalService } from '../../services/regional.service';
import { CiudadService } from '../../services/ciudad.service';

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
import { AgenciaFormComponent } from './agencia-form/agencia-form';

//VARIOS
import { AfterViewInit,Component, ViewChild, inject } from '@angular/core';
import { ConfirmarEliminarComponent } from '../../shared/views/confirmar-eliminar/confirmar-eliminar';
import { SpanishPaginatorIntl } from '../../utils/spanish-paginator-intl';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-agencia',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './agencia.html',
  styleUrl: './agencia.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class AgenciaComponent implements AfterViewInit{
    agencias:AgenciaModel[]=[];
    agencia:AgenciaModel=new AgenciaModel();
    regionales:RegionalModel[]=[];
    ciudades:CiudadModel[]=[];
    buttonEnabled = false; // Deshabilita el botón Add

    displayedColumns: string[] = ['actions','nombre','regional', 'ciudad', 'direccion','telefono','detalle','color_fondo'];
    dataSource! : MatTableDataSource<AgenciaModel>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    

    constructor(private agenciaService:AgenciaService,private regionalService:RegionalService,private ciudadService:CiudadService) {
       this.cargarDatos();      
    }

    ngAfterViewInit() {
     
    }

    cargarDatos() {
      forkJoin({
        agencias: this.agenciaService.listar(),
        regionales: this.regionalService.listar(),
        ciudades: this.ciudadService.listar(),
      }).subscribe({
        next: (res) => {
          this.agencias = res.agencias;
          this.regionales = res.regionales;
          this.ciudades = res.ciudades;

          this.dataSource = new MatTableDataSource<AgenciaModel>(this.agencias);
          this.dataSource.paginator = this.paginator;

          // Habilita el botón Add
          this.buttonEnabled = true;
        }
      });
    }

    mostrarAgencias() {
        this.agenciaService.listar().subscribe({
          next: (res) => {
              this.agencias = res;
              this.dataSource = new MatTableDataSource<AgenciaModel>(res);
              this.dataSource.paginator = this.paginator;
          },
          error: (error) => {
            console.error(error);
          }
        });
    }

    

    readonly dialog = inject(MatDialog);
    mostrarEditar(a:AgenciaModel){
      this.agencia={...a};//clone
      const dialogRef = this.dialog.open(AgenciaFormComponent,
        { data: {agencia: this.agencia,regionales:this.regionales,ciudades:this.ciudades},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.mostrarAgencias();
        this.cambiarfondoFila("");
      });
    }

    mostrarFormularioNuevo(){
      this.agencia=new AgenciaModel();

      const dialogRef = this.dialog.open(AgenciaFormComponent,
        { data: {agencia: this.agencia,regionales:this.regionales,ciudades:this.ciudades},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.mostrarAgencias();
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:AgenciaModel){
      this.agencia=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.agencia.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.agenciaService.eliminar(this.agencia.id!).subscribe({
            next:(res)=>{
              this.mostrarAgencias();
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
    private obtenerListaRegionales(){
      this.regionalService.listar().subscribe({
          next: (res) => {
            this.regionales=res;
          },
          error: (error) => {
            console.error(error);
          }
        });
    }

    //------------------------------------------------------------------------
    private obtenerListaCiudades(){
      this.ciudadService.listar().subscribe({
          next: (res) => {
            this.ciudades=res;
          },
          error: (error) => {
            console.error(error);
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
      document.querySelectorAll<HTMLElement>("#fila" + this.agencia.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

