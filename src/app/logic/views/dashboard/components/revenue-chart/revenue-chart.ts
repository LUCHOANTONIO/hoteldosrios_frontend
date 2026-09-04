//SERVICES
import { DashboardService } from '../../../../services/dashboard.service';


import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';


@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './revenue-chart.html',
  styleUrl: './revenue-chart.scss',
})
export class RevenueChart {

  constructor(private dashboardService: DashboardService) {
    this.cargarDatos();
  }

  chartOptions: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      backgroundColor: 'rgba(0,0,0,0.8)',
      textStyle: { color: '#fff' },
      // Formateador opcional para ver el símbolo de $ en el tooltip
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>${data.marker} ${data.seriesName}: <b>Bs. ${data.value.toLocaleString()}</b>`;
      }
    },
    grid: {
      left: '2%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      // Eje X con los meses correspondientes a tu consulta
      data: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#adb5bd' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: { color: '#f1f3f5', type: 'dashed' }
      },
      axisLabel: {
        color: '#adb5bd',
        // Agrega el signo de peso a las etiquetas laterales
        formatter: 'Bs. {value}'
      }
    },
    series: [
      {
        name: 'Ingresos',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#d63384' },
        lineStyle: {
          width: 4,
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#339af0' }, // Blue
              { offset: 1, color: '#d63384' }  // Purple
            ]
          }
        },
        areaStyle: {
          opacity: 0.1,
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#d63384' },
              { offset: 1, color: 'rgba(255, 255, 255, 0)' }
            ]
          }
        },
        // Datos iniciales en cero
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        markPoint: {
          data: [{ type: 'max', name: 'Max' }],
          symbol: 'roundRect',
          symbolSize: [60, 30],
          symbolOffset: [0, -30],
          label: {
            formatter: 'Bs. {c}', // Formato moneda en el punto máximo
            color: '#fff',
            fontWeight: 'bold'
          },
          itemStyle: { color: '#000' }
        }
      }
    ]
  };

  cargarDatos() {
    this.dashboardService.getRevenue().subscribe({
      next: (res) => {
        //Creamos el array de datos mapeando los alias del SQL
        const nuevosMontos = [
          res.ENE, res.FEB, res.MAR, res.ABR, res.MAY, res.JUN,
          res.JUL, res.AGO, res.SEP, res.OCT, res.NOV, res.DIC
        ].map(val => Number(val) || 0);

        //Actualizamos chartOptions creando un nuevo objeto (Spread operator)
        //Esto es vital para que Angular detecte el cambio y refresque la vista
        this.chartOptions = {
          ...this.chartOptions,
          series: [{
            ...this.chartOptions.series[0],
            data: nuevosMontos
          }]
        };
      },
      error: (err) => console.error("Error al obtener Revenue:", err)
    });
  }

}
