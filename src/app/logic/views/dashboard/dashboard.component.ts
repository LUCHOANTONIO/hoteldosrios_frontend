import { Component, inject, OnInit } from '@angular/core';
import moment from 'moment';
moment.locale('es');
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StatsCards } from './components/stats-cards/stats-cards';
import { RevenueChart } from './components/revenue-chart/revenue-chart';
import { AnalyticsChart } from './components/analytics-chart/analytics-chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    StatsCards,
    RevenueChart,
    AnalyticsChart   
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  fechaActual: string = '';

  ngOnInit() {
    this.fechaActual = moment().format('dddd, D [de] MMMM [de] YYYY');
    // Capitalizar la primera letra
    this.fechaActual = this.fechaActual.charAt(0).toUpperCase() + this.fechaActual.slice(1);
  }

}
