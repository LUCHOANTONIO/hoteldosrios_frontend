import { ReservaModel } from "./reserva.model";

export class FullDayModel extends ReservaModel {
    override habitacion_id: any = null;
    is_full_day: boolean = true;
    hora_llegada: string = "09:00";
    cantidad_huesped: number = 1;
    total_pagado: number = 0;
    fecha: string = "";
    estado_reserva: string = "";
}
