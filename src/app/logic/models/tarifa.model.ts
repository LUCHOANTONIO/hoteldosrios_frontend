export class TarifaModel {
    id: number;
    servicio_id: number;
    tipo_hospedaje_id: number;
    paquete_id: number;
    servicio?: string = '';
    tipo_hospedaje?: string = '';
    paquete?: string = '';
    tarifa_adulto: number = 0;
    tarifa_ninio: number = 0;
    comida_incluida: string = '';
    detalle?: string = '';
    descripcion_tarifa?: string = '';
}
