import { PersonaModel } from "../../base/models/persona.model";

export class HuespedModel extends PersonaModel{
    huesped_id:number;
    cliente_id :number;  
    reserva_id :number;          
    pais_procedencia_id: number = 1;
    motivo_id :number;
    tipo_huesped_id :number;
    estado_huesped_id :number;
    cargo_extra :number;               
}
