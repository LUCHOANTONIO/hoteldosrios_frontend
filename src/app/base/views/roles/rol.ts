
//MODELS
import { RolModel } from '../../models/rol.model';
import { RegionalModel } from '../../models/regional.model';
import { CiudadModel } from '../../models/ciudad.model';

//SERVICES
import { RolService } from '../../services/rol.service';
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
import { RolFormComponent } from './rol-form/rol-form';

//VARIOS
import { AfterViewInit,Component, ViewChild, effect, inject } from '@angular/core';
import { ConfirmarEliminarComponent } from '../../shared/views/confirmar-eliminar/confirmar-eliminar';
import { SpanishPaginatorIntl } from '../../utils/spanish-paginator-intl';
import { forkJoin } from 'rxjs';
import { AsignarpermisoComponent } from './asignarpermiso/asignarpermiso';
import { AsignarmenuComponent } from './asignarmenu/asignarmenu';
import { PermisoService } from '../../services/permiso.service';

@Component({
  selector: 'app-rol',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './rol.html',
  styleUrl: './rol.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class RolComponent implements AfterViewInit{
    roles:RolModel[]=[];
    rol:RolModel=new RolModel();
    regionales:RegionalModel[]=[];
    ciudades:CiudadModel[]=[];
    buttonEnabled = false; // Deshabilita el botón Add

    displayedColumns: string[] = ['actions','id', 'codigo','nombre', 'descripcion'];
    dataSource! : MatTableDataSource<RolModel>;
    
    mostrar_btn_create:boolean=false;
    mostrar_btn_edit:boolean=false;
    mostrar_btn_destroy:boolean=false;
    mostrar_btn_menu:boolean=false;
    mostrar_btn_permiso:boolean=false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(private permisoService:PermisoService,private rolService:RolService,private regionalService:RegionalService,private ciudadService:CiudadService) {
        effect(()=>{
          let permisos=this.permisoService.permisos();
          if(permisos.length>0){
            this.mostrar_btn_create=permisos.find(p=>p.nombre=='ADICIONAR ROL')?true:false;
            this.mostrar_btn_edit=permisos.find(p=>p.nombre=='MODIFICAR ROL')?true:false;
            this.mostrar_btn_destroy=permisos.find(p=>p.nombre=='ELIMINAR ROL')?true:false;
            this.mostrar_btn_menu=permisos.find(p=>p.nombre=='ASIGNAR MENUS')?true:false;
            this.mostrar_btn_permiso=permisos.find(p=>p.nombre=='ASIGNAR PERMISOS')?true:false;
          }
        });
        this.cargarDatos();      
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        roles: this.rolService.listar(),
        regionales: this.regionalService.listar(),
        ciudades: this.ciudadService.listar(),
      }).subscribe({
        next: (res) => {
          this.roles = res.roles;
          this.regionales = res.regionales;
          this.ciudades = res.ciudades;

          this.dataSource = new MatTableDataSource<RolModel>(this.roles);
          this.dataSource.paginator = this.paginator;

          // Habilita el botón Add
          this.buttonEnabled = true;
        }
      });
    }

    mostrarRoles() {
        this.rolService.listar().subscribe({
          next: (res) => {
              this.roles = res;
              this.dataSource = new MatTableDataSource<RolModel>(res);
              this.dataSource.paginator = this.paginator;
          },
          error: (error) => {
            console.error(error);
          }
        });
    }

    

    readonly dialog = inject(MatDialog);
    mostrarEditar(a:RolModel){
      this.rol={...a};//clone
      const dialogRef = this.dialog.open(RolFormComponent,
        { data: {rol: this.rol,regionales:this.regionales,ciudades:this.ciudades},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(result => {
        if(result) 
          this.mostrarRoles();
        this.cambiarfondoFila("");
      });
    }
    
    mostrarFormularioNuevo(){
      this.rol=new RolModel();

      const dialogRef = this.dialog.open(RolFormComponent,
        { data: {rol: this.rol,regionales:this.regionales,ciudades:this.ciudades},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.mostrarRoles();
      });
    }

    mostrarAsignarPermisos(r:RolModel){
      this.rol=r; // se guarda el rol para para activar el color de fila
      const dialogRef = this.dialog.open(AsignarpermisoComponent,
        { data: {rol: r
                },
          width: "98vw",
          maxWidth: "1000px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(result => {
        //if(result) 
        this.cambiarfondoFila("");
      });
    }

    mostrarAsignarMenus(r:RolModel){
      this.rol=r; // se guarda el rol para para activar el color de fila
      const dialogRef = this.dialog.open(AsignarmenuComponent,
        { data: {rol: r
                },
          width: "98vw",
          maxWidth: "1000px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(result => {
        //if(result) 
        this.cambiarfondoFila("");
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:RolModel){
      this.rol=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.rol.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.rolService.eliminar(this.rol.id!).subscribe({
            next:(res)=>{
              this.mostrarRoles();
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
      document.querySelectorAll<HTMLElement>("#fila" + this.rol.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

