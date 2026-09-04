import { ArqueoDetalleModel } from "./arqueo_detalle.model";

export class ArqueoModel{
  id: number;
  fecha: string = "";
  caja_id: number; 
  estado_id: number;
  detalle: string = ""; 
  arqueo_detalle: ArqueoDetalleModel[] = [];
}
