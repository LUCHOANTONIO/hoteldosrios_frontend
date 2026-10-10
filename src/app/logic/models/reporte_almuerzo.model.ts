export class ReporteAlmuerzoModel {
  reserva_id: number = 0;
  nro_reserva: number = 0;
  correlativo: number = 0;
  habitacion: string = '';
  nro_habitacion: string = '';
  cliente: string = '';
  nro_documento: string = '';
  telefono: string = '';
  fecha_ini: string = '';
  fecha_fin: string = '';
  fecha_ini_fmt: string = '';
  fecha_fin_fmt: string = '';
  estado: string = '';
  is_full_day: boolean = false;
  cantidad_adulto: number = 0;
  cantidad_ninio: number = 0;
  almuerzos_incluidos: number = 0;
  almuerzos_extras: number = 0;
  detalle_extras: string = '';
  total_almuerzos: number = 0;
  notas: string = '';
}

export interface ReporteAlmuerzoResumen {
  total_reservas: number;
  total_adultos: number;
  total_ninios: number;
  total_incluidos: number;
  total_extras: number;
  gran_total_almuerzos: number;
}

export interface ReporteAlmuerzoResponse {
  reservas: ReporteAlmuerzoModel[];
  resumen: ReporteAlmuerzoResumen;
  fecha_ini: string;
  fecha_fin: string;
}
