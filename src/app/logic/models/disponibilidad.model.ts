export class DisponibilidadModel{
  habitacion_id: number;
  agencia: string = "";
  nro_habitacion: string = "";   
  tipo_habitacion: string = "";  
  habitacion: string = "";
  precio: number;
  estado: string = ""; 
  cliente?: string;
  fecha_ini?: string;
  fecha_fin?: string;
  reserva_id?: number;
  piso?: string;
}
