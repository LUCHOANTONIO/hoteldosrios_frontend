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

export type CategoriaDisponibilidad = 'habitaciones' | 'fullday' | 'camping';

export interface GrupoDisponibilidad {
  key: CategoriaDisponibilidad;
  titulo: string;
  icono: string;
  items: DisponibilidadModel[];
  totalDisponibles: number;
  totalOcupados: number;
}

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
  grupos: GrupoDisponibilidad[] = [];
  categoriaFiltro: CategoriaDisponibilidad | null = null;
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

  ngAfterViewInit() {}

  cargarDatos() {
    forkJoin({
      list_disponibilidad: this.habitacionService.disponibilidad(this.fecha_filter)
    }).subscribe({
      next: (res) => {
        this.list_disponibilidad = res.list_disponibilidad || [];
        this.clasificarDisponibilidad();
      }
    });
  }

  clasificarDisponibilidad() {
    const habitacionesList: DisponibilidadModel[] = [];
    const fullDayList: DisponibilidadModel[] = [];
    const campingList: DisponibilidadModel[] = [];

    this.list_disponibilidad.forEach(item => {
      const tipoUpper = (item.tipo_habitacion || '').trim().toUpperCase();
      const habUpper = (item.habitacion || '').trim().toUpperCase();
      const nroUpper = (item.nro_habitacion || '').toString().trim().toUpperCase();

      const isCamping = tipoUpper.includes('CAMPING') || habUpper.includes('CAMPING') || nroUpper.includes('CAMPING');
      const isFullDay = !isCamping && (tipoUpper.includes('FULL') || habUpper.includes('FULL') || nroUpper.includes('FULL'));

      if (isCamping) {
        campingList.push(item);
      } else if (isFullDay) {
        fullDayList.push(item);
      } else {
        habitacionesList.push(item);
      }
    });

    const sortNum = (a: DisponibilidadModel, b: DisponibilidadModel) => {
      const nroA = parseInt(a.nro_habitacion || '', 10);
      const nroB = parseInt(b.nro_habitacion || '', 10);
      const aEsNum = !isNaN(nroA) && nroA > 0;
      const bEsNum = !isNaN(nroB) && nroB > 0;
      if (aEsNum && bEsNum) return nroA - nroB;
      if (aEsNum) return -1;
      if (bEsNum) return 1;
      return (a.nro_habitacion || '').localeCompare(b.nro_habitacion || '', undefined, { numeric: true });
    };

    habitacionesList.sort(sortNum);
    fullDayList.sort(sortNum);
    campingList.sort(sortNum);

    this.grupos = [
      {
        key: 'habitaciones',
        titulo: 'Habitaciones',
        icono: 'hotel',
        items: habitacionesList,
        totalDisponibles: habitacionesList.filter(h => h.estado === 'Disponible').length,
        totalOcupados: habitacionesList.filter(h => h.estado !== 'Disponible').length
      },
      {
        key: 'fullday',
        titulo: 'Full Day',
        icono: 'wb_sunny',
        items: fullDayList,
        totalDisponibles: fullDayList.filter(h => h.estado === 'Disponible').length,
        totalOcupados: fullDayList.filter(h => h.estado !== 'Disponible').length
      },
      {
        key: 'camping',
        titulo: 'Camping',
        icono: 'forest',
        items: campingList,
        totalDisponibles: campingList.filter(h => h.estado === 'Disponible').length,
        totalOcupados: campingList.filter(h => h.estado !== 'Disponible').length
      }
    ];
  }

  get gruposVisibles(): GrupoDisponibilidad[] {
    if (!this.categoriaFiltro) {
      return this.grupos;
    }
    return this.grupos.filter(g => g.key === this.categoriaFiltro);
  }

  filtrarPorCategoria(cat: CategoriaDisponibilidad): void {
    if (this.categoriaFiltro === cat) {
      this.categoriaFiltro = null;
    } else {
      this.categoriaFiltro = cat;
    }
  }

  getCantidad(key: CategoriaDisponibilidad): number {
    const g = this.grupos.find(x => x.key === key);
    return g ? g.items.length : 0;
  }

  formatFechaSimple(fecha: string | undefined): string {
    if (!fecha) return '';
    const dateObj = moment(fecha);
    if (!dateObj.isValid()) return fecha;
    return dateObj.format('DD/MM/YYYY HH:mm');
  }
}
