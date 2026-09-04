import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardService } from '../../../../services/dashboard.service';

@Component({
  selector: 'app-analytics-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './analytics-chart.html',
  styleUrl: './analytics-chart.scss',
})
export class AnalyticsChart {

  constructor(private dashboardService:DashboardService) {
       this.cargarDatos();
  } 

  chartOptions: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '0%',
      left: 'center',
      icon: 'circle',
      itemGap: 20,
      textStyle: {
        color: '#adb5bd'
      }
    },
    series: [
      {
        name: 'Analytics',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 20,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'center',
          formatter: '{a|80}\n{b|Transactions%}', // Fixed typo/wrapping
          rich: {
            a: {
              fontSize: 32,
              fontWeight: 'bold',
              color: '#343a40'
            },
            b: {
              fontSize: 12,
              color: '#868e96',
              lineHeight: 16
            }
          }
        },
        labelLine: {
          show: false
        },
        data: []
      }
    ]
  };

  // cargarDatos() {
  //   this.dashboardService.getRevenue().subscribe({
  //     next: (res) => {     
  //       //Creamos el array de datos mapeando los alias del SQL
  //       const nuevosMontos = [
  //         res.ENE, res.FEB, res.MAR, res.ABR, res.MAY, res.JUN,
  //         res.JUL, res.AGO, res.SEP, res.OCT, res.NOV, res.DIC
  //       ].map(val => Number(val) || 0);

  //       //Actualizamos chartOptions creando un nuevo objeto (Spread operator)
  //       //Esto es vital para que Angular detecte el cambio y refresque la vista
  //       this.chartOptions = {
  //         ...this.chartOptions,
  //         series: [{
  //           ...this.chartOptions.series[0],
  //           data: nuevosMontos
  //         }]
  //       };
  //     },
  //     error: (err) => console.error("Error al obtener Revenue:", err)
  //   });
  // }


  cargarDatos() {
    this.dashboardService.getAnalytics().subscribe({
      next: (res: any[]) => {
        // 1. Transformamos los datos del backend al formato de ECharts
        // Asumimos que el backend envía: { forma_pago: '...', total: ..., porcentaje: ... }
        const pieData = res.map(item => ({
          value: item.total, 
          name: item.forma_pago
        }));

        // 2. Calculamos el total para mostrarlo en el centro (opcional)
        const granTotal = res.reduce((acc, curr) => acc + Number(curr.total), 0);

        // 3. Actualizamos la configuración de la gráfica
        this.chartOptions = {
          ...this.chartOptions,
          series: [
            {
              ...this.chartOptions.series[0],
              label: {
                ...this.chartOptions.series[0].label,
                // Actualizamos el texto central: 'a' es el monto, 'b' es la etiqueta
                // formatter: `{a|${granTotal.toLocaleString()}}\n{b|Ingreso Dia}`,
                formatter: `{a|${Number(granTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}}\n{b|Bs.}`,
              },
              data: pieData // Inyectamos los datos dinámicos aquí
            }
          ]
        };
      },
      error: (err) => console.error("Error cargando analytics", err)
    });
  }

}
