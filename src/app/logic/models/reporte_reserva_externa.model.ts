export class ReporteReservaExternaModel {
  reserva_id: number = 0;
  correlativo: number | string = 0;
  fecha_registro: string = '';
  estadia: string = '';
  servicio_habitacion: string = '';
  cliente: string = '';
  nro_documento: string = '';
  telefono: string = '';
  usuario_nombre: string = '';
  estado: string = '';
  total: number = 0;
  total_pagado: number = 0;
  saldo: number = 0;
}

export interface ReporteReservaExternaResumen {
  total_reservas: number;
  gran_total_ventas: number;
  gran_total_pagado: number;
  gran_total_saldo: number;
}

export interface ReporteReservaExternaResponse {
  reservas: ReporteReservaExternaModel[];
  resumen: ReporteReservaExternaResumen;
  usuario_nombre: string | null;
  fecha_ini: string;
  fecha_fin: string;
}
