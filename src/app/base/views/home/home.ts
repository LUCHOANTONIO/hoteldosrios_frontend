import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Router } from '@angular/router';
import { AppService } from '../../services/local/app.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule,MatCardModule,MatDividerModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
 constructor(public snackBar: MatSnackBar, private router: Router, private appService: AppService){
    this.router.navigate([this.appService.getRutaInicio()]);
  }
}
