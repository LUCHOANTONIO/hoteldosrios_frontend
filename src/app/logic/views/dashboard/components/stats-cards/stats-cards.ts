
//SERVICES
import { DashboardService } from '../../../../services/dashboard.service';

//COMPONENT
import { DisponibilidadFormComponent } from './disponibilidad-form/disponibilidad-form';
import { CheckOutFormComponent } from './checkout-form/checkout-form';

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { RouterModule } from '@angular/router';
import { MatDialog} from '@angular/material/dialog';
import moment from 'moment';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule, MatIconModule,RouterModule],
  templateUrl: './stats-cards.html',
  styleUrl: './stats-cards.scss',
})
export class StatsCards {
  readonly dialog = inject(MatDialog);
  fecha_filter: Date = moment().toDate();
  
  cards = [
    { title: 'Check Out HOY', value: '0', icon: 'favorite', bg: '#eef2ff', iconColor: '#5c7cfa',action: () => this.mostrarCheckOut()},
    { title: 'Ambientes disponibles HOY', value: '0', icon: 'vpn_key', bg: '#fff9db', iconColor: '#fcc419',action: () => this.mostrarDisponibleHoy()},
    { title: 'Ambientes Disponibles Mañana', value: '0', icon: 'cases', bg: '#fff0f6', iconColor: '#faa2c1',action: () => this.mostrarDisponibleManiana()},
    { title: 'Ingreso Mensual', value: '0 Bs', icon: 'account_balance_wallet', bg: '#f3f0ff', iconColor: '#845ef7'}
  ];

  constructor(private dashboardService: DashboardService) 
  {        
     this.cargarDatos();
  }

  cargarDatos() {
    forkJoin({
      stats: this.dashboardService.getStats()
    }).subscribe({
      next: (res) => {
        this.cards[0].value = (res.stats.cantidad_check_out ?? 0).toString();
        this.cards[1].value = (res.stats.disponible_hoy ?? 0).toString();
        this.cards[2].value = (res.stats.disponible_maniana ?? 0).toString();
        this.cards[3].value = (res.stats.ingreso_mensual ?? 0).toString() + ' Bs';
      }
    });
  } 
  
  mostrarDisponibleHoy(){ 
      this.fecha_filter= moment().toDate();        
      const dialogRef = this.dialog.open(DisponibilidadFormComponent,
        { data: {fecha_filter: this.fecha_filter},
          width: "98vw",
          // maxWidth: "800px",
          maxWidth: '850px',
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(res => {                    
        //
      });
  }

  mostrarDisponibleManiana(){ 
      this.fecha_filter = moment().add(1, 'days').toDate();        
      const dialogRef = this.dialog.open(DisponibilidadFormComponent,
        { data: {fecha_filter: this.fecha_filter},
          width: "98vw",         
          maxWidth: '850px',
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(res => {                    
        //
      });
  }

  mostrarCheckOut(){ 
      this.fecha_filter = moment().add(1, 'days').toDate();        
      const dialogRef = this.dialog.open(CheckOutFormComponent,
        { data: {fecha_filter: this.fecha_filter},
          width: "98vw",         
          maxWidth: '850px',
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(res => {                    
        //
      });
  }

}
