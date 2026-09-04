//MODELS
import { DisponibilidadModel } from '../../models/disponibilidad.model';

//SERVICES
import { HabitacionService } from '../../services/habitacion.service';

//DATA PICKER
import { MatDatepickerModule } from '@angular/material/datepicker';
import moment from "moment";

//MATERIAL DESING
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

//COMPONENT

//VARIOS
import { AfterViewInit, Component, Inject, Optional, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CompletarReservaFormComponent } from '../completar_dato/completar_reserva/reserva-form';

@Component({
  selector: 'app-disponibilidad',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatDialogModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatDatepickerModule, MatTooltipModule
  ],
  templateUrl: './disponibilidad.html',
  styleUrl: './disponibilidad.scss',
})

export class DisponibilidadComponent implements AfterViewInit {
  readonly dialog = inject(MatDialog);

  list_disponibilidad: DisponibilidadModel[] = [];
  pisos: number[] = [];
  habitacionesPorPiso: { [piso: number]: DisponibilidadModel[] } = {};
  fecha_filter!: Date;

  constructor(
    @Optional() public dialogRef: MatDialogRef<DisponibilidadComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private habitacionService: HabitacionService,
  ) {
    if (data && data.fecha_filter) {
      this.fecha_filter = moment(data.fecha_filter).toDate();
    } else {
      this.fecha_filter = moment().toDate();
    }
    this.cargarDatos();
  }

  ngAfterViewInit() {

  }

  cargarDatos() {
    forkJoin({
      list_disponibilidad: this.habitacionService.disponibilidad(this.fecha_filter)
    }).subscribe({
      next: (res) => {
        this.list_disponibilidad = res.list_disponibilidad;
        this.agruparPorPiso();
      }
    });
  }

  agruparPorPiso() {
    this.habitacionesPorPiso = {};
    const pisosSet = new Set<number>();

    this.list_disponibilidad.forEach(hab => {
      const nroStr = hab.nro_habitacion ? hab.nro_habitacion.toString() : '0';
      const nro = parseInt(nroStr, 10);
      let piso = 0;
      if (!isNaN(nro) && nro > 0) {
        piso = Math.floor(nro / 100);
      }

      if (!this.habitacionesPorPiso[piso]) {
        this.habitacionesPorPiso[piso] = [];
      }
      this.habitacionesPorPiso[piso].push(hab);
      pisosSet.add(piso);
    });

    // Ordenar pisos de forma descendente (ej. 7, 5, 4, 3, 2)
    this.pisos = Array.from(pisosSet).sort((a, b) => b - a);

    // Ordenar habitaciones dentro de cada piso de forma ascendente (ej. 501, 502, 503...)
    for (const p of this.pisos) {
      this.habitacionesPorPiso[p].sort((a, b) => {
        const nroA = parseInt(a.nro_habitacion, 10) || 0;
        const nroB = parseInt(b.nro_habitacion, 10) || 0;
        return nroA - nroB;
      });
    }
  }

  formatFechaSimple(fecha: string | undefined): string {
    if (!fecha) return '';
    const dateObj = moment(fecha);
    if (!dateObj.isValid()) return fecha;
    return dateObj.format('DD/MM/YYYY HH:mm');
  }
}
