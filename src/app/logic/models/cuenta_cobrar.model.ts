export class CuentaCobrarModel{
    id :number;   
    fecha:string;
    reserva_id :number;
    cliente_id :number;
    forma_pago_id :number;
    correlativo: number;
    nro_habitacion: string;
    cliente: string;
    detalle: string;
    monto: number;
    pago: number;
    saldo: number;
}
