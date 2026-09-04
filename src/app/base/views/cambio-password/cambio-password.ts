import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UsuarioService } from '../../services/usuario.service';
import { MatButtonModule } from '@angular/material/button';
import { AppService } from '../../services/local/app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cambio-password',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule,MatInputModule,MatIconModule,MatButtonModule,FormsModule],
  templateUrl: './cambio-password.html',
  styleUrl: './cambio-password.scss'
})
export class CambioPasswordComponent {
  new_password:string="";
  new_password_confirmation:string="";
  mensaje:string="";

  // para mostrar u ocultar el ojito
  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  
  constructor(private usuarioService:UsuarioService, private appService:AppService,private authService:AuthService ,private _matSnackBar:MatSnackBar) {
        
  }

  cambiarPassword(f:NgForm){
    //----------------------------------------------
    //valida obligatoriedad
    if (!f.valid) {
      this._matSnackBar.open('Debe llenar los campos obligatorios', 'Cerrar', {
        duration:20000,
        horizontalPosition: "center",
        verticalPosition: "bottom",
        panelClass: 'info-snackbar'
      });
      return;
    }

    //----------------------------------------------
    //valida confirmacion
    if(this.new_password!=this.new_password_confirmation){
      this._matSnackBar.open('el Password y la confirmacion son diferentes', 'Cerrar', {
        duration:3000,
        horizontalPosition: "center",
        verticalPosition: "bottom",
        panelClass: 'info-snackbar'
      });
      return;
    }

    //----------------------------------------------
    //  cambiar password
    this.usuarioService.cambiarPassword(this.appService.session.USUARIO_ID,this.new_password,this.new_password_confirmation).subscribe({
      next: (res) => {
        this._matSnackBar.open('Elpassword se cambió correctamente', 'Aceptar', {
          duration:3000,
          horizontalPosition: "center",
          verticalPosition: "bottom",
          panelClass: 'success-snackbar'
        });
        this.authService.cerrarSesion(); //cierra session borra datos sesion y redirige a login.
      },
      error: (error) => {
        console.log(error);
      }
    })
    //----------------------------------------------
  }

}
