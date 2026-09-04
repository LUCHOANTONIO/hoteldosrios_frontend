import { GrupoDetalleModel } from "./grupo_detalle.model";

export class GrupoModel{   
    id :number;
    reserva_id :number;   
    nombre: string;
    detalle: GrupoDetalleModel[];          
}
