import { Component, inject, signal } from '@angular/core';

import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { RespuestaRequest } from '../../models/local/respuesta.request.model';
import { LoginModel } from '../../models/local/login.model';
import { SessionModel } from '../../models/local/session.model';
import { RolModel } from '../../models/rol.model';
import { SeleccionRolComponent } from './seleccion-rol/seleccion-rol';
import { TokenModel } from '../../models/local/token.model';

//ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

//SERVICES
import { AuthService } from '../../services/auth.service';
import { AppService } from '../../services/local/app.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatDividerModule, MatButtonModule, FormsModule,
    MatDialogModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  usuario: string = '';
  password: string = '';
  mensaje: string = "";
  readonly dialog = inject(MatDialog);
  protected appService = inject(AppService);

  // para mostrar u ocultar el ojito
  hide = signal(true);

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  constructor(protected authService: AuthService, protected router: Router) {
     if (authService.isAuth()) this.router.navigate(['/home']);    
  }

  login(f: NgForm) {
    if (f.valid) {
      this.authService.login(this.usuario, this.password).subscribe({
        next: (res) => {
          if (res.codigo == 0) {
            //this.mensaje=res.mensaje;
            this.mensaje = "El usuario no cuenta con rol en el sistema";
            return;
          }
          if (res.codigo == 1) {
            //ingresa al sistema y carga el rol actual al layout header
            let rol: RolModel = res.dato.roles[0];
            this.guadarDatosSession(res, rol);
            // this.router.navigate(['/home']); //Antes estaba home, se cambio para que directo aparezca el timeline
            this.router.navigate(['/timeline']);
            return;
          };
          if (res.codigo >= 2) {
            this.mostrarSeleccioneRolModal(res);
            return;
          }

        },
        error: (error) => {
          if(error.status==401) {
            this.mensaje="Credenciales incorrectas";
            return;
          }
          //console.error(error);
        }
      })
    }

  }

  guadarDatosSession(res: RespuestaRequest<LoginModel>, rol: RolModel) {
    let login = res.dato;
    let datosSession = new SessionModel();
    datosSession.USUARIO_ID = login.usuario.id!;
    datosSession.USUARIO_NOMBRE = login.persona.nombre;
    datosSession.USUARIO_PRIMER_APELLIDO = login.persona.primer_apellido;
    datosSession.USUARIO_SEGUNDO_APELLIDO = login.persona.segundo_apellido;
    datosSession.AGENCIA_ID = login.agencia == null ? 0 : login.agencia.id!;
    datosSession.AGENCIA_NOMBRE = login.agencia == null ? "" : login.agencia.nombre; 
    let agencia_nombre=login.agencia == null ? "" : login.agencia.nombre;     
    this.appService.updateAgenciaNombre(agencia_nombre); //Se hizo modificaciones para multiple sesion         
    datosSession.REGIONAL_ID = login.regional == null ? 0 : login.regional.id!;
    datosSession.REGIONAL_NOMBRE = login.regional == null ? "" : login.regional.nombre;

    datosSession.SESSION_LIFETIME=res.dato.session_life_time;

    datosSession.ROL_ID = rol == null ? 0 : rol.id!;
    datosSession.ROL_NOMBRE = rol == null ? "" : rol.nombre;

    // el operacion ? evalua la expresion de la izquierda y verifica que no sea null o undefined, en tal caso ejecuta la expresion de la derecha. Si es null o undefined, no se ejecuta la linea
    datosSession.Configuraciones.MOSTRAR_MENU_VERTICAL=login.configuraciones.find(a=>{return a.nombre==="mostrar_menu_vertical"})?.valor.toLocaleUpperCase()==="SI";
    datosSession.Configuraciones.MOSTRAR_MENU_HORIZONTAL=login.configuraciones.find(a=>{
                                                      return a.nombre==="mostrar_menu_horizontal"}
                                                     )?.valor.toLocaleUpperCase()==="SI";

    this.appService.setSession(datosSession);
    
    let token=new TokenModel();
    token.access_token=login.access_token;
    token.expires_in=login.expires_in;
    this.appService.setToken(token);
    //this.appService.setToken(login.access_token);
    this.authService.triggerAuthChange(true);
  }

  //---------------------------------------------------
  mostrarSeleccioneRolModal(res: RespuestaRequest<LoginModel>) {
    let roles: RolModel[] = res.dato.roles;
    let persona = res.dato.persona;
    const dialogRef = this.dialog.open(SeleccionRolComponent,
      {
        data: { roles: roles, nombreUsuario: persona.nombre },
        width: "98vw",
        maxWidth: "600px",
        disableClose: true
      });

     dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let rol: RolModel = result.rol;
        this.guadarDatosSession(res, rol);
        //this.router.navigate(['/home']);
        this.router.navigate(['/timeline']);
      }
      else {
        this.authService.logout();
        this.appService.clear;
        this.router.navigate(['/login']);
      }

    });
  }
  
}

