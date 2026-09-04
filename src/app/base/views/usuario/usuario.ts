
//MODELS
import { UsuarioModel } from '../../models/usuario.model';
import { TipoDocumentoModel } from '../../models/tipodocumento.model';
import { EstadoCivilModel } from '../../models/estadocivil.model';
import { GeneroModel } from '../../models/genero.model';
import { RegionalModel } from '../../models/regional.model';
import { AgenciaModel } from '../../models/agencia.model';
import { RolModel } from '../../models/rol.model';

//SERVICES
import { TipoDocumentoService } from '../../services/tipodocumento.service';
import { EstadoCivilService } from '../../services/estadocivil.service';
import { GeneroService } from '../../services/genero.service';
import { AgenciaService } from '../../services/agencia.service';
import { RegionalService } from '../../services/regional.service';
import { UsuarioService } from '../../services/usuario.service';
import { RolService } from '../../services/rol.service';
import { AlertService } from '../../services/local/alert.service';

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
import { UsuarioFormComponent } from './usuario-form/usuario-form';

//VARIOS
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { ConfirmarEliminarComponent } from '../../shared/views/confirmar-eliminar/confirmar-eliminar';
import { SpanishPaginatorIntl } from '../../utils/spanish-paginator-intl';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule,
           ],
  templateUrl: './usuario.html',
  styleUrl: './usuario.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class UsuarioComponent implements AfterViewInit{
    usuarios:UsuarioModel[]=[];
    usuario:UsuarioModel=new UsuarioModel();
    tipo_documentos:TipoDocumentoModel[]=[];
    estado_civil:EstadoCivilModel[]=[];
    generos:GeneroModel[]=[];
    agencias:AgenciaModel[]=[];
    regionales:RegionalModel[]=[];
    rol_ids:RolModel[]=[];
    roles:RolModel[]=[];
    buttonEnabled = false;  // Deshabilita el botón Add

    displayedColumns: string[] = ['actions','reset','usuario','regional','agencia','nombre','primer_apellido','segundo_apellido','nro_documento','tipo_documento','email','telefono','direccion','fecha_nacimiento','genero','estado_civil'];
    dataSource! : MatTableDataSource<UsuarioModel>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(    
      private usuarioService: UsuarioService,
      private tipoDocumentoService: TipoDocumentoService,
      private estadoCivilService: EstadoCivilService,
      private generoService: GeneroService,
      private agenciaService: AgenciaService,
      private regionalService: RegionalService,
      private rolService: RolService,
      private alertService: AlertService
    ) {
      this.cargarDatos();
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
      forkJoin({
        usuarios: this.usuarioService.listar(),
        tipo_documentos: this.tipoDocumentoService.listar(),
        estado_civil: this.estadoCivilService.listar(),
        generos: this.generoService.listar(),
        regionales: this.regionalService.listar(),
        agencias: this.agenciaService.listar(),
        roles: this.rolService.listar()
      }).subscribe({
        next: (res) => {
          this.usuarios = res.usuarios;         
          this.tipo_documentos = res.tipo_documentos;
          this.estado_civil = res.estado_civil;
          this.generos = res.generos;
          this.regionales = res.regionales;
          this.agencias = res.agencias;
          this.roles = res.roles;

          this.dataSource = new MatTableDataSource<UsuarioModel>(this.usuarios);
          this.dataSource.paginator = this.paginator;

          // Habilita el botón Add
          this.buttonEnabled = true;
        }
      });
    }

    mostrarUsuarios() {
        this.usuarioService.listar().subscribe({
          next: (res) => {
              this.usuarios = res;
              this.dataSource = new MatTableDataSource<UsuarioModel>(res);
              this.dataSource.paginator = this.paginator;
          },
          error: (error) => {
            console.error(error);
          }
        });
    }

    readonly dialog = inject(MatDialog);
    mostrarEditar(x:UsuarioModel){
      this.usuario={...x};//clone
      forkJoin({
        rol_ids: this.rolService.listarRolesUsuario(this.usuario.id!)
      }).subscribe({
        next: (res) => {

            this.usuario.rol_ids = res.rol_ids.map(r => r.id!);

            const dialogRef = this.dialog.open(UsuarioFormComponent,
              { data: {usuario: this.usuario, tipo_documentos:this.tipo_documentos,estado_civil:this.estado_civil,generos:this.generos,agencias:this.agencias,regionales:this.regionales,roles:this.roles},
                width: "98vw",
                maxWidth: "700px",
                disableClose:true               
              });
            this.cambiarfondoFila("azure");
            
            dialogRef.afterClosed().subscribe(result => {
              if(result) this.mostrarUsuarios();
              this.cambiarfondoFila("");
            });
        }
      });
    }

    mostrarFormularioNuevo(){
      this.usuario=new UsuarioModel();
      //this.usuario.regional_id = 1; //Empresa por defecto BIG HOLDING
      const dialogRef = this.dialog.open(UsuarioFormComponent,
        { data: {usuario: this.usuario, tipo_documentos:this.tipo_documentos,estado_civil:this.estado_civil,generos:this.generos,agencias:this.agencias,regionales:this.regionales,roles:this.roles},
          width: "98vw",
          maxWidth: "700px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.mostrarUsuarios();
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:UsuarioModel){
      this.usuario=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.usuario.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.usuarioService.eliminar(this.usuario.id!).subscribe({
            next:(res)=>{
              this.mostrarUsuarios();
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

    mostrarConfirmarResetPassword(x:UsuarioModel){
        //  mostrar ventana de confirmacion de reseteo de password
        this.usuario=x;
        this.cambiarfondoFila("azure");
        this.alertService.show( "Está seguro de resetear el password de: "+x.usuario+"?",{type:'warning',cancelShow:true}).subscribe({
            next:(res)=>{
              this.cambiarfondoFila("");
              if(res){
                //alert("CONFIRMÓ");
                this.usuarioService.cambiarPassword(x.id!,x.usuario,x.usuario).subscribe({
                  next: (res) => {
                    this.alertService.show("Ahora el password es el mismo que el login (usuario), tomando en cuenta mayúsculas y minusculas",
                          {title:"PASSWORD RESETEADO",type:'success'}
                        );
                  },
                  error: (error) => {
                    this.alertService.show("error",{duration:3000,type:'warning'});
                    //console.log(error);
                  }
                })
              }else{
                //alert("CANCELO");
              }
            }
          });
        //----------------------------------------------
    }

    //------------------------------------------------------------------------
    busqueda(textoBusqueda: string) {
      const filterValue = textoBusqueda;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    //------------------------------------------------------------------------
    private cambiarfondoFila(color: string) {
      document.querySelectorAll<HTMLElement>("#fila" + this.usuario.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

