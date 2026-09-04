import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule,MatCardModule,MatDividerModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
 constructor(public snackBar: MatSnackBar){
    this.saludar();
  }
  
 saludar(){
  this.snackBar.open(`Bienvenido al Sistema`, 'Aceptar', {
                        duration:2000,
                        horizontalPosition: "center",
                        verticalPosition: "bottom",
                        panelClass: 'info-snackbar'
                      });
 }
}
