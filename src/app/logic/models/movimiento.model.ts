export class MovimientoModel{
    id :number;   
    reserva_id :number;
    cliente_id :number;
    forma_pago_id :number;
    monto :number;   
    detalle :string;    
    transaccion_id?: number | null;
}
