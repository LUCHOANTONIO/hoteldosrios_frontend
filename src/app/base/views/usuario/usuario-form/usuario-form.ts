//MODELS
import { UsuarioModel } from '../../../models/usuario.model';
import { TipoDocumentoModel } from '../../../models/tipodocumento.model';
import { RolModel } from '../../../models/rol.model';


import { EstadoCivilModel } from '../../../models/estadocivil.model';
import { GeneroModel } from '../../../models/genero.model';
import { RegionalModel } from '../../../models/regional.model';
import { AgenciaModel } from '../../../models/agencia.model';

//SERVICES
import { PersonaService } from '../../../services/persona.service';
import { AgenciaService } from '../../../services/agencia.service';
import { UsuarioService } from '../../../services/usuario.service';
import { AlertService } from '../../../services/local/alert.service';

//ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule} from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

//DIRECTIVAS
import { PreventEnterSubmitDirective } from '../../../shared/directives/prevent-enter-submit.directive';
import { PreventEnterSelectDirective } from '../../../shared/directives/prevent-enter-select.directive';
import { AnimarPerderFocoDirective } from '../../../shared/directives/animar-perder-foco.directive';
import { BotonGuardarDirective } from '../../../shared/directives/boton-guardar.directive';


//VARIOS
import { Component,ViewChild, Inject } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,
    CdkDrag, CdkDragHandle,PreventEnterSubmitDirective,PreventEnterSelectDirective,AnimarPerderFocoDirective,BotonGuardarDirective],
  templateUrl: './usuario-form.html',
  styleUrls: ['./usuario-form.scss']
})
export class UsuarioFormComponent {
    @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
    usuario:UsuarioModel;
    tipo_documentos:TipoDocumentoModel[];
    estado_civil:EstadoCivilModel[]=[];
    generos:GeneroModel[]=[];
    agencias:AgenciaModel[]=[];
    regionales:RegionalModel[]=[];
    roles:RolModel[]=[];

    constructor(public dialogRef: MatDialogRef<UsuarioFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,private personaService:PersonaService,private agenciaService:AgenciaService,private dialog:MatDialog, private usuarioService:UsuarioService,private alertService:AlertService) {
          this.usuario = data.usuario;
          this.tipo_documentos = data.tipo_documentos;
          this.estado_civil = data.estado_civil;
          this.generos = data.generos;
          this.regionales = data.regionales;
          if(this.usuario.regional_id){
            this.cargarComboAgenciaPorIdRegional(this.usuario.regional_id); // se filtar al cambiar regional 
          }
          this.roles = data.roles;
          
    }

    submit(f: NgForm) {
      if (f.valid) {
          this.botonGuardarDirectiva.deshabilitarFormBoton();
          if(this.usuario.id != null){
            this.modificar();
          }else{
            this.crear();
          }
      } else {
         this.alertService.show("Debe llenar los campos",{duration:3000,type:'info'});
      }
    }

    crear(){
      this.usuarioService.crear(this.usuario).subscribe({
        next:(res)=>{
          //this.mostrarAgencias();
          this.dialogRef.close({ data: this.data });
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }

    // -----------------------------------------------------------------------
    modificar(){
      this.usuarioService.modificar(this.usuario).subscribe({
        next:(res)=>{
          //this.mostrarAgencias();
          this.dialogRef.close({ data: this.data });
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
          //console.error(error.HttpErrorResponse);
        }
      })
    }

    verificarNroDocumento(nro_documento:string){
        if(this.usuario.id==null && nro_documento?.trim()){
            this.personaService.personaPorNroDocumento(nro_documento).subscribe({
                next: (res) => {
                  if(Object.keys(res).length!=0) {

                      const {
                        tipo_doc_id,
                        nombre,
                        primer_apellido,
                        segundo_apellido,
                        email,
                        telefono,
                        direccion,
                        fecha_nacimiento,
                        genero_id,
                        estado_civil_id,
                      } = res;

                      this.usuario.tipo_doc_id=Number(tipo_doc_id);
                      this.usuario.nombre=nombre;
                      this.usuario.primer_apellido=primer_apellido;
                      this.usuario.segundo_apellido=segundo_apellido;
                      this.usuario.email=email;
                      this.usuario.telefono=telefono;
                      this.usuario.direccion=direccion;
                      this.usuario.fecha_nacimiento=fecha_nacimiento;
                      this.usuario.genero_id=genero_id;
                      this.usuario.estado_civil_id=estado_civil_id;

                      this.alertService.show(`El nro de documento ${nro_documento}, ya existe`,{duration:10000,type:'info'});
                  } else {
                      this.usuario.tipo_doc_id=null;
                      this.usuario.nombre="";
                      this.usuario.primer_apellido="";
                      this.usuario.segundo_apellido="";
                      this.usuario.email="";
                      this.usuario.telefono="";
                      this.usuario.direccion="";
                      this.usuario.fecha_nacimiento="";
                      this.usuario.genero_id=null;
                      this.usuario.estado_civil_id=null;
                      this.usuario.usuario="";
                      this.usuario.usuario_email="";
                      this.usuario.regional_id=null;
                      this.usuario.agencia_id=null;
                  }
                },
                error: (error) => {
                  console.error(error);
                }
            });
        }
    }

cargarComboAgenciaPorIdRegional(regional_id:number) {
      this.agencias = this.data.agencias;
      // Filtrar las agencias según la regional seleccionada
      this.agencias = this.agencias.filter(
        (agencia) => agencia.regional_id === regional_id
      );
      // Resetear el valor del combo dependiente (opcional)
      //this.usuario.agencia_id = null;
    }
}
