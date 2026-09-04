
//MODELS
import { PermisoModel } from '../../models/permiso.model';
import { ModuloModel } from '../../models/modulo.model';
import { TipoPermisoModel } from '../../models/tipopermiso.model';

//SERVICES
import { PermisoService } from '../../services/permiso.service';
import { ModuloService } from '../../services/modulo.service';
import { TipoPermisoService } from '../../services/tipopermiso.service';

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
import { PermisoFormComponent } from './permiso-form/permiso-form';

//VARIOS
import { AfterViewInit,Component, ViewChild, inject } from '@angular/core';
import { ConfirmarEliminarComponent } from '../../shared/views/confirmar-eliminar/confirmar-eliminar';
import { SpanishPaginatorIntl } from '../../utils/spanish-paginator-intl';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-permiso',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './permiso.html',
  styleUrl: './permiso.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class PermisoComponent implements AfterViewInit{
    permisos:PermisoModel[]=[];
    permiso:PermisoModel=new PermisoModel();
    modulos:ModuloModel[]=[];
    tipoPermisos:TipoPermisoModel[]=[];
    buttonEnabled = false; // Deshabilita el botón Add

    displayedColumns: string[] = ['actions','id','nombre','descripcion','ruta_nombre','modulo','tipo_permiso'];
    dataSource! : MatTableDataSource<PermisoModel>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(private permisoService:PermisoService,private moduloService:ModuloService,private tipoPermisoService:TipoPermisoService) {
       this.cargarDatos();
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        permisos: this.permisoService.listar(),
        modulos: this.moduloService.listar(),
        tipoPermisos: this.tipoPermisoService.listar(),
      }).subscribe({
        next: (res) => {
          this.permisos = res.permisos;
          this.modulos = res.modulos;
          this.tipoPermisos = res.tipoPermisos;

          this.dataSource = new MatTableDataSource<PermisoModel>(this.permisos);
          this.dataSource.paginator = this.paginator;

          // Habilita el botón Add
          this.buttonEnabled = true;
        }
      });
    }

    mostrarPermisos() {
        this.permisoService.listar().subscribe({
          next: (res) => {
              this.permisos = res;
              this.dataSource = new MatTableDataSource<PermisoModel>(res);
              this.dataSource.paginator = this.paginator;
          },
          error: (error) => {
            console.error(error);
          }
        });
    }

    

    readonly dialog = inject(MatDialog);
    mostrarEditar(a:PermisoModel){
      this.permiso={...a};//clone
      const dialogRef = this.dialog.open(PermisoFormComponent,
        { data: {permiso: this.permiso,modulos:this.modulos,tipoPermisos:this.tipoPermisos},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.mostrarPermisos();
        this.cambiarfondoFila("");
      });
    }

    mostrarFormularioNuevo(){
      this.permiso=new PermisoModel();

      const dialogRef = this.dialog.open(PermisoFormComponent,
        { data: {permiso: this.permiso,modulos:this.modulos,tipoPermisos:this.tipoPermisos},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.mostrarPermisos();
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:PermisoModel){
      this.permiso=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.permiso.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.permisoService.eliminar(this.permiso.id!).subscribe({
            next:(res)=>{
              this.mostrarPermisos();
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
      document.querySelectorAll<HTMLElement>("#fila" + this.permiso.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

