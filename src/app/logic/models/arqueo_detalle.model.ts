export class ArqueoDetalleModel{
  id: number;
  arqueo_id: number; 
  forma_pago_id: number;
  nro_habitacion: string = "";
  nro_personas: string = "";
  monto: number; 
  detalle: string = "";
  factura: string = "";
  nro_factura: string = "";
  estado: string = ""; 
}
